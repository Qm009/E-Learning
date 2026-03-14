import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function publishAllCourses() {
    const { data, error } = await supabase
        .from('courses')
        .update({ status: 'published' })
        .neq('status', 'published')

    if (error) {
        console.error('Error publishing courses:', error)
    } else {
        console.log('Successfully published all draft courses.')
    }
}

publishAllCourses()
