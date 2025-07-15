import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Skip middleware if Supabase credentials are not available (during build time)
  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  await supabase.auth.getSession()

  const { data: { user } } = await supabase.auth.getUser()

  const protectedPaths = ['/dashboard', '/map', '/leaderboard', '/plan', '/profile']
  const isProtected = protectedPaths.some(p => request.nextUrl.pathname.startsWith(p))
  const authPaths = ['/login', '/signup']
  const isAuthPath = authPaths.some(p => request.nextUrl.pathname.startsWith(p))

  // Handle root path - redirect based on authentication status
  if (request.nextUrl.pathname === '/') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // if user is not signed in and the current path is protected, redirect the user to the login page.
  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // if user is signed in and the current path is an auth path, redirect the user to the dashboard page.
  if (user && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth/callback (the auth callback route)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth/callback).*)',
  ],
}
