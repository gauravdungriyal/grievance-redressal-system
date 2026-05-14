require('dotenv').config();
const bcrypt = require('bcrypt');
const supabase = require('./supabaseClient');

const coordinators = [
    { name: 'Swapnil Gaidhani', email: 'swapnil.gaidhani@dsvv.ac.in', dept: 'MCA', id: 'swapnil.gaidhani' },
    { name: 'Geetanjali Gaidhani', email: 'geetanjali.gaidhani@dsvv.ac.in', dept: 'BCA', id: 'geetanjali.gaidhani' },
    { name: 'Eishita Gupta', email: 'eishita.gupta@dsvv.ac.in', dept: 'BCA', id: 'eishita.gupta' },
    { name: 'Hemant Kumar Singh', email: 'hemantkumar.singh@dsvv.ac.in', dept: 'BSC-IT', id: 'hemant.singh' },
    { name: 'Soni Sharma', email: 'soni.sharma@dsvv.ac.in', dept: 'BSC-IT', id: 'soni.sharma' },
    { name: 'Anuradha Sharma', email: 'anuradha.sharma@dsvv.ac.in', dept: 'BSC-IT', id: 'anuradha.sharma' }
];

async function seedCoordinators() {
    const DEFAULT_PASSWORD = 'kg867gjnki';
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(DEFAULT_PASSWORD, salt);

    console.log('Updating coordinator accounts with new usernames and passwords...');

    for (const coord of coordinators) {
        try {
            // Check if exists by email
            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .eq('email', coord.email)
                .single();

            if (existing) {
                // Update existing record
                const { error } = await supabase
                    .from('users')
                    .update({
                        scholar_id: coord.id,
                        password_hash: password_hash,
                        name: coord.name,
                        department: coord.dept
                    })
                    .eq('email', coord.email);

                if (error) console.error(`Error updating ${coord.name}:`, error.message);
                else console.log(`Coordinator ${coord.name} updated successfully.`);
            } else {
                // Insert new record
                const { error } = await supabase
                    .from('users')
                    .insert([
                        {
                            name: coord.name,
                            email: coord.email,
                            scholar_id: coord.id,
                            password_hash,
                            role: 'admin',
                            department: coord.dept,
                            is_verified: true
                        }
                    ]);

                if (error) console.error(`Error creating ${coord.name}:`, error.message);
                else console.log(`Coordinator ${coord.name} created successfully.`);
            }
        } catch (err) {
            console.error(`Unexpected error for ${coord.name}:`, err.message);
        }
    }
    console.log('Finished updating coordinators.');
}

seedCoordinators();
