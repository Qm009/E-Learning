'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { BookOpen, Upload, Plus, Loader2, Trash2, FileText, Paperclip, AlertCircle } from 'lucide-react'

type PedagogicDocument = {
    name: string
    url: string
    type: string
    size: number
}

export default function CreateCoursePage() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [materials, setMaterials] = useState<PedagogicDocument[]>([])

    const [loading, setLoading] = useState(false)
    const [verifying, setVerifying] = useState(true)
    const [profileExists, setProfileExists] = useState(false)
    const [uploadingCover, setUploadingCover] = useState(false)
    const [uploadingMaterials, setUploadingMaterials] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    // Vérifier si le profil de l'enseignant est prêt avant de commencer
    useEffect(() => {
        async function checkProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('profiles').select('id').eq('id', user.id).single()
                if (data) setProfileExists(true)
            }
            setVerifying(false)
        }
        checkProfile()
    }, [])

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        try {
            setUploadingCover(true)
            if (!e.target.files || e.target.files.length === 0) return
            const file = e.target.files[0]
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const fileExt = file.name.split('.').pop()
            const filePath = `course-${user.id}-${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage.from('course-images').upload(filePath, file)
            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage.from('course-images').getPublicUrl(filePath)
            setImageUrl(publicUrl)
        } catch (error: any) {
            alert('Erreur image : ' + error.message)
        } finally {
            setUploadingCover(false)
        }
    }

    async function handleMaterialUpload(e: React.ChangeEvent<HTMLInputElement>) {
        try {
            setUploadingMaterials(true)
            if (!e.target.files || e.target.files.length === 0) return
            const files = Array.from(e.target.files)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const uploadedOnes: PedagogicDocument[] = []
            for (const file of files) {
                const ext = file.name.split('.').pop()?.toLowerCase()
                if (!['pdf', 'ppt', 'pptx'].includes(ext || '')) {
                    alert(`Le fichier ${file.name} n'est pas supporté. Utilisez PDF ou PPT.`)
                    continue
                }

                const filePath = `res-${user.id}-${Math.random()}.${ext}`
                const { error: uploadError } = await supabase.storage
                    .from('pedagogic-materials')
                    .upload(filePath, file)

                if (uploadError) {
                    alert(`Erreur lors de l'envoi de ${file.name}: ${uploadError.message}`)
                    continue
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('pedagogic-materials')
                    .getPublicUrl(filePath)

                uploadedOnes.push({
                    name: file.name,
                    url: publicUrl,
                    type: ext || 'doc',
                    size: file.size
                })
            }
            setMaterials([...materials, ...uploadedOnes])
        } catch (error: any) {
            alert('Erreur documents : ' + error.message)
        } finally {
            setUploadingMaterials(false)
        }
    }

    async function handleCreateCourse(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("Veuillez vous reconnecter.")

            // On vérifie une dernière fois si le profil existe
            if (!profileExists) {
                throw new Error("Votre profil enseignant n'est pas encore prêt en base de données. Exécutez le script SQL fourni.")
            }

            // 1. Insertion du cours
            const { data: course, error: courseError } = await supabase.from('courses').insert({
                title,
                description,
                image_url: imageUrl,
                teacher_id: user.id,
                status: 'published', // On le met direct en publié pour qu'il soit visible
            }).select().single()

            if (courseError) throw courseError

            // 2. Insertion des documents
            if (materials.length > 0) {
                const matToInsert = materials.map(m => ({
                    course_id: course.id,
                    file_name: m.name,
                    file_url: m.url,
                    file_type: m.type,
                    size_bytes: m.size
                }))
                await supabase.from('course_materials').insert(matToInsert)
            }

            router.push('/dashboard/teacher/courses')
            router.refresh()
        } catch (error: any) {
            alert("Échec : " + error.message)
        } finally {
            setLoading(false)
        }
    }

    if (verifying) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-primary-500 w-10 h-10" /></div>

    return (
        <div className="max-w-3xl pb-20 animate-fade-in">
            {!profileExists && (
                <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-2xl flex items-start gap-3 text-error">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Attention</p>
                        <p className="text-sm">Votre compte n'est pas encore synchronisé avec la base de données. Vous ne pourrez pas publier tant que vous n'aurez pas lancé le dernier script SQL dans Supabase.</p>
                    </div>
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Publier un nouveau contenu</h1>
                <p className="text-neutral-500">Ajoutez des documents et partagez votre savoir.</p>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-8">
                <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-card border border-neutral-100 dark:border-neutral-700 space-y-6">
                    <div className="flex items-center gap-2 text-primary-600 font-bold text-sm uppercase tracking-wider">
                        <BookOpen className="w-4 h-4" /> Détails
                    </div>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white" placeholder="Titre du cours" />
                    <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white" placeholder="Description" />
                </div>

                <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-card border border-neutral-100 dark:border-neutral-700">
                    <div className="flex items-center gap-2 text-primary-600 font-bold text-sm uppercase mb-6"><Upload className="w-4 h-4" /> Couverture</div>
                    <div className="border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-3xl p-10 text-center">
                        {imageUrl ? <img src={imageUrl} alt="Preview" className="w-full max-h-56 object-cover rounded-2xl mb-4" /> : uploadingCover ? <Loader2 className="animate-spin mx-auto w-10 h-10 text-primary-500" /> : <label className="cursor-pointer bg-neutral-100 dark:bg-neutral-700 px-6 py-3 rounded-2xl">Choisir une image<input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label>}
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-800 p-8 rounded-3xl shadow-card border border-neutral-100 dark:border-neutral-700 text-center">
                    <div className="flex items-center gap-2 text-primary-600 font-bold text-sm uppercase mb-6"><Paperclip className="w-4 h-4" /> Documents (PDF / PPT)</div>
                    {materials.length > 0 && <div className="text-left space-y-2 mb-6">{materials.map((m, i) => <div key={i} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl text-sm font-medium"><FileText className="w-4 h-4 text-blue-500" /> {m.name} <button type="button" onClick={() => setMaterials(materials.filter((_, idx) => idx !== i))}><Trash2 className="w-4 h-4 text-error" /></button></div>)}</div>}
                    {uploadingMaterials ? <Loader2 className="animate-spin mx-auto text-primary-500" /> : <label className="cursor-pointer bg-primary-50 dark:bg-primary-900/30 text-primary-600 px-6 py-3 rounded-2xl">Ajouter des fichiers<input type="file" className="hidden" multiple accept=".pdf,.ppt,.pptx" onChange={handleMaterialUpload} /></label>}
                </div>

                <div className="flex justify-end gap-4">
                    <button type="button" onClick={() => router.back()} className="px-8 py-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 text-neutral-500 font-bold">Annuler</button>
                    <button disabled={loading || !profileExists} type="submit" className="px-10 py-4 rounded-2xl bg-primary-600 text-white font-bold disabled:opacity-50 shadow-xl">
                        {loading ? 'Publication...' : 'Publier maintenant'}
                    </button>
                </div>
            </form>
        </div>
    )
}
