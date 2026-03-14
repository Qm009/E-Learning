
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, FileText, Download, ArrowLeft, Send, CheckCircle2 } from 'lucide-react'
import EnrollButton from './EnrollButton'

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { id } = params

    // 0. Fetch user session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (!user) {
        return (
            <div className="p-8 text-center bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                <p className="text-neutral-500 mb-4">Veuillez vous connecter pour voir ce cours.</p>
                <Link href="/login" className="text-primary-600 font-bold hover:underline">Se connecter</Link>
            </div>
        )
    }

    // 1. Fetch Course with teacher name
    const { data: courses, error: courseError } = await supabase
        .from('courses')
        .select(`
            *,
            teacher:profiles!teacher_id(full_name)
        `)
        .eq('id', id)
        .limit(1)

    const course = courses?.[0]

    if (courseError || !course) {
        console.error("Course fetch error or missing:", courseError, id)
        return (
            <div className="p-8 text-center bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Cours non trouvé</h1>
                <p className="text-neutral-500 mb-6">Désolé, nous n'avons pas pu trouver le cours demandé ou vous n'y avez pas accès.</p>
                <Link href="/dashboard/student/courses" className="text-primary-600 font-bold hover:underline">Retour au catalogue</Link>
            </div>
        )
    }

    // 2. Fetch Materials
    const { data: materials } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', id)

    // 3. Fetch enrollment status
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', id)
        .eq('student_id', user?.id || '')
        .single()

    const isEnrolled = !!enrollment

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-fade-in">
            {/* Nav Back */}
            <Link href="/dashboard/student/courses" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-primary-600 transition-colors mb-8 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Retour au catalogue
            </Link>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header Card */}
                    <div className="bg-white dark:bg-neutral-800 rounded-3xl overflow-hidden shadow-card border border-neutral-100 dark:border-neutral-700">
                        <div className="w-full h-64 bg-neutral-900 relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={course.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200'} alt={course.title} className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-8 left-8 right-8">
                                <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-xs">
                                        {course.teacher?.full_name?.charAt(0) || 'P'}
                                    </div>
                                    <span className="text-white/80 text-sm font-medium">Par {course.teacher?.full_name || 'Professeur'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">À propos du cours</h2>
                            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
                                {course.description || "Aucune description détaillée."}
                            </p>
                        </div>
                    </div>

                    {/* Materials Section */}
                    <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-card border border-neutral-100 dark:border-neutral-700">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-500">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Supports de Cours</h2>
                            </div>
                            <span className="text-xs font-bold text-neutral-400 bg-neutral-50 dark:bg-neutral-900 px-3 py-1 rounded-full border border-neutral-100 dark:border-neutral-700 uppercase tracking-wider">
                                {materials?.length || 0} Fichiers
                            </span>
                        </div>

                        {materials && materials.length > 0 ? (
                            <div className="grid gap-3">
                                {materials.map((doc: any) => (
                                    <div key={doc.id} className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-700 hover:shadow-md transition-all group/doc">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover/doc:text-primary-500 transition-colors shadow-sm">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-bold text-neutral-900 dark:text-white truncate pr-4">{doc.file_name}</span>
                                                <span className="text-[11px] font-medium text-neutral-500 uppercase">{doc.file_type} • {formatSize(doc.size_bytes)}</span>
                                            </div>
                                        </div>

                                        <a
                                            href={doc.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-3 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-primary-500 hover:text-white rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 transition-all font-bold text-xs flex items-center gap-2 group/dl"
                                        >
                                            <Download className="w-4 h-4 group-hover/dl:animate-bounce" />
                                            <span className="hidden sm:inline">Télécharger</span>
                                        </a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-neutral-50 dark:bg-neutral-900/30 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-700">
                                <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                                <p className="text-neutral-500 font-medium">Aucun document pédagogique disponible pour le moment.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Sticky */}
                <div className="lg:col-span-1">
                    <div className="sticky top-28 space-y-6">
                        <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-card border border-neutral-100 dark:border-neutral-700">
                            {isEnrolled ? (
                                <div className="space-y-6 text-center">
                                    <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Déjà inscrit !</h3>
                                        <p className="text-sm text-neutral-500 mt-2">Vous avez accès à tous les contenus de ce cours.</p>
                                    </div>
                                    <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700">
                                        <div className="flex justify-between text-xs font-bold text-neutral-500 mb-2 uppercase">
                                            <span>Progression</span>
                                            <span>{enrollment.progress}%</span>
                                        </div>
                                        <div className="w-full bg-neutral-100 dark:bg-neutral-900 rounded-full h-2">
                                            <div className="bg-success h-full rounded-full transition-all" style={{ width: enrollment.progress + '%' }} />
                                        </div>
                                    </div>
                                    <Link href={`/dashboard/student/quizzes`} className="block w-full py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold hover:opacity-90 transition-all shadow-lg text-center">
                                        Accéder aux quiz
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <div className="text-4xl font-black text-neutral-900 dark:text-white mb-2">Gratuit</div>
                                        <p className="text-sm text-neutral-500 font-medium tracking-tight">Accès illimité à vie aux ressources</p>
                                    </div>

                                    <div className="space-y-3">
                                        {[
                                            { icon: FileText, label: `${materials?.length || 0} Supports de cours` },
                                            { icon: CheckCircle2, label: 'Quiz d\'évaluation' },
                                            { icon: Send, label: 'Assistance par Q&A' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                                                <item.icon className="w-4 h-4 text-primary-500" />
                                                {item.label}
                                            </div>
                                        ))}
                                    </div>

                                    {/* EnrollButton is a Client Component that calls the edge function */}
                                    <EnrollButton courseId={id} />
                                </div>
                            )}
                        </div>

                        {/* Teacher Info */}
                        <div className="bg-neutral-900 dark:bg-neutral-800 rounded-3xl p-6 text-white border border-neutral-800 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <BookOpen className="w-20 h-20" />
                            </div>
                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4 px-2">L&apos;Instructeur</h4>
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                                <div className="w-12 h-12 rounded-xl bg-primary-500 overflow-hidden flex items-center justify-center font-bold text-lg">
                                    {course.teacher?.avatar_url ? (
                                        <img src={course.teacher.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        course.teacher?.full_name?.charAt(0) || 'P'
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold truncate">{course.teacher?.full_name || 'Professeur'}</span>
                                    <span className="text-[10px] text-neutral-400 font-medium">Expert Formateur</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
