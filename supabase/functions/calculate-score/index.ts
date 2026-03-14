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
        if (!authHeader) throw new Error('Missing Authorization header')

        const { quiz_id, answers } = await req.json()
        if (!quiz_id || !Array.isArray(answers)) {
            throw new Error('Paramètres manquants : quiz_id ou answers')
        }

        // Client with user's JWT (respects RLS)
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // Verify user identity
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw new Error('Non autorisé')

        // 1. Fetch quiz (RLS ensures only published quizzes are accessible by students)
        const { data: quiz, error: quizError } = await supabase
            .from('quizzes')
            .select('questions, passing_score_percentage, course_id')
            .eq('id', quiz_id)
            .single()

        if (quizError || !quiz) throw new Error('Quiz non trouvé ou accès refusé')

        // 2. Calculate score — handles both camelCase and snake_case keys from AI generation
        let correctCount = 0
        const total = quiz.questions.length

        quiz.questions.forEach((q: any, i: number) => {
            const studentAnswer = answers[i]
            const correctAnswer = q.correctAnswer ?? q.correct_answer ?? q.answer ?? ''
            if (studentAnswer && correctAnswer && studentAnswer.trim() === correctAnswer.trim()) {
                correctCount++
            }
        })

        const scorePercentage = total > 0 ? Math.round((correctCount / total) * 100) : 0
        const passed = scorePercentage >= quiz.passing_score_percentage

        // 3. Issue certificate via RPC (SECURITY DEFINER function handles auth internally)
        const { error: rpcError } = await supabase.rpc('issue_certificate_if_passed', {
            p_quiz_id: quiz_id,
            p_score: scorePercentage
        })
        if (rpcError) {
            console.warn('RPC issue_certificate_if_passed warning:', rpcError.message)
        }

        // 4. Save score to history using service role (bypasses RLS for insert)
        const adminSupabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        await adminSupabase.from('scores').insert({
            student_id: user.id,
            quiz_id: quiz_id,
            score_percentage: scorePercentage,
            passed,
        })

        return new Response(
            JSON.stringify({
                score: scorePercentage,
                correct: correctCount,
                total,
                passed,
                passing_score: quiz.passing_score_percentage,
                message: passed
                    ? `🎉 Félicitations ! Vous avez réussi avec ${scorePercentage}%. Votre certificat a été émis !`
                    : `Vous avez obtenu ${scorePercentage}%. Le minimum requis est ${quiz.passing_score_percentage}%. Ne lâchez pas !`,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        console.error('calculate-score error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
