import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, decodeAuthToken } from '@/lib/auth-tokens';
import {
  getAdminToken,
  sendVerifyEmail,
  getClientIp,
} from '@/lib/keycloak-admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    const refreshToken = req.cookies.get('refresh_token')?.value;

    let verified = await verifyAuthToken(token);
    let userId = verified.payload?.sub as string | undefined;

    if ((!verified.valid || !userId) && token && refreshToken) {
      const decoded = decodeAuthToken(token);
      if (decoded?.sub) {
        userId = decoded.sub as string;
        verified = {
          valid: true,
          payload: decoded,
          emailVerified: decoded.email_verified === true,
        };
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized — please log in again' }, { status: 401 });
    }

    if (verified.emailVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    const clientIp = getClientIp(req.headers);
    const adminToken = await getAdminToken(clientIp);
    const result = await sendVerifyEmail(adminToken, userId, clientIp);

    if (!result.ok) {
      console.error('[resend-verify] Keycloak error:', result.error);
      return NextResponse.json(
        { error: result.error || 'Keycloak could not send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Verification email sent by Keycloak' });
  } catch (err) {
    console.error('[resend-verify]', err);
    const message = err instanceof Error ? err.message : 'Failed to resend verification email';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
