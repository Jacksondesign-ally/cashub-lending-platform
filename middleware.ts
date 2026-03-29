import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // The app uses localStorage-based Supabase auth (createClient from supabase-js).
  // Middleware cannot read localStorage — only cookies. Performing a cookie-based
  // session check here would always return no session and cause a redirect loop
  // that prevents users from accessing the app after login.
  //
  // All protected pages perform client-side auth checks via localStorage.
  // This middleware simply passes every request through.
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
