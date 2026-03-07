const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const bcrypt = require('bcrypt');
const supabase = require('./supabaseClient');

async function updateAllPasswords() {
    const NEW_PASSWORD = 'Dsvv@123';
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(NEW_PASSWORD, salt);

    console.log('Fetching all students...');

    // Fetch all users with role 'student'
    const { data: students, error: fetchError } = await supabase
        .from('users')
        .select('id, scholar_id')
        .eq('role', 'student');

    if (fetchError) {
        console.error('Error fetching students:', fetchError);
        return;
    }

    console.log(`Found ${students.length} students. Updating passwords...`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const student of students) {
        const { error: updateError } = await supabase
            .from('users')
            .update({ password_hash: password_hash })
            .eq('id', student.id);

        if (updateError) {
            console.error(`Failed to update password for scholar_id ${student.scholar_id}:`, updateError);
            errorCount++;
        } else {
            updatedCount++;
            if (updatedCount % 20 === 0) {
                console.log(`Progress: ${updatedCount}/${students.length} updated...`);
            }
        }
    }

    console.log('\n--- Password Update Summary ---');
    console.log(`Total students found: ${students.length}`);
    console.log(`Successfully updated: ${updatedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('-------------------------------');
}

updateAllPasswords();
