import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-tokens';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const pathname = request.nextUrl.pathname;

  const isProtectedPath = pathname.startsWith('/dashboard');
  const isAuthPath =
    pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isVerifyOtpPath = pathname.startsWith('/verify-otp');

  const { valid: validToken, emailVerified } = await verifyAuthToken(token);

  if (isProtectedPath) {
    if (!validToken) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      if (token) response.cookies.delete('auth_token');
      return response;
    }
    if (!emailVerified) {
      return NextResponse.redirect(new URL('/verify-otp', request.url));
    }
    return NextResponse.next();
  }

  if (isVerifyOtpPath) {
    if (!validToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (emailVerified) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (isAuthPath && validToken) {
    const dest = emailVerified ? '/dashboard' : '/verify-otp';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (isAuthPath && token && !validToken) {
    const response = NextResponse.next();
    response.cookies.delete('auth_token');
    response.cookies.delete('refresh_token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/verify-otp',
  ],
};
