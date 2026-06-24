import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt } from 'jose';
import { setAuthCookies } from '@/lib/auth-tokens';
import { loginWithPassword, getClientIp } from '@/lib/keycloak-admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const clientIp = getClientIp(req.headers);
    const result = await loginWithPassword(username, password, clientIp);

    if (!result.ok || !result.tokens?.access_token) {
      return NextResponse.json(
        { error: result.error || 'Invalid credentials' },
        { status: 401 }
      );
    }

    let emailVerified = false;
    try {
      emailVerified = decodeJwt(result.tokens.access_token).email_verified === true;
    } catch { /* ignore */ }

    const response = NextResponse.json({ success: true, emailVerified });
    setAuthCookies(response, result.tokens.access_token, result.tokens.refresh_token);
    return response;
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
