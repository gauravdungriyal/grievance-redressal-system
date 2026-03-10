const nodemailer = require('nodemailer');
const dns = require('dns');

// Force IPv4 globally for this module
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

// Initialize transporter (Lazy initialization to allow for async IP resolution)
let transporter = null;

const getTransporter = async () => {
    if (transporter) return transporter;

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    let resolvedHost = host;

    // Aggressive IPv4 Force: Resolve smtp.gmail.com to a direct IPv4 address
    // This bypasses DNS-level IPv6 preference in Node/Cloud environments
    try {
        const addresses = await dns.promises.resolve4(host);
        if (addresses && addresses.length > 0) {
            resolvedHost = addresses[0];
            console.log(`[MAILING] Aggressive Fix: Resolved ${host} to direct IPv4 ${resolvedHost}`);
        }
    } catch (dnsErr) {
        console.warn(`[MAILING] DNS Resolve4 failed for ${host}, falling back to hostname.`, dnsErr.message);
    }

    const port = parseInt(process.env.SMTP_PORT) || 465;
    const isSecure = (port === 465);

    transporter = nodemailer.createTransport({
        host: resolvedHost,
        port: port,
        secure: isSecure,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        // Still provide lookup as a fallback
        lookup: (hostname, options, callback) => {
            dns.lookup(hostname, { family: 4 }, (err, address, family) => {
                callback(err, address, family);
            });
        },
        family: 4,
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
        tls: {
            // Necessary because we are connecting via IP, which might not match the cert common name
            servername: host,
            rejectUnauthorized: false // Temporary debug measure for Render
        }
    });

    return transporter;
};

/**
 * Base helper to send email via SMTP
 */
const sendEmail = async ({ to, cc, subject, html, fromName }) => {
    const displayName = fromName || process.env.FROM_NAME || 'Grievance System';
    const portUsed = process.env.SMTP_PORT || 465;
    const mailOptions = {
        from: `"${displayName}" <${process.env.SMTP_USER}>`,
        to,
        cc,
        subject,
        html
    };

    console.log(`[MAILING] Attempting to send email via SMTP (Port ${portUsed}). To: ${to}, CC: ${cc || 'none'}, Subject: ${subject}`);

    try {
        const mailTransporter = await getTransporter();
        const info = await mailTransporter.sendMail(mailOptions);
        console.log('[MAILING] Success: ' + info.response);
        return info;
    } catch (error) {
        console.error('[MAILING] ERROR sending email:', error);
        return null;
    }
};

/**
 * Helper: Get Course Coordinator Email based on class_name
 */
const getCourseCoordEmail = (className) => {
    if (!className) return process.env.COURSE_COORD_EMAIL;

    const normalized = className.toUpperCase();

    // Logic: Map program and semester to env variables
    // Format usually: MCA-DS-SEM-II or BCA-5.5-SEM-VI or BIT-5.5-SEM-VI

    let program = '';
    if (normalized.includes('MCA')) program = 'MCA';
    else if (normalized.includes('BCA')) program = 'BCA';
    else if (normalized.includes('BIT') || normalized.includes('BSC-IT')) program = 'BIT';

    let semester = '';
    if (normalized.includes('SEM-II')) semester = 'II';
    else if (normalized.includes('SEM-IV')) semester = 'IV';
    else if (normalized.includes('SEM-VI')) semester = 'VI';

    if (program && semester) {
        const envKey = `COORD_${program}_${semester}`;
        const email = process.env[envKey];
        if (email) {
            console.log(`[MAILING] Dynamic Coordinator Found: ${program} ${semester} -> ${email}`);
            return email;
        } else {
            console.log(`[MAILING] Dynamic Coordinator NOT SET for ${program} ${semester}. Using fallback.`);
        }
    }

    return process.env.COURSE_COORD_EMAIL;
};

/**
 * Template Helper: Get Lab Coordinator Email
 */
const getLabCoordEmail = (lab) => {
    switch (lab) {
        case 'BSC IT Lab':
        case 'BIT Lab':
            return process.env.LAB_COORD_BSCIT;
        case 'BCA Lab':
            return process.env.LAB_COORD_BCA;
        case 'MCA Lab':
            return process.env.LAB_COORD_MCA;
        default:
            return process.env.COURSE_COORD_EMAIL; // Fallback
    }
};

/**
 * HTML Template Wrapper
 */
