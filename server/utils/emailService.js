const nodemailer = require('nodemailer');
const dns = require('dns');

// Force Node.js to prefer IPv4 over IPv6 globally
// This is critical for environments like Render where IPv6 might be unreachable
if (typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
}

let transporter = null;
let isTestAccount = false;

// Initialize the transporter asynchronously
const initTransporter = async () => {
    try {
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            // Use real credentials if provided
            const smtpConfig = {
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: 587, // Force port 587 for better compatibility on Render
                secure: false, // Must be false for port 587
                family: 4, // FORCE IPv4 to avoid Render's IPv6 routing issues (ENETUNREACH)
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                tls: {
                    rejectUnauthorized: false,
                    minVersion: 'TLSv1.2'
                }
            };

            // REMOVED service: 'gmail' as it defaults to port 465/IPv6 which fails on Render

            transporter = nodemailer.createTransport(smtpConfig);
            console.log(`[DEBUG] Initializing SMTP with host: ${smtpConfig.host}, port: ${smtpConfig.port}, family: IPv4`);

            // Verify connection configuration
            await transporter.verify();
            console.log('SMTP transporter verified and ready to send emails.');
        } else {
            // Generate test credentials automatically
            console.log('No valid SMTP credentials found. Generating Ethereal test account...');
            const testAccount = await nodemailer.createTestAccount();
            isTestAccount = true;
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            console.log('Ethereal test account automatically generated and ready.');
        }
    } catch (err) {
        console.error('Failed to initialize nodemailer transporter:');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        console.error('Error Code:', err.code);
        console.error('Error Command:', err.command);
        transporter = null; // Ensure transporter is null if it fails to verify
    }
};

initTransporter();

/**
 * Sends an email notification to admin users about a new complaint.
 * 
 * @param {Object} complaintData - The details of the newly created complaint
 * @param {Array<string>} adminEmails - An array of admin email addresses
 */
const sendAdminNotification = async (complaintData, adminEmails) => {
    if (!adminEmails || adminEmails.length === 0) {
        console.log('DEBUG: sendAdminNotification exit - adminEmails is empty or null.');
        return;
    }

    if (!transporter) {
        console.log('DEBUG: sendAdminNotification exit - transporter is null.');
        return;
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"GRS Support" <no-reply@csdept.com>',
            to: adminEmails.join(','),
            subject: `New Complaint Raised: ${complaintData.complaint_id}`,
            text: `A new complaint has been raised.\n\nDetails:\nComplaint ID: ${complaintData.complaint_id}\nStudent Name: ${complaintData.student_name}\nScholar ID: ${complaintData.scholar_id}\nLab: ${complaintData.lab || 'N/A'}\nCategory: ${complaintData.category}\nTitle: ${complaintData.title}\nPriority: ${complaintData.priority}\n\nPlease review it in the admin dashboard.`,
            html: `
                <h3>New Complaint Raised</h3>
                <p>A new complaint has been raised.</p>
                <ul>
                    <li><strong>Complaint ID:</strong> ${complaintData.complaint_id}</li>
                    <li><strong>Student Name:</strong> ${complaintData.student_name}</li>
                    <li><strong>Scholar ID:</strong> ${complaintData.scholar_id}</li>
                    <li><strong>Lab:</strong> ${complaintData.lab || 'N/A'}</li>
                    <li><strong>Category:</strong> ${complaintData.category}</li>
                    <li><strong>Title:</strong> ${complaintData.title}</li>
                    <li><strong>Priority:</strong> ${complaintData.priority}</li>
                </ul>
                <p>Please review it in the admin dashboard.</p>
            `,
        };

        console.log(`[DEBUG] Attempting to sendMail to: ${mailOptions.to}, from: ${mailOptions.from}`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email notification sent to admins: ${info.messageId}`);

        if (isTestAccount) {
            console.log(`Preview test email URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
    } catch (error) {
        console.error('Error sending email notification to admins:', error);
    }
};

/**
 * Sends an email with a verification link to a newly registered user.
 * 
 * @param {string} userEmail - The email address of the user
 * @param {string} userName - The name of the user
 * @param {string} verificationToken - The unique token for verification
 */
const sendVerificationEmail = async (userEmail, userName, verificationToken) => {
    if (!userEmail || !transporter) {
        console.log('Cannot send verification email: missing email or transporter not ready.');
        return;
    }

    // Assuming the frontend runs on port 5500 or the Vercel deployed URL
    // For development, we'll point it to the backend api which will redirect.
    const verificationUrl = `https://grievance-redressal-system-udzc.onrender.com/api/auth/verify/${verificationToken}`;

    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"GRS Support" <no-reply@csdept.com>',
            to: userEmail,
            subject: 'Verify your Grievance System Account',
            text: `Hi ${userName},\n\nPlease verify your email address by clicking the following link:\n${verificationUrl}\n\nIf you did not request this, please ignore this email.`,
            html: `
                <h3>Welcome to the Grievance Redressal System!</h3>
                <p>Hi ${userName},</p>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${verificationUrl}" style="padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                <p>Or copy and paste this link into your browser:</p>
                <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                <p><small>If you did not register for this account, please ignore this email.</small></p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${userEmail}: ${info.messageId}`);

        if (isTestAccount) {
            console.log(`Preview test email URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
    } catch (error) {
        console.error('Error sending verification email:', error);
    }
};

/**
 * Sends an email to the student when their complaint status is updated.
 * 
 * @param {string} userEmail - The email address of the student
 * @param {string} userName - The name of the student
 * @param {Object} complaintData - The details of the updated complaint
 */
const sendStatusUpdateEmail = async (userEmail, userName, complaintData) => {
    if (!userEmail || !transporter) {
        console.log('Cannot send status update email: missing email or transporter not ready.');
        return;
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"GRS Support" <no-reply@csdept.com>',
            to: userEmail,
            subject: `Update on your Complaint: ${complaintData.complaint_id}`,
            text: `Hi ${userName},\n\nThere has been an update regarding your complaint (${complaintData.complaint_id}).\n\nTitle: ${complaintData.title}\nNew Status: ${complaintData.status}\nAssigned To: ${complaintData.assigned_to || 'N/A'}\nResolution Note: ${complaintData.resolution_note || 'N/A'}\n\nPlease check your dashboard for more details.`,
            html: `
                <h3>Complaint Status Update</h3>
                <p>Hi ${userName},</p>
                <p>There has been an update regarding your recent complaint.</p>
                <ul>
                    <li><strong>Complaint ID:</strong> ${complaintData.complaint_id}</li>
                    <li><strong>Title:</strong> ${complaintData.title}</li>
                    <li><strong>New Status:</strong> <span style="color: ${complaintData.status === 'Resolved' ? 'green' : (complaintData.status === 'In Progress' ? 'orange' : 'black')}; font-weight: bold;">${complaintData.status}</span></li>
                    <li><strong>Assigned To:</strong> ${complaintData.assigned_to || 'N/A'}</li>
                    <li><strong>Resolution Note:</strong> ${complaintData.resolution_note || 'N/A'}</li>
                </ul>
                <p>Please log in to your dashboard to view more details.</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Status update email sent to ${userEmail}: ${info.messageId}`);

        if (isTestAccount) {
            console.log(`Preview test email URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
    } catch (error) {
        console.error('Error sending status update email:', error);
    }
};

module.exports = { sendAdminNotification, sendVerificationEmail, sendStatusUpdateEmail };
