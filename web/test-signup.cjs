require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
    const email = `test${Date.now()}@example.com`;
    console.log('Testing signup with', email);

    const { data, error } = await supabase.auth.signUp({
        email,
        password: 'password123',
        options: {
            data: { role: 'student' }
        }
    });
    console.log("Data:", data, "Error:", error);
    process.exit(0);
}

run();
