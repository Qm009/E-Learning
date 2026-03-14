'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, LayoutDashboard, UserPlus } from 'lucide-react'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<'student' | 'teacher' | null>(null)
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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!role) {
            setError("Veuillez choisir si vous êtes un étudiant ou un professeur.")
            return
        }
        setLoading(true)
        setError(null)

        // 1. Inscription Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: role,
                }
            }
        })

        if (authError) {
            setError(authError.message)
            setLoading(false)
            return
        }

        if (authData.user) {
            // Profil creation is handled by DB trigger now
            router.push(`/dashboard/${role}`)
        }
    }

    if (currentUser) {
        return (
            <div className="glass p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl text-center">
                <div className="mb-8">
                    <div className="w-20 h-20 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center mx-auto mb-4 text-accent-600 font-bold text-2xl">
                        {currentUser.full_name?.charAt(0) || currentUser.email?.charAt(0) || '?'}
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2 underline selection:text-white">Compte déjà actif</h1>
                    <p className="text-neutral-500">Vous êtes déjà connecté avec <span className="font-bold text-neutral-900 dark:text-white">{currentUser.full_name || currentUser.email}</span></p>
                </div>

                <div className="space-y-4">
                    <Link
                        href={currentUser.role === 'teacher' ? '/dashboard/teacher' : (currentUser.role === 'admin' ? '/dashboard/admin' : '/dashboard/student')}
                        className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-accent-600 text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-accent-500/20"
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
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2 underline selection:text-white">Créer un compte ✨</h1>
                <p className="text-neutral-500">Rejoignez EduFlow aujourd'hui</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Je suis un...
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setRole('student')}
                            className={`p-4 rounded-xl border text-center transition-all ${role === 'student'
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 ring-2 ring-primary-500/20'
                                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                                }`}
                        >
                            Étudiant
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('teacher')}
                            className={`p-4 rounded-xl border text-center transition-all ${role === 'teacher'
                                ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 ring-2 ring-accent-500/20'
                                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                                }`}
                        >
                            Professeur
                        </button>
                    </div>
                </div>

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
                        minLength={6}
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
                        "S'inscrire"
                    )}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-neutral-500">
                Vous avez déjà un compte ?{' '}
                <Link href="/login" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">
                    Connectez-vous
                </Link>
            </p>
        </div>
    )
}
