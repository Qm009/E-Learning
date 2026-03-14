import Link from 'next/link'
import { BookOpen, Users, Award, ArrowRight, Zap, Shield, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let dashboardLink = '/login'
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        dashboardLink = profile?.role === 'teacher' ? '/dashboard/teacher' : (profile?.role === 'admin' ? '/dashboard/admin' : '/dashboard/student')
    }

    return (
        <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
            {/* Navbar */}
            <nav className="glass fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg text-neutral-900 dark:text-neutral-50">EduFlow</span>
                </div>
                <div className="flex items-center gap-4">
                    {user ? (
                        <Link href={dashboardLink} className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary-500/20">
                            <LayoutDashboard className="w-4 h-4" /> Mon Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-bold text-neutral-600 dark:text-neutral-400 hover:text-primary-600 transition-colors">
                                Connexion
                            </Link>
                            <Link href="/register" className="text-sm px-5 py-2.5 rounded-xl gradient-primary text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary-500/20">
                                S&apos;inscrire
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl" />
                </div>
                <div className="max-w-4xl mx-auto animate-fade-in">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
                        <Zap className="w-3.5 h-3.5" /> Plateforme de nouvelle génération
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 dark:text-neutral-50 mb-6 leading-tight">
                        Apprenez.<br />
                        <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                            Progressez.
                        </span>{' '}
                        Réussissez.
                    </h1>
                    <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto">
                        EduFlow connecte étudiants et professeurs dans un espace d'apprentissage moderne, rapide et sécurisé.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {user ? (
                            <Link href={dashboardLink} className="flex items-center gap-2 px-8 py-4 rounded-xl gradient-primary text-white font-semibold text-lg hover:opacity-90 transition-all hover:shadow-glow">
                                Continuer mon apprentissage <ArrowRight className="w-5 h-5" />
                            </Link>
                        ) : (
                            <>
                                <Link href="/register" className="flex items-center gap-2 px-8 py-4 rounded-xl gradient-primary text-white font-semibold text-lg hover:opacity-90 transition-all hover:shadow-glow">
                                    Démarrer gratuitement <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link href="/login" className="px-8 py-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold text-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                                    Se connecter
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-neutral-900 dark:text-neutral-50 mb-12">
                        Tout ce dont vous avez besoin
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: BookOpen, title: 'Cours structurés', desc: 'Accédez à des cours bien organisés avec du contenu vidéo, des PDFs et des quizzes interactifs.', color: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' },
                            { icon: Zap, title: 'IA & Évaluations', desc: 'Génération et correction autonome de quiz grâce à l\'IA pour un apprentissage personnalisé et rapide.', color: 'bg-accent-400/10 text-accent-500' },
                            { icon: Shield, title: 'Sécurité RLS', desc: 'Chaque donnée est protégée par les politiques Row Level Security de Supabase. Zéro compromis.', color: 'bg-success/10 text-success' },
                        ].map((f) => (
                            <div key={f.title} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-card card-hover border border-neutral-100 dark:border-neutral-700">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                                    <f.icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-50 mb-2">{f.title}</h3>
                                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 px-6 bg-neutral-900 dark:bg-neutral-950">
                <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
                    {[
                        { value: '10K+', label: 'Étudiants actifs' },
                        { value: '500+', label: 'Cours disponibles' },
                        { value: '98%', label: 'Taux de satisfaction' },
                    ].map((s) => (
                        <div key={s.label}>
                            <div className="text-4xl font-bold text-white mb-1">{s.value}</div>
                            <div className="text-neutral-400 text-sm">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 text-center text-neutral-500 dark:text-neutral-600 text-sm">
                © 2026 EduFlow. Tous droits réservés.
            </footer>
        </main>
    )
}
