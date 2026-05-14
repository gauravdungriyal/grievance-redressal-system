require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('./supabaseClient');

async function testLogin() {
    console.log('--- Debugging Login Process ---');
    const scholar_id = '23144007';
    const password = 'G@urav08dung';

    console.log('1. Checking Supabase connection for scholar_id:', scholar_id);
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('scholar_id', scholar_id)
            .single();

        if (error) {
            console.error('Supabase Error:', error);
            return;
        }

        if (!user) {
            console.log('User not found in database.');
            return;
        }

        console.log('2. User found:', user.name, '| Role:', user.role);
        
        const passwordsToTry = ['G@urav08dung', 'Dsvv@123', 'admin', 'password'];
        let matchedPassword = null;

        console.log('3. Comparing passwords...');
        for (const pwd of passwordsToTry) {
            const isMatch = await bcrypt.compare(pwd, user.password_hash);
            if (isMatch) {
                matchedPassword = pwd;
                break;
            }
        }

        if (matchedPassword) {
            console.log('Password match SUCCESS with:', matchedPassword);
        } else {
            console.log('No known passwords matched the hash in the database.');
        }

        console.log('4. Signing JWT...');
        const payload = { id: user.id, role: user.role };
        const secret = process.env.JWT_SECRET;
        
        if (!secret) {
            console.error('JWT_SECRET is missing from environment!');
            return;
        }

        console.log('JWT_SECRET starts with:', secret.substring(0, 5) + '...');

        jwt.sign(payload, secret, { expiresIn: '24h' }, (err, token) => {
            if (err) {
                console.error('JWT Sign Error:', err);
            } else {
                console.log('JWT Token generated successfully!');
                process.exit(0);
            }
        });

    } catch (err) {
        console.error('Fatal Catch Block:', err);
    }
}

testLogin();
