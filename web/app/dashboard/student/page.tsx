import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BookOpen, Trophy, Clock, CheckCircle } from 'lucide-react'

// Prevents aggressive caching
export const dynamic = 'force-dynamic'

export default async function StudentDashboard() {
    const supabase = await createClient()

    // Fetch user
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch student enrollments
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('id, course_id, progress, status, courses:course_id(title, image_url)')
        .eq('student_id', user?.id)

    // Fetch student scores to calculate actual average
    const { data: scores } = await supabase
        .from('scores')
        .select('score_percentage')
        .eq('student_id', user?.id)

    const avgScore = scores && scores.length > 0
        ? Math.round(scores.reduce((acc, s) => acc + s.score_percentage, 0) / scores.length)
        : 0

    const stats = [
        { title: "Cours en cours", value: enrollments?.filter(e => e.status === 'in_progress').length || 0, icon: Clock, color: "text-accent-500", bg: "bg-accent-50 dark:bg-accent-950/30" },
        { title: "Cours terminés", value: enrollments?.filter(e => e.status === 'completed').length || 0, icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
        { title: "Score moyen", value: `${avgScore}%`, icon: Trophy, color: "text-primary-500", bg: "bg-primary-50 dark:bg-primary-950/30" },
    ]

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Bienvenue sur votre espace 🚀</h1>
                <p className="text-neutral-500">Reprenez là où vous vous étiez arrêté.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-neutral-800 p-6 rounded-2xl shadow-card border border-neutral-100 dark:border-neutral-700 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-neutral-500">{stat.title}</div>
                            <div className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Vos cours récents</h2>
                    <Link href="/dashboard/student/courses" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                        Voir tout le catalogue →
                    </Link>
                </div>

                {enrollments && enrollments.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrollments.slice(0, 3).map((enrollment: any) => (
                            <div key={enrollment.id} className="bg-white dark:bg-neutral-800 rounded-2xl p-4 shadow-card border border-neutral-100 dark:border-neutral-700 card-hover">
                                <div className="w-full h-40 bg-neutral-100 dark:bg-neutral-900 rounded-xl mb-4 overflow-hidden relative">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={enrollment.courses?.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'} alt="Course cover" className="object-cover w-full h-full" />
                                </div>
                                <h3 className="font-semibold text-neutral-900 dark:text-white mb-4 line-clamp-2">
                                    {enrollment.courses?.title}
                                </h3>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-primary-600 font-bold uppercase tracking-wider text-[10px]">
                                            {enrollment.status === 'completed' ? 'Terminé' : 'En cours'}
                                        </span>
                                        <span className="text-neutral-500">{enrollment.progress}%</span>
                                    </div>
                                    <div className="w-full bg-neutral-100 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`${enrollment.status === 'completed' ? 'bg-success' : 'bg-primary-500'} h-full rounded-full transition-all duration-1000`}
                                            style={{ width: `${enrollment.progress}%` }}
                                        />
                                    </div>
                                </div>

                                <Link
                                    href={`/dashboard/student/courses/${enrollment.course_id}`}
                                    className="block w-full py-2.5 rounded-xl gradient-primary text-white text-sm font-bold text-center hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/20"
                                >
                                    Continuer
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 border-dashed">
                        <BookOpen className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">Aucun cours en cours</h3>
                        <p className="text-neutral-500 max-w-sm mx-auto mb-6">Explorez le catalogue pour trouver votre prochaine leçon passionnante.</p>
                        <Link href="/dashboard/student/courses" className="inline-flex px-10 py-4 rounded-xl gradient-primary text-white font-bold hover:opacity-90 transition-all whitespace-nowrap shadow-xl shadow-primary-500/30">
                            Explorer le catalogue
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
