require('dotenv').config();
const mailer = require('./utils/mailer');

async function testMailer() {
    console.log('--- Mailer Verification ---');
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASS:', process.env.SMTP_PASS ? '********' : 'NOT SET');
    console.log('COURSE_COORD_EMAIL:', process.env.COURSE_COORD_EMAIL);

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('ERROR: SMTP credentials not found in .env');
        return;
    }

    const dummyStudent = {
        name: 'Test Student',
        scholar_id: 'TEST001',
        email: process.env.SMTP_USER // Send to self for testing
    };

    const dummyComplaint = {
        complaint_id: 'CSD-2026-TEST',
        category: 'PC Not Working',
        lab: 'BSC IT Lab',
        title: 'Keyboard Keys Missing',
        description: 'Several keys on the keyboard are missing since morning.'
    };

    console.log('\nTesting: notifyNewComplaint...');
    await mailer.notifyNewComplaint(dummyStudent, dummyComplaint);

    console.log('\nTesting: notifyApproval...');
    await mailer.notifyApproval(dummyStudent, dummyComplaint);

    console.log('\nTesting: notifyDecline...');
    await mailer.notifyDecline(dummyStudent, dummyComplaint, 'Please provide more details about the PC location.');

    console.log('\nTesting: notifyResolution...');
    await mailer.notifyResolution(dummyStudent, dummyComplaint);

    console.log('\n--- Verification Script Finished ---');
    console.log('Check your inbox (and CCs) if credentials were correct.');
}

testMailer();
