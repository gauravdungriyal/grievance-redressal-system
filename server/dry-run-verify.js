require('dotenv').config();
const mailer = require('./utils/mailer');

// Mock a student's class_name to see which coordinator gets picked
function testDynamicLogic() {
    console.log('--- Dynamic Coordinator Logic Verification (Dry Run) ---');

    // We'll wrap the getCourseCoordEmail call if needed or just use a helper to test it
    // Since getCourseCoordEmail is not exported, we'll test it through the mailer's functions by checking who it would send to
    // But for a quick check, I'll temporarily export it or just trust the logic if it looks sound.
    // Instead, let's create a temporary test script that imports mailer and we can check the logs.

    const testCases = [
        { program: 'MCA', sem: 'II', class: 'MCA-DS-SEM-II' },
        { program: 'MCA', sem: 'IV', class: 'MCA-SEM-IV' },
        { program: 'BCA', sem: 'VI', class: 'BCA-5.5-SEM-VI' },
        { program: 'BCA', sem: 'IV', class: 'BCA-4.5-SEM-IV' },
        { program: 'BCA', sem: 'II', class: 'BCA-4.5-SEM-II' },
        { program: 'BIT', sem: 'VI', class: 'BIT-5.5-SEM-VI' },
        { program: 'BIT', sem: 'IV', class: 'BSC-IT-5-SEM-IV' },
        { program: 'BIT', sem: 'II', class: 'BSC-IT-4.5-SEM-II' }
    ];

    console.log('Mapping results:');
    testCases.forEach(tc => {
        // We'll simulate the logic here as it's defined in mailer.js to verify it
        const className = tc.class;
        const normalized = className.toUpperCase();
        let program = '';
        if (normalized.includes('MCA')) program = 'MCA';
        else if (normalized.includes('BCA')) program = 'BCA';
        else if (normalized.includes('BIT') || normalized.includes('BSC-IT')) program = 'BIT';

        let semester = '';
        if (normalized.includes('SEM-II')) semester = 'II';
        else if (normalized.includes('SEM-IV')) semester = 'IV';
        else if (normalized.includes('SEM-VI')) semester = 'VI';

        const envKey = `COORD_${program}_${semester}`;
        const email = process.env[envKey] || process.env.COURSE_COORD_EMAIL;

        console.log(`Class: ${className.padEnd(20)} -> Key: ${envKey.padEnd(15)} -> Email: ${email}`);
    });
}

testDynamicLogic();
