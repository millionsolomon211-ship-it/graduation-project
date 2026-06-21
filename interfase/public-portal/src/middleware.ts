import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080/auth';
const KEYCLOAK_REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'public-citizen-portal';

// Fetch the Public Keys (JWKS) from Keycloak to verify signatures
const JWKS = createRemoteJWKSet(
  new URL(`${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`)
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  const isProtectedPath = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthPath = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup');

  let validToken = false;

  if (token) {
    try {
      // jwtVerify cryptographically checks the signature AND the 'exp' expiration time
      await jwtVerify(token, JWKS);
      validToken = true;
    } catch (error) {
      // Signature is invalid, token is expired, or incorrectly formatted
      validToken = false;
    }
  }

  if (isProtectedPath && !validToken) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    if (token) response.cookies.delete('auth_token');
    return response;
  }

  if (isAuthPath && validToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (isAuthPath && token && !validToken) {
     const response = NextResponse.next();
     response.cookies.delete('auth_token');
     return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
};


