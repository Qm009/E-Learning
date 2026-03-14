'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy, Award, Download, Calendar, ExternalLink, Loader2 } from 'lucide-react'
import Link from 'next/link'

type Certificate = {
    id: string
    score_percentage: number
    issued_at: string
    certificate_code: string
    courses: { title: string; image_url: string | null } | null
}

export default function CertificatesPage() {
    const [certificates, setCertificates] = useState<Certificate[]>([])
    const [loading, setLoading] = useState(true)
    const [downloadingId, setDownloadingId] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function fetchCerts() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { setLoading(false); return }

            const { data, error } = await supabase
                .from('certificates')
                .select(`
                    id,
                    score_percentage,
                    issued_at,
                    certificate_code,
                    courses:course_id (title, image_url)
                `)
                .eq('student_id', user.id)
                .order('issued_at', { ascending: false })

            if (error) console.error('Error fetching certificates:', error)
            if (data) setCertificates(data as unknown as Certificate[])
            setLoading(false)
        }
        fetchCerts()
    }, [])

    const handleDownload = async (certId: string) => {
        setDownloadingId(certId)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Session expirée')

            const res = await fetch(
                '/api/quiz/generate-certificate',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ certificate_id: certId }),
                }
            )

            if (!res.ok) throw new Error('Erreur lors de la génération')

            const html = await res.text()

            // Open in a new tab so the user can print/save as PDF
            const blob = new Blob([html], { type: 'text/html' })
            const url = URL.createObjectURL(blob)
            const win = window.open(url, '_blank')
            if (win) {
                // Auto-trigger print dialog so user can "Save as PDF"
                win.onload = () => {
                    win.focus()
                    win.print()
                }
            }
        } catch (e: any) {
            alert('Impossible de générer le certificat : ' + e.message)
        } finally {
            setDownloadingId(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-primary-500" />
                    Mes Certificats
                </h1>
                <p className="text-neutral-500">Retrouvez toutes vos certifications obtenues sur EduFlow.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.length > 0 ? (
                    certificates.map((cert) => (
                        <div
                            key={cert.id}
                            className="group bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300"
                        >
                            {/* Certificate Preview */}
                            <div className="aspect-[1.41] bg-gradient-to-br from-primary-50 to-indigo-100 dark:from-primary-950 dark:to-indigo-900 relative flex items-center justify-center p-6 overflow-hidden">
                                <Award className="absolute w-48 h-48 text-primary-500/5 rotate-12" />
                                <div className="z-10 bg-white dark:bg-neutral-950 border-4 border-primary-500/20 p-4 w-full h-full flex flex-col items-center justify-center text-center rounded-xl shadow-sm">
                                    <Trophy className="w-10 h-10 text-primary-500 mb-3" />
                                    <div className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-2">
                                        CERTIFICAT DE RÉUSSITE
                                    </div>
                                    <div className="text-[8px] text-neutral-400 mb-1">Pour la validation du cours</div>
                                    <div className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200 uppercase leading-tight">
                                        {cert.courses?.title}
                                    </div>

                                    {/* Score badge */}
                                    <div className="mt-3 px-3 py-1 bg-primary-600 text-white text-[10px] font-bold rounded-full">
                                        {cert.score_percentage}%
                                    </div>
                                </div>
                            </div>

                            {/* Card Bottom */}
                            <div className="p-6">
                                <h3 className="font-bold text-neutral-900 dark:text-white mb-4 line-clamp-1">
                                    {cert.courses?.title}
                                </h3>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Obtenu le {new Date(cert.issued_at).toLocaleDateString('fr-FR', {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                        <span className="truncate">{cert.certificate_code}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDownload(cert.id)}
                                    disabled={downloadingId === cert.id}
                                    className="w-full py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-600 hover:text-white transition-all shadow-lg disabled:opacity-60"
                                >
                                    {downloadingId === cert.id ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Génération...</>
                                    ) : (
                                        <><Download className="w-4 h-4" /> Télécharger (PDF)</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center bg-white dark:bg-neutral-900 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                        <Award className="w-20 h-20 text-neutral-200 dark:text-neutral-700 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                            Pas encore de certificats
                        </h3>
                        <p className="text-neutral-500 max-w-sm mx-auto mb-8">
                            Complétez des cours et réussissez vos quiz pour obtenir des certifications officielles.
                        </p>
                        <Link
                            href="/dashboard/student/courses"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20"
                        >
                            Commencer un cours
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
