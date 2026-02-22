require('dotenv').config();
const bcrypt = require('bcrypt');
const supabase = require('./supabaseClient');

async function seedAdmin() {
    const adminData = {
        scholar_id: '23144007',
        password: 'G@urav08dung',
        role: 'admin',
        name: 'System Admin',
        email: 'admin@csdept.com'
    };

    try {
        // Check if admin already exists
        const { data: existingAdmin } = await supabase
            .from('users')
            .select('*')
            .eq('scholar_id', adminData.scholar_id)
            .single();

        if (existingAdmin) {
            console.log('Admin user already exists.');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(adminData.password, salt);

        const { error } = await supabase
            .from('users')
            .insert([
                {
                    name: adminData.name,
                    scholar_id: adminData.scholar_id,
                    email: adminData.email,
                    password_hash,
                    role: adminData.role
                }
            ]);

        if (error) {
            console.error('Error seeding admin:', error.message);
        } else {
            console.log('Default admin seeded successfully.');
        }
    } catch (err) {
        console.error('Seeding script failed:', err.message);
    }
}

seedAdmin();
