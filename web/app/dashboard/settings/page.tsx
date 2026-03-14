'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Camera, Save, Loader2, CheckCircle2, AlertCircle, GraduationCap } from 'lucide-react'

export default function SettingsPage() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [role, setRole] = useState<'student' | 'teacher'>('student')
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        async function loadProfile() {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (data) {
                    setFullName(data.full_name || '')
                    setAvatarUrl(data.avatar_url)
                    setEmail(data.email || user.email || '')
                    setRole(data.role || 'student')
                }
            }
            setLoading(false)
        }
        loadProfile()
    }, [])

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        try {
            setUploading(true)
            if (!e.target.files || e.target.files.length === 0) return

            const file = e.target.files[0]
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const fileExt = file.name.split('.').pop()
            const filePath = `avatars/${user.id}-${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            setAvatarUrl(publicUrl)
        } catch (error: any) {
            alert('Erreur lors de l\'upload : ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                avatar_url: avatarUrl,
                role: role,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

        if (error) {
            setMessage({ type: 'error', text: 'Erreur : ' + error.message })
        } else {
            await supabase.auth.updateUser({
                data: { full_name: fullName, avatar_url: avatarUrl, role: role }
            })
            setMessage({ type: 'success', text: 'Profil mis à jour ! Redirection...' })

            // Rechargement complet pour mettre à jour le Layout et les accès
            setTimeout(() => {
                window.location.href = role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student'
            }, 1500)
        }
        setSaving(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Mon Profil</h1>
                <p className="text-neutral-500">Mettez à jour vos informations et votre rôle.</p>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 shadow-card border border-neutral-100 dark:border-neutral-700">
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 p-1 shadow-xl overflow-hidden relative">
                                <div className="w-full h-full rounded-[22px] bg-white dark:bg-neutral-900 flex items-center justify-center overflow-hidden">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-12 h-12 text-neutral-300" />
                                    )}
                                </div>
                                {uploading && (
                                    <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg flex items-center justify-center cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                                <Camera className="w-5 h-5 text-primary-600" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3">Votre Rôle</label>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'student', label: 'Étudiant', icon: User },
                                    { id: 'teacher', label: 'Professeur', icon: GraduationCap }
                                ].map((r) => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => setRole(r.id as any)}
                                        className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${role === r.id
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10 text-primary-600'
                                            : 'border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-neutral-200'
                                            }`}
                                    >
                                        <r.icon className="w-5 h-5" />
                                        <span className="font-bold text-sm">{r.label}</span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-neutral-400 mt-2 italic">Note: Changer de rôle vous redirigera vers le tableau de bord approprié.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">Nom Complet</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-5 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium"
                                placeholder="Votre nom complet"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2">Email</label>
                            <div className="w-full px-5 py-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-950 text-neutral-500 border border-neutral-200 dark:border-neutral-800 text-sm">
                                {email}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-neutral-100 dark:border-neutral-700 space-y-4">
                        {message && (
                            <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-medium ${message.type === 'success'
                                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                                : 'bg-red-50 border border-red-200 text-red-700'
                                }`}>
                                {message.type === 'success'
                                    ? <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    : <AlertCircle className="w-5 h-5 shrink-0" />
                                }
                                {message.text}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl gradient-primary text-white font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary-500/20"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Enregistrer les modifications
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
