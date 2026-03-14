'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, LayoutDashboard, ArrowRight } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function checkUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                setCurrentUser(profile || user)
            }
        }
        checkUser()
    }, [supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setCurrentUser(null)
        router.refresh()
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        router.push('/') // Redirect through landing or dashboard
    }

    if (currentUser) {
        return (
            <div className="glass p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl text-center">
                <div className="mb-8">
                    <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4 text-primary-600 font-bold text-2xl">
                        {currentUser.full_name?.charAt(0) || currentUser.email?.charAt(0) || '?'}
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 underline selection:text-white">Déjà connecté</h1>
                    <p className="text-neutral-500">Vous êtes connecté en tant que <span className="font-bold text-neutral-900 dark:text-white">{currentUser.full_name || currentUser.email}</span></p>
                </div>

                <div className="space-y-4">
                    <Link
                        href={currentUser.role === 'teacher' ? '/dashboard/teacher' : (currentUser.role === 'admin' ? '/dashboard/admin' : '/dashboard/student')}
                        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl gradient-primary text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-primary-500/20"
                    >
                        Accéder au Tableau de Bord <LayoutDashboard className="w-5 h-5" />
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border border-error/20 text-error font-bold hover:bg-error/5 transition-all"
                    >
                        Se déconnecter <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="glass p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2 underline selection:text-white">Bon retour 👋</h1>
                <p className="text-neutral-500">Connectez-vous pour accéder à vos cours</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="vous@email.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Mot de passe
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                        required
                    />
                </div>

                {error && (
                    <div className="p-4 bg-error/10 text-error rounded-xl text-sm border border-error/20">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        'Se connecter'
                    )}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-neutral-500">
                Vous n'avez pas de compte ?{' '}
                <Link href="/register" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">
                    Inscrivez-vous
                </Link>
            </p>
        </div>
    )
}
