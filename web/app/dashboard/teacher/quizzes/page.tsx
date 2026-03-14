'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    BrainCircuit,
    Sparkles,
    Trash2,
    Save,
    Loader2,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    BookOpen,
    GraduationCap,
    RefreshCw
} from 'lucide-react'

type SavedQuiz = {
    id: string
    title: string
    created_at: string | null
    passing_score_percentage: number | null
    questions: any[]
    courses: { title: string } | null
}

export default function TeacherQuizzes() {
    const [courses, setCourses] = useState<any[]>([])
    const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([])
    const [selectedCourseId, setSelectedCourseId] = useState('')
    const [topic, setTopic] = useState('')
    const [numberOfQuestions, setNumberOfQuestions] = useState(5)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedQuiz, setGeneratedQuiz] = useState<any[] | null>(null)
    const [quizTitle, setQuizTitle] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)
    const [expandedSavedQuiz, setExpandedSavedQuiz] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'generate' | 'list'>('generate')

    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch courses
        const { data: coursesData } = await supabase
            .from('courses')
            .select('id, title')
            .eq('teacher_id', user.id)

        if (coursesData) {
            setCourses(coursesData)
            // Pre-select first course if only one
            if (coursesData.length === 1) setSelectedCourseId(coursesData[0].id)
        }

        // Fetch existing quizzes with course info
        const courseIds = coursesData?.map(c => c.id) || []
        if (courseIds.length > 0) {
            const { data: quizzesData, error } = await supabase
                .from('quizzes')
                .select('id, title, created_at, passing_score_percentage, questions, courses!course_id(title)')
                .in('course_id', courseIds)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching quizzes:', error)
            }
            if (quizzesData) {
                setSavedQuizzes(quizzesData as unknown as SavedQuiz[])
            }
        }
    }

    const handleGenerate = async () => {
        if (!topic || !selectedCourseId) {
            setMessage({ type: 'error', text: 'Veuillez sélectionner un cours et entrer un sujet.' })
            return
        }
        setIsGenerating(true)
        setMessage(null)
        try {
            const res = await fetch('/api/quiz/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, numberOfQuestions, difficulty: 'intermédiaire' })
            })
            const data = await res.json()
            if (data.questions) {
                setGeneratedQuiz(data.questions)
                setQuizTitle(`Quiz sur ${topic}`)
            } else {
                throw new Error(data.error || 'Format de réponse invalide')
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Erreur lors de la génération. Veuillez réessayer.' })
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSave = async () => {
        if (!selectedCourseId || !generatedQuiz || !quizTitle) {
            setMessage({ type: 'error', text: 'Sélectionnez un cours et entrez un titre.' })
            return
        }
        setIsSaving(true)
        try {
            const { data, error } = await supabase
                .from('quizzes')
                .insert({
                    course_id: selectedCourseId,
                    title: quizTitle,
                    questions: generatedQuiz,
                    passing_score_percentage: 60
                })
                .select('id, title, created_at, passing_score_percentage, questions, courses!course_id(title)')
                .single()

            if (error) throw error

            setMessage({ type: 'success', text: '✅ Quiz enregistré avec succès ! Il est maintenant visible pour les étudiants.' })
            setGeneratedQuiz(null)
            setTopic('')
            setQuizTitle('')

            // Add the new quiz to the list without refetching
            if (data) {
                setSavedQuizzes(prev => [data as unknown as SavedQuiz, ...prev])
                // Switch to list tab to show the saved quiz
                setTimeout(() => setActiveTab('list'), 1500)
            }
        } catch (err: any) {
            console.error('Erreur save quiz:', err)
            setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement: ' + (err?.message || 'Inconnue') })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDelete = async (quizId: string) => {
        if (!window.confirm('Supprimer ce quiz définitivement ?')) return
        setIsDeleting(quizId)
        try {
            const { error } = await supabase.from('quizzes').delete().eq('id', quizId)
            if (error) throw error
            setSavedQuizzes(prev => prev.filter(q => q.id !== quizId))
        } catch (err: any) {
            alert('Erreur suppression: ' + err.message)
        } finally {
            setIsDeleting(null)
        }
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-3">
                    <BrainCircuit className="w-8 h-8 text-primary-600" />
                    Gestion des Quiz
                </h1>
                <p className="text-neutral-500">Générez et gérez vos évaluations grâce à l&apos;IA.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('generate')}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'generate'
                        ? 'bg-white dark:bg-neutral-700 text-primary-600 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                        }`}
                >
                    <Sparkles className="w-4 h-4 inline mr-2" />
                    Générer un Quiz
                </button>
                <button
                    onClick={() => setActiveTab('list')}
                    className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'list'
                        ? 'bg-white dark:bg-neutral-700 text-primary-600 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                        }`}
                >
                    <GraduationCap className="w-4 h-4" />
                    Mes Quiz
                    {savedQuizzes.length > 0 && (
                        <span className="bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                            {savedQuizzes.length}
                        </span>
                    )}
                </button>
            </div>

            {/* === TAB: GENERATE === */}
            {activeTab === 'generate' && (
                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-neutral-200/40 dark:shadow-none">
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">
                                Cours associé <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-4 text-sm focus:ring-2 ring-primary-500/20 transition-all outline-none text-neutral-900 dark:text-white"
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                            >
                                <option value="">Sélectionnez un cours</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                            {courses.length === 0 && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 ml-1">
                                    ⚠️ Créez d&apos;abord un cours avant de générer un quiz.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">
                                Sujet du quiz <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Les bases de JavaScript, La photosynthèse..."
                                className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-4 text-sm focus:ring-2 ring-primary-500/20 transition-all outline-none text-neutral-900 dark:text-white"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-end gap-6 mb-8">
                        <div className="flex-1 space-y-3">
                            <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">
                                Nombre de questions : <span className="text-primary-600">{numberOfQuestions}</span>
                            </label>
                            <input
                                type="range" min="3" max="15"
                                className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                value={numberOfQuestions}
                                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !topic || !selectedCourseId}
                            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30 whitespace-nowrap"
                        >
                            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            {isGenerating ? 'Génération...' : 'Générer avec l\'IA'}
                        </button>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 mb-8 ${message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800'}`}>
                            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                            <span className="text-sm font-medium">{message.text}</span>
                        </div>
                    )}

                    {generatedQuiz && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
                                <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1 block mb-2">
                                    Titre du quiz
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-4 text-base font-bold focus:ring-2 ring-primary-500/20 outline-none mb-6 text-neutral-900 dark:text-white"
                                    value={quizTitle}
                                    onChange={(e) => setQuizTitle(e.target.value)}
                                />

                                <div className="space-y-4 mb-8">
                                    {generatedQuiz.map((q, idx) => (
                                        <div key={idx} className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl overflow-hidden border border-neutral-200/50 dark:border-neutral-700/50">
                                            <button
                                                onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                                                className="w-full flex items-center justify-between p-4 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                            >
                                                <div className="flex items-center gap-4 text-left">
                                                    <span className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-xs font-bold text-primary-600 shadow-sm shrink-0">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1 text-left">{q.question}</span>
                                                </div>
                                                {expandedQuestion === idx ? <ChevronUp className="w-5 h-5 shrink-0 text-neutral-400" /> : <ChevronDown className="w-5 h-5 shrink-0 text-neutral-400" />}
                                            </button>

                                            {expandedQuestion === idx && (
                                                <div className="p-6 pt-0 space-y-4">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {q.options.map((opt: string, i: number) => (
                                                            <div key={i} className={`p-3 rounded-xl text-sm border ${opt === q.correctAnswer
                                                                ? 'bg-success/5 border-success/30 text-success font-bold'
                                                                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-600'
                                                                }`}>
                                                                {opt}
                                                                {opt === q.correctAnswer && <span className="ml-2">✓</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {q.explanation && (
                                                        <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-xs text-primary-700 dark:text-primary-300">
                                                            <span className="font-bold block mb-1">Explication :</span>
                                                            {q.explanation}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => { setGeneratedQuiz(null); setMessage(null) }}
                                        className="flex-1 py-4 rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                                    >
                                        Recommencer
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || !selectedCourseId || !quizTitle}
                                        className="flex-[2] py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {isSaving ? 'Enregistrement...' : 'Publier le Quiz'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* === TAB: LIST OF SAVED QUIZZES === */}
            {activeTab === 'list' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-neutral-500">{savedQuizzes.length} quiz{savedQuizzes.length > 1 ? 'zes' : ''} créé{savedQuizzes.length > 1 ? 's' : ''}</p>
                        <button
                            onClick={fetchData}
                            className="flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-primary-600 transition-colors"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Actualiser
                        </button>
                    </div>

                    {savedQuizzes.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                            <GraduationCap className="w-16 h-16 text-neutral-200 dark:text-neutral-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Aucun quiz créé</h3>
                            <p className="text-neutral-500 mb-6">Utilisez l&apos;IA pour générer votre premier quiz.</p>
                            <button
                                onClick={() => setActiveTab('generate')}
                                className="px-6 py-3 rounded-2xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all"
                            >
                                Générer un Quiz
                            </button>
                        </div>
                    ) : (
                        savedQuizzes.map((quiz) => (
                            <div key={quiz.id} className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                                <div className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                                            <BrainCircuit className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-neutral-900 dark:text-white truncate">{quiz.title}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-primary-600 font-semibold">
                                                    {(quiz.courses as any)?.title || 'Cours'}
                                                </span>
                                                <span className="text-xs text-neutral-400">•</span>
                                                <span className="text-xs text-neutral-400">
                                                    {quiz.questions?.length || 0} questions
                                                </span>
                                                <span className="text-xs text-neutral-400">•</span>
                                                <span className="text-xs text-neutral-400">
                                                    {quiz.passing_score_percentage}% minimum
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-4">
                                        <span className="hidden md:flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-wider">
                                            <CheckCircle2 className="w-3 h-3" /> Publié
                                        </span>
                                        <button
                                            onClick={() => setExpandedSavedQuiz(expandedSavedQuiz === quiz.id ? null : quiz.id)}
                                            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-400"
                                        >
                                            {expandedSavedQuiz === quiz.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(quiz.id)}
                                            disabled={isDeleting === quiz.id}
                                            className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                        >
                                            {isDeleting === quiz.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {expandedSavedQuiz === quiz.id && (
                                    <div className="px-6 pb-6 border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-3">
                                        {(quiz.questions as any[])?.map((q: any, idx: number) => (
                                            <div key={idx} className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl">
                                                <p className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 mb-3">
                                                    {idx + 1}. {q.question}
                                                </p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {q.options?.map((opt: string, i: number) => (
                                                        <div key={i} className={`p-2.5 rounded-xl text-xs border ${opt === q.correctAnswer
                                                            ? 'bg-success/5 border-success/30 text-success font-bold'
                                                            : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700'
                                                            }`}>
                                                            {opt} {opt === q.correctAnswer && '✓'}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
