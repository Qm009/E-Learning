import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { quiz_id, answers } = body;

        // Extract the user token from the authorization header
        const authHeader = req.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
        }
        const token = authHeader.replace('Bearer ', '');

        // Initialize Supabase Client (needs NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

        // Use user's token directly so RLS applies
        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: {
                headers: { Authorization: `Bearer ${token}` }
            }
        });

        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) {
            return NextResponse.json({ error: 'Unauthorized', details: userError }, { status: 401 });
        }

        // Fetch the quiz and its questions
        const { data: quiz, error: quizError } = await supabase
            .from('quizzes')
            .select('*, courses(title)')
            .eq('id', quiz_id)
            .single();

        if (quizError || !quiz) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }

        const questions = quiz.questions;
        let correctAnswersCount = 0;

        // Calculate score
        for (let i = 0; i < questions.length; i++) {
            const studentAnswer = answers[i];
            const correctAnswer = questions[i].correctAnswer;

            if (studentAnswer === correctAnswer) {
                correctAnswersCount++;
            }
        }

        const totalQuestions = questions.length;
        const scorePercentage = Math.round((correctAnswersCount / totalQuestions) * 100);
        const passed = scorePercentage >= quiz.passing_score_percentage;

        // Save the score in the database
        const { error: insertScoreError } = await supabase
            .from('scores')
            .insert({
                quiz_id,
                student_id: user.id,
                score_percentage: scorePercentage,
            });

        if (insertScoreError) {
            console.error('Error inserting score:', insertScoreError);
            // It's okay if we fail to save the score. We still want to return the result.
        }

        // Generate a certificate if the student passed
        if (passed) {
            const code = `CERT-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
            const { error: insertCertError } = await supabase
                .from('certificates')
                .insert({
                    student_id: user.id,
                    course_id: quiz.course_id,
                    certificate_code: code,
                    score: scorePercentage
                });
            if (insertCertError) {
                console.error('Error issuing certificate:', insertCertError);
            }
        }

        return NextResponse.json({
            score: scorePercentage,
            correct: correctAnswersCount,
            total: totalQuestions,
            passed: passed,
            message: passed ? 'Excellent travail !' : 'N\'abandonnez pas, réessayez !',
            passing_score: quiz.passing_score_percentage
        });

    } catch (error: any) {
        console.error('Server error in calculate-score API:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
