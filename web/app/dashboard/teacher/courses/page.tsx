import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, BookOpen, Clock, FileText, Trash2 } from 'lucide-react'
import CourseActionButtons from './CourseActionButtons'

// Désactive le cache pour que les nouveaux cours apparaissent immédiatement
export const dynamic = 'force-dynamic'

export default async function TeacherCoursesPage() {
    const supabase = await createClient()

    // Récupérer l'utilisateur avec une session fraîche
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return <div className="p-8 text-center bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
            <p className="text-neutral-500 mb-4">Veuillez vous connecter pour voir vos cours.</p>
            <Link href="/login" className="text-primary-600 font-bold hover:underline">Se connecter</Link>
        </div>
    }

    // Requête principale simplifiée
    const { data: courses, error } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Erreur de chargement des cours [Teacher]:", error)
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-card border border-neutral-100 dark:border-neutral-700">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Mes Cours 📖</h1>
                    <p className="text-neutral-500">Gérez vos programmes, ajoutez des ressources et suivez vos publications.</p>
                </div>
                <Link
                    href="/dashboard/teacher/courses/new"
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary-500/25 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Nouveau cours
                </Link>
            </div>

            {/* Courses Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses && courses.length > 0 ? (
                    courses.map((course: any) => (
                        <div key={course.id} className="bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-100 dark:border-neutral-700 shadow-card overflow-hidden group hover:shadow-xl transition-all duration-300">
                            {/* Course Image */}
                            <div className="w-full h-48 bg-neutral-100 dark:bg-neutral-900 relative">
                                <img
                                    src={course.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'}
                                    alt={course.title}
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${course.status === 'published'
                                        ? 'bg-success/20 text-success border-success/20'
                                        : 'bg-warning/20 text-warning border-warning/20'
                                        }`}>
                                        {course.status === 'published' ? 'Publié' : 'Brouillon'}
                                    </span>
                                </div>
                            </div>

                            {/* Course Content */}
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 line-clamp-1">
                                    {course.title}
                                </h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 line-clamp-2 min-h-[40px]">
                                    {course.description || "Pas de description."}
                                </p>

                                {/* Meta info */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-400">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(course.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                {/* Actions */}
                                <CourseActionButtons courseId={course.id} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-neutral-800 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-700">
                        <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-neutral-300" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Vous n'avez pas encore de cours</h3>
                        <p className="text-neutral-500 mt-2 mb-8 max-w-sm mx-auto">Commencez à partager votre savoir en créant votre premier programme d'apprentissage.</p>
                        <Link
                            href="/dashboard/teacher/courses/new"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/25"
                        >
                            <Plus className="w-5 h-5" />
                            Créer mon premier cours
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
