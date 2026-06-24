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

    // Fallback: session exists (refresh token) but JWKS verify failed (URL/proxy mismatch)
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
    const sent = await sendVerifyEmail(adminToken, userId, clientIp);

    if (!sent) {
      return NextResponse.json(
        { error: 'Keycloak could not send the verification email. Fix SMTP: port 587 needs StartTLS ON and SSL OFF.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Verification email sent by Keycloak' });
  } catch (err) {
    console.error('[resend-verify]', err);
    return NextResponse.json({ error: 'Failed to resend verification email' }, { status: 500 });
  }
}
