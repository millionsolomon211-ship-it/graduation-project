import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuthToken, decodeAuthToken } from '@/lib/auth-tokens';

async function getSession(token: string | undefined, hasRefresh: boolean) {
  let result = await verifyAuthToken(token);
  if (!result.valid && token && hasRefresh) {
    const decoded = decodeAuthToken(token);
    if (decoded?.sub) {
      result = {
        valid: true,
        payload: decoded,
        emailVerified: decoded.email_verified === true,
      };
    }
  }
  return result;
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const hasRefresh = !!request.cookies.get('refresh_token')?.value;
  const pathname = request.nextUrl.pathname;

  const isProtectedPath = pathname.startsWith('/dashboard');
  const isAuthPath =
    pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isVerifyEmailPath = pathname.startsWith('/verify-email');

  const { valid: validToken, emailVerified } = await getSession(token, hasRefresh);

  if (isProtectedPath) {
    if (!validToken) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      if (token) response.cookies.delete('auth_token');
      return response;
    }
    if (!emailVerified) {
      return NextResponse.redirect(new URL('/verify-email', request.url));
    }
    return NextResponse.next();
  }

  if (isVerifyEmailPath) {
    if (!validToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (emailVerified) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (isAuthPath && validToken) {
    const dest = emailVerified ? '/dashboard' : '/verify-email';
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
    '/verify-email',
  ],
};
