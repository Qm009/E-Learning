'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    ChevronRight,
    ChevronLeft,
    BrainCircuit,
    Trophy,
    CircleX,
    CheckCircle2,
    Home,
    RotateCcw,
    Loader2,
    Award
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

function Sparkles(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
        </svg>
    )
}

type QuizResult = {
    score: number
    correct: number
    total: number
    passed: boolean
    message: string
    passing_score: number
}

export default function QuizPlayer() {
    const { id } = useParams()
    const [quiz, setQuiz] = useState<any>(null)
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<string[]>([])
    const [isFinished, setIsFinished] = useState(false)
    const [result, setResult] = useState<QuizResult | null>(null)
    const [loading, setLoading] = useState(true)
    const [aiFeedback, setAiFeedback] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')

    const supabase = createClient()

    useEffect(() => {
        async function fetchQuiz() {
            const { data, error } = await supabase
                .from('quizzes')
                .select('*, courses(title)')
                .eq('id', id)
                .single()

            if (error) {
                console.error('Error fetching quiz:', error)
            }
            if (data) {
                setQuiz(data)
                setAnswers(new Array(data.questions.length).fill(''))
            }
            setLoading(false)
        }
        fetchQuiz()
    }, [id])

    const handleOptionSelect = (option: string) => {
        const newAnswers = [...answers]
        newAnswers[currentStep] = option
        setAnswers(newAnswers)
    }

    const finishQuiz = async () => {
        setIsSubmitting(true)
        setSubmitError('')
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Session expirée. Veuillez vous reconnecter.')

            // 1. Call the Edge Function to calculate score securely
            const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/calculate-score`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ quiz_id: id, answers })
            })

            const data = await res.json()

            if (!res.ok || data.error) {
                throw new Error(data.error || 'Erreur serveur lors du calcul.')
            }

            setResult({
                score: data.score,
                correct: data.correct ?? 0,
                total: data.total ?? quiz.questions.length,
                passed: data.passed,
                message: data.message,
                passing_score: data.passing_score ?? quiz.passing_score_percentage,
            })
            setIsFinished(true)

            // 2. Optional AI feedback (non-blocking)
            try {
                const feedbackRes = await fetch('/api/quiz/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        quizTitle: quiz.title,
                        score: data.score,
                        total: data.total ?? quiz.questions.length,
                        passed: data.passed
                    })
                })
                const feedbackData = await feedbackRes.json()
                setAiFeedback(feedbackData.feedback || '')
            } catch {
                setAiFeedback('')
            }

        } catch (e: any) {
            console.error('Quiz submission error:', e)
            setSubmitError(e.message || 'Erreur lors de la soumission du quiz.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        )
    }

    if (!quiz) {
        return (
            <div className="text-center py-20">
                <CircleX className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Quiz introuvable.</h2>
                <Link href="/dashboard/student/quizzes" className="mt-4 inline-block text-primary-600 font-medium hover:underline">
                    Retour aux quiz
                </Link>
            </div>
        )
    }

    // ─── RESULTS SCREEN ────────────────────────────────────────────────────────
    if (isFinished && result) {
        return (
            <div className="max-w-2xl mx-auto py-12 animate-in fade-in duration-700">
                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-10 border border-neutral-200 dark:border-neutral-800 shadow-2xl shadow-neutral-200/40 text-center">

                    {/* Icon */}
                    <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-8 ${result.passed
                        ? 'bg-emerald-50 text-emerald-500'
                        : 'bg-red-50 text-red-500'
                        }`}>
                        {result.passed
                            ? <Trophy className="w-12 h-12" />
                            : <CircleX className="w-12 h-12" />
                        }
                    </div>

                    <h2 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-2">
                        {result.passed ? 'Félicitations !' : 'Continuez vos efforts !'}
                    </h2>
                    <p className="text-neutral-500 mb-6">Résultat du quiz : <strong className="text-neutral-800 dark:text-neutral-200">{quiz.title}</strong></p>

                    {/* Big Score */}
                    <div className={`text-7xl font-black mb-2 ${result.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                        {result.score}%
                    </div>
                    <p className="text-sm text-neutral-400 mb-10">
                        Score minimum requis : {result.passing_score}%
                    </p>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-4 mb-10">
                        <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-2xl">
                            <span className="block text-xs uppercase font-bold text-neutral-400 mb-1">Correctes</span>
                            <span className="text-2xl font-black text-neutral-900 dark:text-white">{result.correct}</span>
                        </div>
                        <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-2xl">
                            <span className="block text-xs uppercase font-bold text-neutral-400 mb-1">Total</span>
                            <span className="text-2xl font-black text-neutral-900 dark:text-white">{result.total}</span>
                        </div>
                        <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-2xl">
                            <span className="block text-xs uppercase font-bold text-neutral-400 mb-1">Statut</span>
                            <span className={`text-lg font-black uppercase tracking-wider ${result.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                                {result.passed ? 'Validé' : 'Échoué'}
                            </span>
                        </div>
                    </div>

                    {/* Certificate notice */}
                    {result.passed && (
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl mb-6 text-left">
                            <Award className="w-8 h-8 text-emerald-500 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Certificat émis !</p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400">Votre certificat est disponible dans la section &ldquo;Mes Certificats&rdquo;.</p>
                            </div>
                        </div>
                    )}

                    {/* AI Feedback */}
                    {(aiFeedback || !isSubmitting) && (
                        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-900/50 rounded-2xl p-6 text-left mb-10 relative overflow-hidden">
                            <BrainCircuit className="absolute -right-2 -top-2 w-20 h-20 text-primary-500/10" />
                            <h4 className="text-sm font-bold text-primary-700 dark:text-primary-300 flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4" /> Analyse de l&apos;IA
                            </h4>
                            {aiFeedback ? (
                                <p className="text-sm text-primary-800 dark:text-primary-200 leading-relaxed italic">
                                    &ldquo;{aiFeedback}&rdquo;
                                </p>
                            ) : (
                                <p className="text-sm text-primary-800 dark:text-primary-200 leading-relaxed">
                                    {result.message}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                        <Link
                            href="/dashboard/student/quizzes"
                            className="flex-1 py-4 rounded-2xl border-2 border-neutral-100 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold flex items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                        >
                            <Home className="w-4 h-4" /> Retour
                        </Link>

                        {result.passed ? (
                            <Link
                                href="/dashboard/student/certificates"
                                className="flex-1 py-4 rounded-2xl bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg"
                            >
                                <Award className="w-4 h-4" /> Voir le certificat
                            </Link>
                        ) : (
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                            >
                                <RotateCcw className="w-4 h-4" /> Recommencer
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // ─── QUIZ PLAYER UI ────────────────────────────────────────────────────────
    const currentQuestion = quiz.questions[currentStep]
    const progress = Math.round(((currentStep + 1) / quiz.questions.length) * 100)
    const allAnswered = answers.every(a => a !== '')

    return (
        <div className="max-w-3xl mx-auto py-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-1">
                        {quiz.courses?.title}
                    </h2>
                    <h1 className="text-2xl font-black text-neutral-900 dark:text-white">{quiz.title}</h1>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xl font-black text-neutral-900 dark:text-white">
                        {currentStep + 1}{' '}
                        <span className="text-neutral-300 dark:text-neutral-700">/</span>{' '}
                        {quiz.questions.length}
                    </span>
                    <div className="w-24 bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                            className="bg-primary-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-12 border border-neutral-200 dark:border-neutral-800 shadow-2xl shadow-neutral-200/40 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary-600" />

                <p className="text-xl md:text-2xl font-bold text-neutral-800 dark:text-neutral-100 mb-10 leading-snug">
                    {currentQuestion.question}
                </p>

                <div className="space-y-4 mb-12">
                    {currentQuestion.options.map((option: string, i: number) => (
                        <button
                            key={i}
                            onClick={() => handleOptionSelect(option)}
                            className={`w-full group flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-200 text-left ${answers[currentStep] === option
                                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-300 ring-4 ring-primary-500/10'
                                : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-100 dark:border-neutral-800 text-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-600'
                                }`}
                        >
                            <span className="font-semibold">{option}</span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${answers[currentStep] === option
                                ? 'bg-primary-500 border-primary-500'
                                : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700'
                                }`}>
                                {answers[currentStep] === option && (
                                    <div className="w-2 h-2 rounded-full bg-white" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Error message */}
                {submitError && (
                    <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                        ⚠️ {submitError}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-8 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                        disabled={currentStep === 0}
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-neutral-900 dark:hover:text-white disabled:opacity-0 transition-all px-4 py-2"
                    >
                        <ChevronLeft className="w-5 h-5" /> Question précédente
                    </button>

                    {currentStep === quiz.questions.length - 1 ? (
                        <button
                            disabled={!answers[currentStep] || isSubmitting}
                            onClick={finishQuiz}
                            className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-10 py-4 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-xl shadow-neutral-900/20 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isSubmitting ? 'Calcul en cours...' : 'Terminer le Quiz'}
                        </button>
                    ) : (
                        <button
                            disabled={!answers[currentStep]}
                            onClick={() => setCurrentStep(currentStep + 1)}
                            className="flex items-center gap-2 bg-primary-600 text-white px-10 py-4 rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30 disabled:opacity-50"
                        >
                            Suivante <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
                {quiz.questions.map((_: any, i: number) => (
                    <button
                        key={i}
                        onClick={() => setCurrentStep(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${i === currentStep
                            ? 'w-6 bg-primary-600'
                            : answers[i]
                                ? 'w-2 bg-emerald-400'
                                : 'w-2 bg-neutral-200 dark:bg-neutral-800'
                            }`}
                    />
                ))}
            </div>
            <p className="text-center text-xs text-neutral-400 mt-3">
                {answers.filter(a => a).length} / {quiz.questions.length} réponses saisies
            </p>
        </div>
    )
}
