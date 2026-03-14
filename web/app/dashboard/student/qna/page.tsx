'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    MessageSquare,
    Send,
    User,
    Clock,
    CheckCircle2,
    Search,
    ChevronDown,
    PlusCircle
} from 'lucide-react'

export default function StudentQnA() {
    const [questions, setQuestions] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [selectedCourseId, setSelectedCourseId] = useState('')
    const [newQuestion, setNewQuestion] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const supabase = createClient()

    const fetchData = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            // Fetch published courses for dropdown
            const { data: availableCourses } = await supabase
                .from('courses')
                .select('id, title')
                .eq('status', 'published')

            if (availableCourses) {
                setCourses(availableCourses)
            }

            // Fetch student questions
            const { data: qns, error } = await supabase
                .from('course_questions')
                .select('*, courses(title)')
                .eq('student_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error("Fetch QnA Error:", error)
            } else if (qns) {
                setQuestions(qns)
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSubmit = async () => {
        if (!newQuestion || !selectedCourseId) return
        setIsSubmitting(true)
        setMessage(null)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data, error } = await supabase
                .from('course_questions')
                .insert({
                    course_id: selectedCourseId,
                    student_id: user.id,
                    question: newQuestion
                })
                .select('*, courses(title)')
                .single()

            if (error) {
                setMessage({ type: 'error', text: 'Erreur lors de l\'envoi : ' + error.message })
            } else if (data) {
                setQuestions([data, ...questions])
                setNewQuestion('')
                setSelectedCourseId('')
                setMessage({ type: 'success', text: 'Question envoyée !' })
            }
        }
        setIsSubmitting(false)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-3">
                    <MessageSquare className="w-8 h-8 text-primary-600" />
                    Questions au Professeur
                </h1>
                <p className="text-neutral-500">Posez vos questions sur les cours et recevez des réponses de vos enseignants.</p>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 md:p-8 border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-neutral-200/30">
                {message && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-error/10 text-error border border-error/20'}`}>
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5 rotate-45" />}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}
                <div className="flex flex-col gap-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            <select
                                className="w-full bg-neutral-100 dark:bg-neutral-800 border-none rounded-2xl p-4 text-sm focus:ring-2 ring-primary-500/20 transition-all outline-none text-neutral-900 dark:text-white"
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                            >
                                <option value="">Choisir un cours</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2 relative">
                            <input
                                type="text"
                                placeholder="Quelle est votre question ?"
                                className="w-full bg-neutral-100 dark:bg-neutral-800 border-none rounded-2xl p-4 pr-16 text-sm focus:ring-2 ring-primary-500/20 transition-all outline-none text-neutral-900 dark:text-white"
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting || !newQuestion || !selectedCourseId}
                                className="absolute right-2 top-2 bottom-2 px-4 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
                            >
                                {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block"></span> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white px-2">Historique de vos questions</h3>

                {loading ? (
                    <div className="text-center py-12">Chargement...</div>
                ) : questions.length > 0 ? (
                    questions.map((q) => (
                        <div key={q.id} className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2.5 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-[10px] font-bold text-primary-600 uppercase">
                                            {q.courses?.title}
                                        </span>
                                        <span className="text-[10px] text-neutral-400 flex items-center gap-1 font-medium">
                                            <Clock className="w-3 h-3" />
                                            {new Date(q.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    {q.answer ? (
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-success uppercase tracking-wider">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Répondu
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-warning uppercase tracking-wider italic">
                                            En attente...
                                        </span>
                                    )}
                                </div>
                                <p className="font-semibold text-neutral-800 dark:text-neutral-100 mb-4">{q.question}</p>

                                {q.answer && (
                                    <div className="p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800 relative">
                                        <div className="absolute -top-3 left-6 px-2 bg-white dark:bg-neutral-900 text-[10px] font-black text-neutral-400 uppercase">
                                            Réponse du prof
                                        </div>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed italic">
                                            "{q.answer}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900/50 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                        <MessageSquare className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
                        <p className="text-neutral-500 font-medium">Vous n'avez pas encore posé de questions.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
