'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { BookOpen, Loader2, Save, ArrowLeft, AlertCircle, CheckCircle2, FileText, Trash2, Plus, Download } from 'lucide-react'
import Link from 'next/link'

export default function EditCoursePage() {
    const params = useParams()
    const id = params?.id as string
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [status, setStatus] = useState('published')
    const [materials, setMaterials] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function fetchCourseData() {
            setFetching(true)
            // 1. Fetch Course
            const { data: course, error: courseError } = await supabase
                .from('courses')
                .select('title, description, status')
                .eq('id', id)
                .single()

            if (courseError || !course) {
                setMessage({ type: 'error', text: 'Cours introuvable ou accès refusé.' })
            } else {
                setTitle(course.title)
                setDescription(course.description || '')
                setStatus(course.status as 'draft' | 'published')

                // 2. Fetch Materials
                const { data: mats } = await supabase
                    .from('course_materials')
                    .select('*')
                    .eq('course_id', id)

                setMaterials(mats || [])
            }
            setFetching(false)
        }
        if (id) fetchCourseData()
    }, [id])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const { error } = await supabase
                .from('courses')
                .update({ title, description, status })
                .eq('id', id)

            if (error) throw error

            setMessage({ type: 'success', text: 'Cours mis à jour avec succès !' })
            setTimeout(() => router.push('/dashboard/teacher/courses'), 1500)
        } catch (error: any) {
            setMessage({ type: 'error', text: 'Erreur : ' + error.message })
        } finally {
            setLoading(false)
        }
    }

    const handleAddMaterial = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return
        setUploading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Non connecté")

            for (const file of Array.from(e.target.files)) {
                const ext = file.name.split('.').pop()
                const filePath = `res-${user.id}-${Math.random()}.${ext}`

                const { error: upError } = await supabase.storage
                    .from('pedagogic-materials')
                    .upload(filePath, file)

                if (upError) throw upError

                const { data: { publicUrl } } = supabase.storage
                    .from('pedagogic-materials')
                    .getPublicUrl(filePath)

                const { data: newMat, error: insError } = await supabase
                    .from('course_materials')
                    .insert({
                        course_id: id,
                        file_name: file.name,
                        file_url: publicUrl,
                        file_type: ext,
                        size_bytes: file.size
                    })
                    .select()
                    .single()

                if (insError) throw insError
                setMaterials(prev => [...prev, newMat])
            }
        } catch (error: any) {
            alert("Erreur upload: " + error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteMaterial = async (matId: string) => {
        if (!confirm("Supprimer ce document ?")) return
        try {
            const { error } = await supabase
                .from('course_materials')
                .delete()
                .eq('id', matId)

            if (error) throw error
            setMaterials(prev => prev.filter(m => m.id !== matId))
        } catch (error: any) {
            alert("Erreur suppression: " + error.message)
        }
    }

    if (fetching) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="animate-spin text-primary-500 w-10 h-10" />
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto pb-20 animate-fade-in">
            <Link
                href="/dashboard/teacher/courses"
                className="inline-flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-primary-600 transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Retour à mes cours
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Modifier le cours</h1>
                <p className="text-neutral-500">Mettez à jour les informations et les documents pédagogiques.</p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-2xl flex items-start gap-3 ${message.type === 'success'
                    ? 'bg-success/10 border border-success/20 text-success'
                    : 'bg-error/10 border border-error/20 text-error'
                    }`}>
                    {message.type === 'success'
                        ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                        : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                    <p className="text-sm font-medium">{message.text}</p>
                </div>
            )}

            <div className="grid gap-8">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-card border border-neutral-100 dark:border-neutral-700 space-y-6">
                        <div className="flex items-center gap-2 text-primary-600 font-bold text-sm uppercase tracking-wider">
                            <BookOpen className="w-4 h-4" /> Détails du cours
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300">
                                Titre du cours <span className="text-error">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-5 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300">
                                Description
                            </label>
                            <textarea
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-5 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300">
                                Statut
                            </label>
                            <div className="flex gap-4">
                                {(['published', 'draft'] as const).map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setStatus(s)}
                                        className={`flex-1 py-3 px-4 rounded-2xl border-2 font-bold text-sm transition-all ${status === s
                                            ? s === 'published'
                                                ? 'border-success bg-success/10 text-success'
                                                : 'border-warning bg-warning/10 text-warning'
                                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:border-neutral-300'
                                            }`}
                                    >
                                        {s === 'published' ? '✅ Publié' : '📝 Brouillon'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-10 py-4 rounded-2xl bg-primary-600 text-white font-bold disabled:opacity-50 shadow-xl hover:bg-primary-700 transition-colors flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Enregistrer les infos
                        </button>
                    </div>
                </form>

                {/* Materials Management Section */}
                <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-card border border-neutral-100 dark:border-neutral-700 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-primary-600 font-bold text-sm uppercase tracking-wider">
                            <FileText className="w-4 h-4" /> Documents Pédagogiques
                        </div>
                        <label className="cursor-pointer flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 px-4 py-2 rounded-xl text-xs font-bold hover:bg-neutral-200 transition-colors">
                            <Plus className="w-4 h-4" /> Ajouter
                            <input type="file" multiple className="hidden" onChange={handleAddMaterial} accept=".pdf,.ppt,.pptx" />
                        </label>
                    </div>

                    {uploading && (
                        <div className="flex items-center justify-center p-4 bg-primary-50 dark:bg-primary-900/10 rounded-2xl animate-pulse">
                            <Loader2 className="w-5 h-5 animate-spin text-primary-500 mr-2" />
                            <span className="text-sm font-bold text-primary-600">Envoi en cours...</span>
                        </div>
                    )}

                    <div className="space-y-3">
                        {materials.length > 0 ? (
                            materials.map((mat) => (
                                <div key={mat.id} className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-700 group">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-bold text-neutral-900 dark:text-white truncate">{mat.file_name}</span>
                                            <span className="text-[10px] text-neutral-500 uppercase font-black">{mat.file_type}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <a href={mat.file_url} target="_blank" rel="noreferrer" className="p-2 text-neutral-400 hover:text-primary-500 transition-colors">
                                            <Download className="w-4 h-4" />
                                        </a>
                                        <button onClick={() => handleDeleteMaterial(mat.id)} className="p-2 text-neutral-400 hover:text-error transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-neutral-400 text-sm font-medium border-2 border-dashed border-neutral-100 dark:border-neutral-800 rounded-2xl">
                                Aucun document chargé.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
