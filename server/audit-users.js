require('dotenv').config({ path: './server/.env' });
const supabase = require('./supabaseClient');

async function auditUsers() {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('id, name, scholar_id, email, role');

        if (error) throw error;

        console.log('--- User Audit ---');
        console.table(users);

        const admins = users.filter(u => u.role === 'admin');
        console.log('\n--- Admins Found ---');
        console.table(admins);

        if (admins.length === 0) {
            console.log('\n⚠️ WARNING: No users with "admin" role found!');
        } else {
            console.log(`\nFound ${admins.length} admin(s).`);
            admins.forEach(admin => {
                if (admin.email === 'admin@csdept.com') {
                    console.log(`ℹ️ Admin "${admin.name}" has a default/mock email: ${admin.email}`);
                }
            });
        }
    } catch (err) {
        console.error('Audit failed:', err.message);
    }
}

auditUsers();
