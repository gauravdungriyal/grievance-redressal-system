require('dotenv').config({ path: './.env' });
const nodemailer = require('nodemailer');

const testSMTP = async () => {
    console.log('Starting SMTP test...');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    // Don't log password for security, but check if it exists
    console.log('SMTP_PASS exists:', !!process.env.SMTP_PASS);

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
    } catch (error) {
        console.error('❌ SMTP connection failed:');
        console.error('Name:', error.name);
        console.error('Message:', error.message);
        console.error('Code:', error.code);
        console.error('Command:', error.command);
        console.error('Response:', error.response);

        if (error.code === 'EAUTH') {
            console.log('\nPossible causes for authentication failure:');
            console.log('1. Incorrect email or password (check .env).');
            console.log('2. If using Gmail, you MUST use an "App Password" (16 characters), not your regular password.');
            console.log('3. "Less secure apps" access is no longer supported by Google.');
        } else if (error.code === 'ESOCKET') {
            console.log('\nPossible causes for socket error:');
            console.log('1. Firewall or ISP blocking port 587.');
            console.log('2. Incorrect SMTP host.');
        }
    }
};

testSMTP();
