'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    GraduationCap,
    Play,
    BookOpen,
    CheckCircle2,
    Trophy,
    RefreshCw,
    Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function StudentQuizzes() {
    const [quizzes, setQuizzes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([])
    const supabase = createClient()

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setLoading(false)
            return
        }

        try {
            // 1. Fetch courses the student is enrolled in
            const { data: enrollments } = await supabase
                .from('enrollments')
                .select('course_id')
                .eq('student_id', user.id)

            const courseIds = enrollments?.map(e => e.course_id).filter(id => !!id) || []
            setEnrolledCourseIds(courseIds as string[])

            // 2. Fetch ALL quizzes for published courses
            // We use a join with courses and filter by course status
            const { data, error } = await supabase
                .from('quizzes')
                .select('*, courses!inner(id, title, image_url, status)')
                .eq('courses.status', 'published')
                .order('created_at', { ascending: false })

            if (error) throw error
            if (data) setQuizzes(data)
        } catch (error) {
            console.error("Error fetching student data:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[500px] gap-4">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            <p className="text-neutral-500 font-medium font-accent">Préparation de vos évaluations...</p>
        </div>
    )

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white">Mes Quiz & Évaluations ✍️</h1>
                    <p className="text-neutral-500 mt-2">Validez vos acquis et obtenez vos certificats de réussite.</p>
                </div>
                <button
                    onClick={fetchData}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold text-xs hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Actualiser
                </button>
            </div>

            {quizzes.length === 0 ? (
                <div className="py-24 text-center bg-white dark:bg-neutral-900 rounded-[2.5rem] border-2 border-dashed border-neutral-100 dark:border-neutral-800 shadow-sm">
                    <div className="w-20 h-20 bg-primary-50 dark:bg-primary-950/30 text-primary-500 flex items-center justify-center rounded-3xl mx-auto mb-6">
                        <BookOpen className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Aucun quiz disponible</h3>
                    <p className="text-neutral-500 max-w-sm mx-auto mb-8">
                        Il n&apos;y a pour le moment aucun quiz publié par les professeurs. Explorez le catalogue pour vous inscrire à de nouveaux cours.
                    </p>
                    <Link href="/dashboard/student/courses" className="inline-flex px-10 py-4 rounded-2xl gradient-primary text-white font-bold shadow-xl shadow-primary-500/30 hover:opacity-90 transition-all">
                        Voir le catalogue
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {quizzes.map((quiz) => (
                        <div key={quiz.id} className="group bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 overflow-hidden hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500">
                            <div className="h-40 relative overflow-hidden bg-neutral-900">
                                <img
                                    src={quiz.courses?.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                                    alt="Course"
                                    className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg">
                                            {quiz.courses?.title || 'Cours'}
                                        </span>
                                        {enrolledCourseIds.includes(quiz.course_id) && (
                                            <span className="px-3 py-1 rounded-lg bg-success/20 backdrop-blur-md border border-success/30 text-[10px] font-bold uppercase tracking-widest text-success shadow-lg">
                                                Inscrit
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-xl text-white mt-3 line-clamp-1">{quiz.title}</h3>
                                </div>
                                <GraduationCap className="absolute -right-4 top-0 w-24 h-24 text-white/5 -rotate-12" />
                            </div>

                            <div className="p-8">
                                <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-8">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                        {(quiz.questions as any[])?.length || 0} Questions
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        {quiz.passing_score_percentage}% Requis
                                    </div>
                                </div>

                                <Link
                                    href={enrolledCourseIds.includes(quiz.course_id)
                                        ? `/dashboard/student/quizzes/${quiz.id}`
                                        : `/dashboard/student/courses/${quiz.course_id}`
                                    }
                                    className="w-full py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm flex items-center justify-center gap-3 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-xl shadow-neutral-900/10 dark:shadow-none"
                                >
                                    <Play className="w-4 h-4 fill-current group-hover:animate-pulse" />
                                    {enrolledCourseIds.includes(quiz.course_id) ? 'Commencer le Quiz' : 'Rejoindre le cours'}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
