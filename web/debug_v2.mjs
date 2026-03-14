import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://sbjttffctciepdqotnnc.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNianR0ZmZjdGNpZXBkcW90bm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjgyMTQsImV4cCI6MjA4ODY0NDIxNH0.vTv2O6pZ7SQX7PIrzAGmV91CYPM-pGjAali3TMtHUec'
)

async function debug() {
    console.log('--- PROFILES ---')
    const { data: p, error: ep } = await supabase.from('profiles').select('*')
    console.log(JSON.stringify(p, null, 2))
    if (ep) console.error('Profiles Error:', ep)

    console.log('--- MATERIALS ---')
    const { data: m, error: em } = await supabase.from('course_materials').select('*')
    console.log(JSON.stringify(m, null, 2))
    if (em) console.error('Materials Error:', em)

    console.log('--- COURSES ---')
    const { data: c, error: ec } = await supabase.from('courses').select('id, title, status')
    console.log(JSON.stringify(c, null, 2))
}

debug()
