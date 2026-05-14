const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL ? process.env.SUPABASE_URL.replace(/['"]/g, '') : null;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.replace(/['"]/g, '') : null;

if (!supabaseUrl || !supabaseKey) {
    console.error('[Supabase Client] Missing environment variables!');
    console.error('URL Present:', !!supabaseUrl);
    console.error('Key Present:', !!supabaseKey);
    throw new Error('Missing Supabase environment variables. Check your .env file.');
}

let supabase;
try {
    supabase = createClient(supabaseUrl, supabaseKey);
} catch (err) {
    console.error('[Supabase Client] Failed to initialize client:', err.message);
    throw err;
}

module.exports = supabase;
