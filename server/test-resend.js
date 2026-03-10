require('dotenv').config();
const { Resend } = require('resend');

async function testResend() {
    console.log('--- Resend API Verification ---');
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '********' : 'NOT SET');

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_your_api_key_here') {
        console.error('ERROR: RESEND_API_KEY is not set correctly in .env');
        console.log('Please get your API key from https://resend.com and add it to .env');
        return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        console.log('Attempting to send a test email via HTTP...');
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: 'delivered@resend.dev', // Resend testing email
            subject: 'System Test: Resend API is Working!',
            html: '<p>If you see this, the Grievance System can now send emails from Render!</p>'
        });

        if (error) {
            console.error('API Error:', error);
            return;
        }

        console.log('Success! Email ID:', data.id);
        console.log('The Resend API is properly configured and can bypass Render\'s firewall.');
    } catch (err) {
        console.error('Unexpected Error:', err);
    }
}

testResend();
