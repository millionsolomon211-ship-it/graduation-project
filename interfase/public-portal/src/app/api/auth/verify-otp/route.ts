import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-session';
import { setAuthCookies } from '@/lib/auth-tokens';
import { verifyStoredOtp } from '@/lib/otp-store';
import {
  getAdminToken,
  markEmailVerified,
  refreshAccessToken,
  getClientIp,
} from '@/lib/keycloak-admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.emailVerified) {
      return NextResponse.json({ success: true, alreadyVerified: true });
    }

    const { otp } = await req.json();
    if (!otp || String(otp).length !== 6) {
      return NextResponse.json({ error: 'Enter a valid 6-digit code' }, { status: 400 });
    }

    const check = await verifyStoredOtp(String(otp), 'email_verify', {
      keycloakUserId: session.userId,
    });
    if (!check.valid) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    const clientIp = getClientIp(req.headers);
    const adminToken = await getAdminToken(clientIp);
    const marked = await markEmailVerified(adminToken, session.userId, clientIp);
    if (!marked) {
      return NextResponse.json({ error: 'Could not update account in Keycloak' }, { status: 500 });
    }

    const refreshToken = req.cookies.get('refresh_token')?.value;
    if (!refreshToken) {
      return NextResponse.json({ success: true, requiresLogin: true });
    }

    const tokens = await refreshAccessToken(refreshToken);
    if (!tokens?.access_token) {
      return NextResponse.json({ success: true, requiresLogin: true });
    }

    const response = NextResponse.json({ success: true });
    setAuthCookies(response, tokens.access_token, tokens.refresh_token);
    return response;
  } catch (err) {
    console.error('[verify-otp]', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
