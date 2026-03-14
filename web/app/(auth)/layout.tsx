export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Côté formulaire */}
            <div className="flex items-center justify-center p-8 bg-neutral-50 dark:bg-neutral-900">
                <div className="w-full max-w-md animate-fade-in">
                    {children}
                </div>
            </div>

            {/* Côté image/illustration */}
            <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-primary-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-primary-900" />
                <div className="relative z-10 text-center max-w-lg">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center mx-auto mb-8">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-4">Rejoignez EduFlow</h2>
                    <p className="text-primary-100 text-lg">
                        La plateforme d'apprentissage la plus moderne pour étudiants et professeurs.
                        Apprenez à votre rythme, partout, tout le temps.
                    </p>
                </div>

                {/* Cercles décoratifs */}
                <div className="absolute top-20 left-20 w-32 h-32 bg-primary-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob" />
                <div className="absolute bottom-20 right-20 w-32 h-32 bg-accent-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000" />
            </div>
        </div>
    )
}
