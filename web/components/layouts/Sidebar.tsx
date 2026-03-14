'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
    BookOpen,
    LayoutDashboard,
    GraduationCap,
    Settings,
    LogOut,
    Users,
    X,
    MessageSquare,
    BrainCircuit,
    ChevronRight,
    Trophy
} from 'lucide-react'

type Profile = {
    id: string
    role: 'student' | 'teacher' | 'admin'
    email: string
    full_name?: string
    avatar_url?: string
}

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export default function Sidebar({ isOpen, onClose, profile }: SidebarProps & { profile: Profile | null }) {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut()
            // Force a full page reload to clear all caches/state
            window.location.href = '/login'
        } catch (error) {
            console.error('Logout error:', error)
            window.location.href = '/login'
        }
    }

    const getLinks = (userProfile: Profile | null) => {
        if (!userProfile) return []

        if (userProfile.role === 'admin') {
            return [
                { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
                { name: 'Utilisateurs', href: '/dashboard/admin/users', icon: Users },
            ]
        }

        if (userProfile.role === 'teacher') {
            return [
                { name: 'Tableau de bord', href: '/dashboard/teacher', icon: LayoutDashboard },
                { name: 'Mes Cours', href: '/dashboard/teacher/courses', icon: BookOpen },
                { name: 'Gestion des Quiz', href: '/dashboard/teacher/quizzes', icon: BrainCircuit },
                { name: 'Réponses Étudiants', href: '/dashboard/teacher/qna', icon: MessageSquare },
            ]
        }

        return [
            { name: 'Tableau de bord', href: '/dashboard/student', icon: LayoutDashboard },
            { name: 'Catalogue Cours', href: '/dashboard/student/courses', icon: BookOpen },
            { name: 'Mes Quiz & IA', href: '/dashboard/student/quizzes', icon: GraduationCap },
            { name: 'Mes Certificats', href: '/dashboard/student/certificates', icon: Trophy },
            { name: 'Mes Questions', href: '/dashboard/student/qna', icon: MessageSquare },
        ]
    }

    const links = getLinks(profile)

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[60] md:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            <aside
                className={`w-72 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 h-screen flex flex-col fixed left-0 top-0 z-[70] transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-8 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-2xl tracking-tight text-neutral-900 dark:text-neutral-50">EduFlow</span>
                        </div>
                        <button onClick={onClose} className="md:hidden p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
                            <X className="w-5 h-5 text-neutral-500" />
                        </button>
                    </div>

                    <nav className="space-y-1.5 flex-1">
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-600 mb-4 px-3">
                            Menu Principal
                        </div>
                        {links.map((link) => {
                            const isActive = pathname === link.href || (link.href !== '/dashboard/teacher' && link.href !== '/dashboard/student' && pathname.startsWith(link.href))
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => onClose()}
                                    className={`group flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${isActive
                                        ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 shadow-sm'
                                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <link.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400 group-hover:text-neutral-500 dark:group-hover:text-neutral-300'}`} />
                                        {link.name}
                                    </div>
                                    {isActive && <ChevronRight className="w-4 h-4 text-primary-500" />}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="pt-8 mt-8 border-t border-neutral-200 dark:border-neutral-800">
                        <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4 mb-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    {profile?.full_name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                                        {profile?.full_name || 'Utilisateur'}
                                    </span>
                                    <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">{profile?.role === 'teacher' ? 'Professeur' : 'Étudiant'}</span>
                                </div>
                            </div>
                            <Link
                                href="/dashboard/settings"
                                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-bold bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shadow-sm"
                            >
                                <Settings className="w-3.5 h-3.5" /> Paramètres
                            </Link>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-bold text-error border border-error/10 hover:bg-error/5 transition-all duration-200 group"
                        >
                            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Déconnexion
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