const emailTemplate = (title, content, actionLabel, actionUrl) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 0.8rem; color: #6b7280; }
        .button { background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; font-weight: 600; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-inprogress { background: #dcfce7; color: #166534; }
        .status-resolved { background: #dcfce7; color: #166534; }
        .status-rejected { background: #fee2e2; color: #991b1b; }
        .details { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .details b { color: #4b5563; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
        </div>
        <div class="content">
            ${content}
            ${actionLabel && actionUrl ? `<div style="text-align: center;"><a href="${actionUrl}" class="button">${actionLabel}</a></div>` : ''}
        </div>
        <div class="footer">
            <p>This is an automated notification from the Grievance Redressal System.</p>
            <p>&copy; ${new Date().getFullYear()} CS Department</p>
        </div>
    </div>
</body>
</html>
`;

/**
 * 1. Notify Lab Coordinator of New Complaint
 */
const notifyNewComplaint = async (student, complaint) => {
    const labCoord = getLabCoordEmail(complaint.lab);
    const courseCoord = getCourseCoordEmail(student.class_name);

    // CC the student so they know it was received
    const ccList = courseCoord ? `${courseCoord},${student.email}` : student.email;

    const html = emailTemplate(
        'New Grievance Submitted',
        `
        <p>Hello Coordinator,</p>
        <p>A new grievance has been submitted by <b>${student.name}</b> (${student.scholar_id}).</p>
        <div class="details">
            <p><b>Complaint ID:</b> ${complaint.complaint_id}</p>
            <p><b>Category:</b> ${complaint.category}</p>
            <p><b>Lab/Location:</b> ${complaint.lab || 'N/A'}</p>
            <p><b>PC Number:</b> ${complaint.pc_number || 'N/A'}</p>
            <p><b>Title:</b> ${complaint.title}</p>
        </div>
        <p>Please review and take appropriate action.</p>
        `,
        'Manage Grievance',
        `${process.env.APP_URL || 'http://localhost:5000'}/admin`
    );

    return sendEmail({
        to: labCoord,
        cc: ccList,
        subject: `New Grievance: ${complaint.complaint_id} - ${complaint.title}`,
        html,
        fromName: 'Grievance System'
    });
};

/**
 * 2. Notify IT Support of Approved Complaint
 */
const notifyApproval = async (student, complaint) => {
    const itSupport = process.env.IT_SUPPORT_EMAIL;

    const html = emailTemplate(
        'Action Required: Approved Grievance',
        `
        <p>Hello IT Support Team,</p>
        <p>A grievance has been approved by the Lab Coordinator and requires your attention.</p>
        <div class="details">
            <p><b>Complaint ID:</b> ${complaint.complaint_id}</p>
            <p><b>Student:</b> ${student.name} (${student.scholar_id})</p>
            <p><b>Lab/Location:</b> ${complaint.lab || 'N/A'}</p>
            <p><b>PC Number:</b> ${complaint.pc_number || 'N/A'}</p>
            <p><b>Issue:</b> ${complaint.title}</p>
            <p><b>Details:</b> ${complaint.description}</p>
        </div>
        <p>Please resolve the issue as soon as possible.</p>
        `,
        'View Dashboard',
        `${process.env.APP_URL || 'http://localhost:5000'}/admin`
    );

    return sendEmail({
        to: itSupport,
        subject: `IT SUPPPORT: Task Assigned - ${complaint.complaint_id}`,
        html,
        fromName: 'Lab Coordinator'
    });
};

/**
 * 3. Notify Student of Declined Complaint
 */
const notifyDecline = async (student, complaint, reason) => {
    const courseCoord = getCourseCoordEmail(student.class_name);

    const html = emailTemplate(
        'Grievance Status Update: Rejected',
        `
        <p>Hello ${student.name},</p>
        <p>Your grievance has been reviewed by the Lab Coordinator and was unfortunately <b>rejected</b>.</p>
        <div class="details">
            <p><b>Complaint ID:</b> ${complaint.complaint_id}</p>
            <p><b>Status:</b> <span class="status-badge status-rejected">Rejected</span></p>
            <p><b>Reason for Rejection:</b> ${reason || 'No specific reason provided.'}</p>
        </div>
        <p>If you have questions, please contact your Lab Coordinator or Course Coordinator.</p>
        `,
        'View My Dashboard',
        `${process.env.APP_URL || 'http://localhost:5000'}`
    );

    return sendEmail({
        to: student.email,
        cc: courseCoord,
        subject: `Update on your Grievance: ${complaint.complaint_id}`,
        html,
        fromName: 'Lab Coordinator'
    });
};

/**
 * 4. Notify Student of Resolution
 */
const notifyResolution = async (student, complaint) => {
    const courseCoord = getCourseCoordEmail(student.class_name);
    const labCoord = getLabCoordEmail(complaint.lab);

    const html = emailTemplate(
        'Grievance Resolved! 🎉',
        `
        <p>Hello ${student.name},</p>
        <p>Good news! Your grievance has been marked as <b>Resolved</b> by the IT Support team.</p>
        <div class="details">
            <p><b>Complaint ID:</b> ${complaint.complaint_id}</p>
            <p><b>Issue:</b> ${complaint.title}</p>
            <p><b>Status:</b> <span class="status-badge status-resolved">Resolved</span></p>
            <p><b>Resolution Note:</b> ${complaint.resolution_note || 'Issue fixed.'}</p>
        </div>
        <p>We hope the service was satisfactory.</p>
        `,
        'Check Dashboard',
        `${process.env.APP_URL || 'http://localhost:5000'}`
    );

    return sendEmail({
        to: student.email,
        cc: `${courseCoord},${labCoord}`,
        subject: `Resolved: Your Grievance ${complaint.complaint_id}`,
        html,
        fromName: 'IT Support Team'
    });
};

module.exports = {
    notifyNewComplaint,
    notifyApproval,
    notifyDecline,
    notifyResolution
};
