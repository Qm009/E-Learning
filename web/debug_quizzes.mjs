import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://sbjttffctciepdqotnnc.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNianR0ZmZjdGNpZXBkcW90bm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNjgyMTQsImV4cCI6MjA4ODY0NDIxNH0.vTv2O6pZ7SQX7PIrzAGmV91CYPM-pGjAali3TMtHUec'
)

async function debugQuizzes() {
    console.log('--- ENROLLMENTS ---')
    const { data: e, error: ee } = await supabase.from('enrollments').select('*')
    console.log(JSON.stringify(e, null, 2))
    if (ee) console.error('Enrollments Error:', ee)

    console.log('--- QUIZZES ---')
    const { data: q, error: eq } = await supabase.from('quizzes').select('*')
    console.log(JSON.stringify(q, null, 2))
    if (eq) console.error('Quizzes Error:', eq)

    console.log('--- COURSES ---')
    const { data: c, error: ec } = await supabase.from('courses').select('id, title, status')
    console.log(JSON.stringify(c, null, 2))
    if (ec) console.error('Courses Error:', ec)
}

debugQuizzes()
