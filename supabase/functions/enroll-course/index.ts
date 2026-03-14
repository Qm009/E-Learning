import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) throw new Error('Authorization header manquant')

        // Client with user JWT (respects RLS)
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // Verify user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw new Error('Non autorisé')

        const { course_id } = await req.json()
        if (!course_id) throw new Error('course_id manquant')

        // Verify the course exists and is published (RLS will also enforce this)
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('id, title, status')
            .eq('id', course_id)
            .eq('status', 'published')
            .single()

        if (courseError || !course) {
            throw new Error('Cours introuvable ou non publié')
        }

        // Verify user profile exists and is a student
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError || !profile) throw new Error('Profil introuvable')
        if (profile.role === 'teacher') {
            throw new Error('Les professeurs ne peuvent pas s\'inscrire à des cours')
        }

        // Insert enrollment (ON CONFLICT DO NOTHING avoids duplicate error)
        const adminSupabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { data: enrollment, error: enrollError } = await adminSupabase
            .from('enrollments')
            .upsert(
                {
                    student_id: user.id,
                    course_id: course_id,
                    progress: 0,
                    status: 'in_progress',
                },
                { onConflict: 'student_id,course_id', ignoreDuplicates: true }
            )
            .select()
            .single()

        if (enrollError) throw enrollError

        return new Response(
            JSON.stringify({
                success: true,
                message: `Inscription réussie au cours : ${course.title}`,
                enrollment,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error: any) {
        console.error('enroll-course error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
