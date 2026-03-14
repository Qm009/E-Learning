'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, BookOpen } from 'lucide-react'

export default function EnrollButton({ courseId }: { courseId: string }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleEnroll = async () => {
        setLoading(true)
        setError(null)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Veuillez vous connecter.')

            // Perform direct insertion into enrollments table
            // This is now allowed thanks to our recent RLS policy updates
            const { error: insertError } = await supabase
                .from('enrollments')
                .insert({
                    course_id: courseId,
                    student_id: session.user.id,
                    status: 'in_progress',
                    progress: 0
                })

            if (insertError) {
                // If the error is about a duplicate enrollment, we can treat it as success or show specific message
                if (insertError.code === '23505') {
                    throw new Error('Vous êtes déjà inscrit à ce cours.')
                }
                throw insertError
            }

            // Refresh the page to show enrolled state
            router.refresh()
        } catch (e: any) {
            setError(e.message || 'Une erreur est survenue.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-3">
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-xs font-medium">
                    ⚠️ {error}
                </div>
            )}
            <button
                onClick={handleEnroll}
                disabled={loading}
                className="w-full py-4 rounded-2xl gradient-primary text-white font-bold hover:opacity-90 transition-all shadow-xl shadow-primary-500/30 flex items-center justify-center gap-2 disabled:opacity-60"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Inscription en cours...
                    </>
                ) : (
                    <>
                        <BookOpen className="w-5 h-5" />
                        S&apos;inscrire gratuitement
                    </>
                )}
            </button>
        </div>
    )
}
