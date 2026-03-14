'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Edit, Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CourseActionButtons({ courseId }: { courseId: string }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleDelete = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce cours définitivement ?")) return

        setIsDeleting(true)
        try {
            const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', courseId)

            if (error) throw error

            router.refresh()
            alert('Cours supprimé avec succès !')
        } catch (error: any) {
            console.error(error)
            alert('Erreur lors de la suppression: ' + error.message)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleEdit = () => {
        router.push(`/dashboard/teacher/courses/edit/${courseId}`)
    }

    return (
        <div className="flex items-center gap-2 pt-4 border-t border-neutral-50 dark:border-neutral-700/50 mt-auto">
            <button
                onClick={handleEdit}
                className="flex-1 py-2.5 bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 rounded-xl text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all flex items-center justify-center gap-2"
            >
                <Edit className="w-3.5 h-3.5" /> Modifier
            </button>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2.5 text-neutral-400 hover:text-error hover:bg-error/10 rounded-xl transition-all disabled:opacity-50"
                title="Supprimer ce cours"
            >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
        </div>
    )
}
