import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BookOpen, Users, Star, Plus } from 'lucide-react'

// Prevents aggressive caching of the dashboard showing stale data
export const dynamic = 'force-dynamic'

export default async function TeacherDashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Fetch teacher's courses
    const { data: courses } = await supabase
        .from('courses')
        .select('id, title, status')
        .eq('teacher_id', user?.id)

    // Fetch real enrolled student count for this teacher's courses
    const courseIds = courses?.map(c => c.id) || []
    let totalStudents = 0
    if (courseIds.length > 0) {
        const { count } = await supabase
            .from('enrollments')
            .select('id', { count: 'exact', head: true })
            .in('course_id', courseIds)
        totalStudents = count || 0
    }

    const stats = [
        { title: "Cours publiés", value: courses?.filter(c => c.status === 'published').length || 0, icon: BookOpen, color: "text-primary-500", bg: "bg-primary-50 dark:bg-primary-900/20" },
        { title: "Étudiants inscrits", value: totalStudents, icon: Users, color: "text-accent-500", bg: "bg-accent-50 dark:bg-amber-900/20" },
        { title: "Total cours", value: courses?.length || 0, icon: Star, color: "text-success", bg: "bg-success/10" },
    ]

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Espace Professeur 🎓</h1>
                    <p className="text-neutral-500">Gérez vos cours et suivez la progression de vos étudiants.</p>
                </div>
                <Link
                    href="/dashboard/teacher/courses/new"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity shadow-glow"
                >
                    <Plus className="w-5 h-5" /> Nouveau Cours
                </Link>
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

            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-card overflow-hidden">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50">
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Vos cours récents</h2>
                    <Link href="/dashboard/teacher/courses" className="text-sm font-medium text-primary-600 hover:underline">
                        Voir tout →
                    </Link>
                </div>

                {courses && courses.length > 0 ? (
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {courses.slice(0, 5).map((course: any) => (
                            <div key={course.id} className="p-6 flex items-center justify-between hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-12 bg-neutral-100 dark:bg-neutral-900 rounded-lg flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-neutral-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-neutral-900 dark:text-white">{course.title}</h3>
                                        <p className="text-sm text-neutral-500 mt-1">
                                            {course.status === 'published' ? '✅ Cours publié' : '📝 En brouillon'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${course.status === 'published'
                                        ? 'border-success/20 bg-success/10 text-success'
                                        : 'border-warning/20 bg-warning/10 text-warning'
                                        }`}>
                                        {course.status === 'published' ? 'Publié' : 'Brouillon'}
                                    </span>
                                    <Link href="/dashboard/teacher/courses" className="text-sm font-medium text-primary-600 hover:text-primary-700">Gérer</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-neutral-500">
                        Vous n&apos;avez pas encore créé de cours.
                    </div>
                )}
            </div>
        </div>
    )
}
