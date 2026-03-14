'use client'

import Sidebar from '@/components/layouts/Sidebar'
import Header from '@/components/layouts/Header'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Profile = {
    id: string
    role: 'student' | 'teacher' | 'admin'
    full_name?: string
    avatar_url?: string
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [profile, setProfile] = useState<Profile | null>(null)
    const supabase = createClient()

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const metadataRole = user.user_metadata?.role
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (data) {
                    setProfile(data)
                } else if (metadataRole) {
                    setProfile({
                        id: user.id,
                        role: metadataRole,
                        full_name: user.user_metadata?.full_name || 'Utilisateur',
                    })
                }
            }
        }
        loadProfile()
    }, [])

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                profile={profile}
            />

            <div className="flex-1 flex flex-col md:pl-72 transition-all duration-300">
                <Header onMenuClick={() => setIsSidebarOpen(true)} profile={profile} />

                {/* Contenu de la page */}
                <main className="p-4 md:p-8 flex-1 overflow-y-auto">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
