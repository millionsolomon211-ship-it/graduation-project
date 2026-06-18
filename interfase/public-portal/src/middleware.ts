import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the token from cookies
  const token = request.cookies.get('auth_token')?.value;

  // Paths that require authentication
  const isProtectedPath = request.nextUrl.pathname.startsWith('/dashboard');
  
  // Paths for authentication (redirect away if already logged in)
  const isAuthPath = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup');

  if (isProtectedPath && !token) {
    // If trying to access a protected path without a token, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPath && token) {
    // If trying to access auth pages with a token, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Ensure the middleware only runs on specific routes
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};
