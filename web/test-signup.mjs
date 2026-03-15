import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://sbjttffctciepdqotnnc.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // We'll grep it from .env.local
);

async function run() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test' + Date.now() + '@example.com',
    password: 'password123',
    options: {
      data: { role: 'student' }
    }
  });
  console.log("Data:", data, "Error:", error);
}

run();
