import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sbjttffctciepdqotnnc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNianR0ZmZjdGNpZXBkcW90bm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjgyMTQsImV4cCI6MjA4ODY0NDIxNH0.vTv2O6pZ7SQX7PIrzAGmV91CYPM-pGjAali3TMtHUec';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
