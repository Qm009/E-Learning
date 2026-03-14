import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: 'class',
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#EEF2FF',
                    100: '#E0E7FF',
                    200: '#C7D2FE',
                    500: '#6366F1',
                    600: '#4F46E5',
                    700: '#4338CA',
                    900: '#1E1B4B',
                },
                accent: {
                    400: '#F59E0B',
                    500: '#D97706',
                },
                success: '#10B981',
                error: '#EF4444',
                warning: '#F59E0B',
                neutral: {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    400: '#94A3B8',
                    600: '#475569',
                    700: '#334155',
                    900: '#0F172A',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            spacing: {
                xs: '4px',
                sm: '8px',
                md: '16px',
                lg: '24px',
                xl: '32px',
                '2xl': '48px',
            },
            borderRadius: {
                sm: '6px',
                md: '10px',
                lg: '14px',
                xl: '20px',
            },
            boxShadow: {
                card: '0 4px 24px 0 rgba(99,102,241,0.07)',
                glow: '0 0 40px rgba(99,102,241,0.18)',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-in': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
            },
            animation: {
                'fade-in': 'fade-in 0.3s ease-out',
                'slide-in': 'slide-in 0.25s ease-out',
            },
        },
    },
    plugins: [],
}

export default config
