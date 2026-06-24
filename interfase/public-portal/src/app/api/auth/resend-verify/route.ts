import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-session';
import { issueOtp } from '@/lib/otp-store';
import { sendVerificationOtp } from '@/lib/email';
import { getAdminToken, getUserById, getClientIp } from '@/lib/keycloak-admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized — please log in again' }, { status: 401 });
    }
    if (session.emailVerified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }
    if (!session.email) {
      return NextResponse.json({ error: 'No email on account' }, { status: 400 });
    }

    const clientIp = getClientIp(req.headers);
    const adminToken = await getAdminToken(clientIp);
    const user = await getUserById(adminToken, session.userId, clientIp);

    const otp = await issueOtp(session.userId, session.email, 'email_verify');
    await sendVerificationOtp(session.email, otp, user?.firstName);

    return NextResponse.json({ success: true, message: 'Verification code sent' });
  } catch (err) {
    console.error('[resend-verify]', err);
    const message = err instanceof Error ? err.message : 'Failed to send verification code';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
