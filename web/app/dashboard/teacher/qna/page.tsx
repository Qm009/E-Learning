'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    MessageSquare,
    Send,
    User,
    Clock,
    CheckCircle2,
    Loader2,
    BookOpen
} from 'lucide-react'

export default function TeacherQnA() {
    const [questions, setQuestions] = useState<any[]>([])
    const [answeringId, setAnsweringId] = useState<string | null>(null)
    const [answerText, setAnswerText] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    useEffect(() => {
        async function fetchQuestions() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                // Fetch questions for courses taught by this teacher
                const { data } = await supabase
                    .from('course_questions')
                    .select('*, courses!inner(title, teacher_id), profiles(full_name, avatar_url)')
                    .eq('courses.teacher_id', user.id)
                    .order('created_at', { ascending: false })

                if (data) setQuestions(data)
            }
            setLoading(false)
        }
        fetchQuestions()
    }, [])

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleAnswer = async (qId: string) => {
        if (!answerText) return
        setIsSubmitting(true)
        setMessage(null)

        const { error } = await supabase
            .from('course_questions')
            .update({
                answer: answerText,
                answered_at: new Date().toISOString()
            })
            .eq('id', qId)

        if (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la réponse : ' + error.message })
        } else {
            setQuestions(questions.map(q => q.id === qId ? { ...q, answer: answerText } : q))
            setAnsweringId(null)
            setAnswerText('')
            setMessage({ type: 'success', text: 'Réponse enregistrée !' })
        }
        setIsSubmitting(false)
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-primary-600" />
                    Questions des Étudiants
                </h1>
                <p className="text-neutral-500">Répondez aux interrogations de vos élèves pour les aider à progresser.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-error/10 text-error border border-error/20'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5 rotate-45" />}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            <div className="flex flex-col gap-6">
                {loading ? (
                    <div className="text-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600 mb-4" />
                        <p className="text-neutral-500 font-medium tracking-wide">Récupération des questions...</p>
                    </div>
                ) : questions.length > 0 ? (
                    questions.map((q) => (
                        <div key={q.id} className={`bg-white dark:bg-neutral-900 rounded-3xl border transition-all duration-300 ${q.answer ? 'border-neutral-200 dark:border-neutral-800 opacity-80' : 'border-primary-200 dark:border-primary-900 shadow-xl shadow-primary-500/5 ring-1 ring-primary-100 dark:ring-primary-900/50'
                            }`}>
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-primary-600 font-bold overflow-hidden border border-neutral-200 dark:border-neutral-700">
                                            {q.profiles?.avatar_url ? (
                                                <img src={q.profiles.avatar_url} className="w-full h-full object-cover" />
                                            ) : (
                                                q.profiles?.full_name?.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-neutral-900 dark:text-white">{q.profiles?.full_name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-neutral-400">
                                                    <BookOpen className="w-3 h-3" /> {q.courses?.title}
                                                </span>
                                                <span className="text-[10px] text-neutral-300 hidden md:block">•</span>
                                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-neutral-400">
                                                    <Clock className="w-3 h-3" /> {new Date(q.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {q.answer ? (
                                        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-wider self-start md:self-center">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Répondu
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-warning/10 text-warning text-[10px] font-black uppercase tracking-wider self-start md:self-center animate-pulse">
                                            En attente
                                        </div>
                                    )}
                                </div>

                                <div className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-8 pl-1 border-l-4 border-primary-500/30 ml-1">
                                    "{q.question}"
                                </div>

                                {q.answer ? (
                                    <div className="bg-neutral-50 dark:bg-neutral-800/40 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 relative group">
                                        <div className="absolute -top-3 left-6 px-2 bg-white dark:bg-neutral-900 text-[10px] font-black text-primary-600 uppercase">
                                            Votre Réponse
                                        </div>
                                        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                                            {q.answer}
                                        </p>
                                    </div>
                                ) : answeringId === q.id ? (
                                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                        <textarea
                                            autoFocus
                                            className="w-full bg-neutral-50 dark:bg-neutral-800 border-2 border-primary-500/20 rounded-2xl p-6 text-sm focus:border-primary-500 outline-none transition-all min-h-[120px] text-neutral-900 dark:text-white font-medium"
                                            placeholder="Écrivez votre réponse ici..."
                                            value={answerText}
                                            onChange={(e) => setAnswerText(e.target.value)}
                                        />
                                        <div className="flex gap-3 justify-end">
                                            <button
                                                onClick={() => setAnsweringId(null)}
                                                className="px-6 py-3 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition-colors"
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                onClick={() => handleAnswer(q.id)}
                                                disabled={isSubmitting || !answerText}
                                                className="px-8 py-3 rounded-xl bg-primary-600 text-white font-bold text-xs hover:bg-primary-700 transition-all flex items-center gap-2 shadow-lg shadow-primary-500/20"
                                            >
                                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                                Envoyer la réponse
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setAnsweringId(q.id)}
                                        className="w-full py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm hover:bg-primary-600 hover:text-white transition-all shadow-lg"
                                    >
                                        Répondre à cette question
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                        <MessageSquare className="w-16 h-16 text-neutral-200 dark:text-neutral-700 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Tout est à jour !</h3>
                        <p className="text-neutral-500">Aucune nouvelle question pour le moment.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
