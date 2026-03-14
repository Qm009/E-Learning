import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Refresh session if expired — this is the only mandatory call
    const { data: { user } } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname
    const isProtected = pathname.startsWith('/dashboard')
    const isAuthPage = ['/login', '/register'].includes(pathname)

    // Redirect unauthenticated users away from protected pages
    if (isProtected && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    /* 
    // IF the user wants to keep the standard behavior (highly recommended):
    // If user is already logged in and tries to access auth pages → redirect to dashboard
    if (isAuthPage && user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const url = request.nextUrl.clone()
        if (profile?.role === 'teacher') {
            url.pathname = '/dashboard/teacher'
        } else if (profile?.role === 'admin') {
            url.pathname = '/dashboard/admin'
        } else {
            url.pathname = '/dashboard/student'
        }
        return NextResponse.redirect(url)
    }
    */

    // Role-based access enforcement for dashboard routes
    // Single DB call covers all role checks below
    if (user && isProtected) {
        const isDashboardStudent = pathname.startsWith('/dashboard/student')
        const isDashboardTeacher = pathname.startsWith('/dashboard/teacher')
        const isDashboardAdmin = pathname.startsWith('/dashboard/admin')

        // Only fetch profile if we are on a role-restricted path
        if (isDashboardStudent || isDashboardTeacher || isDashboardAdmin) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            const role = profile?.role

            if (isDashboardAdmin && role !== 'admin') {
                const url = request.nextUrl.clone()
                url.pathname = role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student'
                return NextResponse.redirect(url)
            }

            if (isDashboardTeacher && role !== 'teacher' && role !== 'admin') {
                const url = request.nextUrl.clone()
                url.pathname = '/dashboard/student'
                return NextResponse.redirect(url)
            }

            if (isDashboardStudent && (role === 'teacher' || role === 'admin')) {
                const url = request.nextUrl.clone()
                url.pathname = role === 'admin' ? '/dashboard/admin' : '/dashboard/teacher'
                return NextResponse.redirect(url)
            }
        }
    }

    return supabaseResponse
}
