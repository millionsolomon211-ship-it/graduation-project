import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookies, verifyAuthToken, decodeAuthToken } from '@/lib/auth-tokens';
import { refreshAccessToken } from '@/lib/keycloak-admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: 'No session. Please log in again.' }, { status: 401 });
    }

    const tokens = await refreshAccessToken(refreshToken);
    if (!tokens?.access_token) {
      return NextResponse.json({ error: 'Session expired. Please log in again.' }, { status: 401 });
    }

    let verified = await verifyAuthToken(tokens.access_token);
    let emailVerified = verified.emailVerified;

    if (!verified.valid) {
      const decoded = decodeAuthToken(tokens.access_token);
      emailVerified = decoded?.email_verified === true;
    }

    const response = NextResponse.json({ success: true, emailVerified });
    setAuthCookies(response, tokens.access_token, tokens.refresh_token);
    return response;
  } catch (err) {
    console.error('[refresh-session]', err);
    return NextResponse.json({ error: 'Failed to refresh session' }, { status: 500 });
  }
}
