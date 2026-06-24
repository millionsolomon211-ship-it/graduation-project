import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-tokens';
import {
  getAdminToken,
  sendVerifyEmail,
  getClientIp,
} from '@/lib/keycloak-admin';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    const { valid, payload, emailVerified } = await verifyAuthToken(token);

    if (!valid || !payload?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (emailVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    const clientIp = getClientIp(req.headers);
    const adminToken = await getAdminToken(clientIp);
    const sent = await sendVerifyEmail(adminToken, payload.sub as string, clientIp);

    if (!sent) {
      return NextResponse.json(
        { error: 'Keycloak could not send the verification email. Check SMTP settings.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Verification email sent by Keycloak' });
  } catch (err) {
    console.error('[resend-verify]', err);
    return NextResponse.json({ error: 'Failed to resend verification email' }, { status: 500 });
  }
}
