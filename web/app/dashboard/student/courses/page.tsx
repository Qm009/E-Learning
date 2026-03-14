'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { BookOpen, Search, ArrowRight, Loader2 } from 'lucide-react'

export default function StudentCatalogPage() {
    const [courses, setCourses] = useState<any[]>([])
    const [filteredCourses, setFilteredCourses] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchCourses() {
            setLoading(true)
            const { data, error } = await supabase
                .from('courses')
                .select('id, title, description, image_url, teacher:profiles!teacher_id(full_name)')
                .eq('status', 'published')
                .order('created_at', { ascending: false })

            if (error) {
                console.error("Error fetching student courses:", error)
            } else {
                setCourses(data || [])
                setFilteredCourses(data || [])
            }
            setLoading(false)
        }
        fetchCourses()
    }, [])

    useEffect(() => {
        const filtered = courses.filter(course =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (course.teacher?.full_name && course.teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        setFilteredCourses(filtered)
    }, [searchQuery, courses])

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-card border border-neutral-100 dark:border-neutral-700">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Catalogue de Cours 📚</h1>
                    <p className="text-neutral-500">Découvrez de nouveaux cours et apprenez de nouvelles compétences.</p>
                </div>
                <div className="relative w-full md:w-auto min-w-[320px]">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par titre ou prof..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                    <p className="text-neutral-500 font-medium">Chargement du catalogue...</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.length > 0 ? (
                        filteredCourses.map((course: any) => (
                            <Link
                                key={course.id}
                                href={`/dashboard/student/courses/${course.id}`}
                                className="bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-100 dark:border-neutral-700 shadow-card card-hover flex flex-col overflow-hidden group/card"
                            >
                                <div className="w-full h-52 bg-neutral-900 relative overflow-hidden">
                                    <img
                                        src={course.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'}
                                        alt={course.title}
                                        className="object-cover w-full h-full group-hover/card:scale-110 transition-transform duration-700 opacity-90 group-hover/card:opacity-100"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                    <div className="absolute bottom-4 left-4">
                                        <span className="px-3 py-1 rounded-lg bg-primary-500 text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
                                            Nouveau
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="text-[11px] font-bold text-primary-600 dark:text-primary-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                        Par {course.teacher?.full_name || 'Professeur'}
                                    </div>
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2 line-clamp-1 group-hover/card:text-primary-600 transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 line-clamp-2 leading-relaxed">
                                        {course.description || "Aucune description fournie pour ce cours."}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-neutral-50 dark:border-neutral-700/50 flex items-center justify-between">
                                        <span className="text-xs font-black text-neutral-400 uppercase tracking-tighter group-hover/card:text-primary-500 transition-colors">Voir le programme</span>
                                        <div className="w-12 h-12 rounded-2xl bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 group-hover/card:bg-primary-600 group-hover/card:text-white transition-all shadow-sm border border-neutral-100 dark:border-neutral-700">
                                            <ArrowRight className="w-5 h-5 group-hover/card:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-24 text-center bg-white dark:bg-neutral-800 rounded-3xl border border-neutral-200 dark:border-neutral-700 border-dashed">
                            <BookOpen className="w-16 h-16 text-neutral-200 dark:text-neutral-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Aucun résultat</h3>
                            <p className="text-neutral-500 max-w-sm mx-auto">Nous n&apos;avons pas trouvé de cours correspondant à &quot;{searchQuery}&quot;.</p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="mt-6 text-primary-600 font-bold hover:underline"
                            >
                                Effacer la recherche
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
