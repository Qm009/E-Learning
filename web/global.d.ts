// Dummy definitions to quiet down TS errors when node_modules is missing
declare module 'react';
declare module 'react-dom';
declare module 'next/link';
declare module 'next/image';
declare module 'next/navigation';
declare module 'lucide-react';
declare module '@supabase/ssr';
declare module '@/lib/supabase/client';
declare module '@/lib/supabase/server';
declare module '@/components/layouts/Sidebar';
declare module '@/types/database';

declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}
