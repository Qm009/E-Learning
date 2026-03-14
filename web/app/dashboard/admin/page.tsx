import { createClient } from '@/lib/supabase/server'
import {
    Users,
    BookOpen,
    BarChart3,
    ShieldCheck,
    TrendingUp,
    AlertCircle,
    UserCircle,
    Mail
} from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Fetch stats
    const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    const { count: totalCourses } = await supabase.from('courses').select('*', { count: 'exact', head: true })
    const { count: totalEnrollments } = await supabase.from('enrollments').select('*', { count: 'exact', head: true })

    // Fetch recent users
    const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

    const stats = [
        { title: "Utilisateurs", value: totalUsers || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
        { title: "Cours Créés", value: totalCourses || 0, icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
        { title: "Inscriptions", value: totalEnrollments || 0, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
        { title: "Système", value: "Sain", icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    ]

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2 font-accent">Console d'Administration 🛡️</h1>
                    <p className="text-neutral-500">Vue d'ensemble et gestion de la plateforme EduFlow.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-5 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm font-bold shadow-sm hover:bg-neutral-50 transition-colors">
                        Journal Logs
                    </button>
                    <button className="px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-bold shadow-lg">
                        Rôles & Permissions
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-neutral-900 p-6 rounded-3xl shadow-card border border-neutral-100 dark:border-neutral-800 flex items-center gap-4 group hover:border-primary-500/30 transition-all">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-[11px] font-black uppercase tracking-widest text-neutral-400">{stat.title}</div>
                            <div className="text-2xl font-black text-neutral-900 dark:text-white">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-neutral-50 dark:border-neutral-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-3">
                                <Users className="w-5 h-5 text-primary-500" />
                                Nouveaux Utilisateurs
                            </h2>
                            <Link href="/dashboard/admin/users" className="text-xs font-bold text-primary-600 hover:underline">
                                Gérer tout le monde →
                            </Link>
                        </div>
                        <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
                            {recentUsers?.map((user) => (
                                <div key={user.id} className="p-6 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-primary-600">
                                            <UserCircle className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-neutral-900 dark:text-white">{user.full_name}</div>
                                            <div className="text-xs text-neutral-500 flex items-center gap-1">
                                                <Mail className="w-3 h-3" /> {user.email}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${user.role === 'teacher'
                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                            {user.role}
                                        </span>
                                        <button className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                                            <AlertCircle className="w-4 h-4 text-neutral-400" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 rounded-[2.5rem] text-white shadow-xl shadow-primary-500/20 relative overflow-hidden group">
                        <BarChart3 className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-bold mb-2">Santé du Serveur</h3>
                        <p className="text-white/70 text-sm mb-6">Tous les services sont opérationnels. Prochaine maintenance prévue à 02:00 UTC.</p>
                        <div className="space-y-4">
                            <div className="flex justify-between text-xs font-bold uppercase">
                                <span>Stockage (S3)</span>
                                <span>14% utilisé</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-white h-full" style={{ width: '14%' }} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-sm">
                        <h3 className="font-bold text-neutral-900 dark:text-white mb-6">Actions Rapides</h3>
                        <div className="grid gap-3">
                            <button className="w-full py-3 px-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-bold text-left hover:bg-primary-500 hover:text-white transition-all">
                                🛡️ Auditer les Politiques RLS
                            </button>
                            <button className="w-full py-3 px-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-bold text-left hover:bg-primary-500 hover:text-white transition-all">
                                📧 Envoyer Annonce Système
                            </button>
                            <button className="w-full py-3 px-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-bold text-left hover:bg-primary-500 hover:text-white transition-all">
                                📊 Export Statistiques CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
