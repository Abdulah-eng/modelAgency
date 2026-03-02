import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: Record<string, unknown>) {
                    request.cookies.set(name, value);
                    response = NextResponse.next({ request });
                    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
                },
                remove(name: string, options: Record<string, unknown>) {
                    request.cookies.set(name, '');
                    response = NextResponse.next({ request });
                    response.cookies.set(name, '', options as Parameters<typeof response.cookies.set>[2]);
                },
            },
        }
    );

    const { data: { session } } = await supabase.auth.getSession();

    // Protect all /admin routes except /admin/login
    if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
        if (!session) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // If already logged in and visiting /admin/login, redirect to /admin
    if (request.nextUrl.pathname === '/admin/login' && session) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    return response;
}

export const config = {
    matcher: ['/admin/:path*'],
};
