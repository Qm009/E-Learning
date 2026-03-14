'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Bell, Search, Menu } from 'lucide-react'

type Profile = {
    id: string
    role: 'student' | 'teacher' | 'admin'
    full_name?: string
    avatar_url?: string
}

export default function Header({ onMenuClick, profile }: { onMenuClick?: () => void; profile: Profile | null }) {
    const supabase = createClient()

    return (
        <header className="h-20 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                    <Menu className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
                </button>
                <div className="hidden md:flex items-center gap-3 bg-neutral-100 dark:bg-neutral-800 px-4 py-2.5 rounded-2xl w-96 border border-neutral-200/50 dark:border-neutral-700/50">
                    <Search className="w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Rechercher un cours, un sujet..."
                        className="bg-transparent border-none outline-none text-sm text-neutral-900 dark:text-white w-full placeholder:text-neutral-400"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                <button className="relative p-2.5 rounded-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group">
                    <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400 group-hover:text-primary-600 transition-colors" />
                    <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
                    </span>
                </button>

                <div className="h-10 w-[1px] bg-neutral-200 dark:bg-neutral-800 hidden md:block"></div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col text-right">
                        <span className="text-sm font-bold text-neutral-900 dark:text-white">
                            {profile?.full_name || 'Utilisateur'}
                        </span>
                        <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                            {profile?.role === 'teacher' ? 'Enseignant' : 'Étudiant'}
                        </span>
                    </div>
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-[2px] shadow-lg shadow-primary-500/20">
                        <div className="w-full h-full rounded-[14px] bg-white dark:bg-neutral-900 overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold text-lg">
                                    {profile?.full_name?.charAt(0).toUpperCase() || '?'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
