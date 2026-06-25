import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-session';
import { setAuthCookies } from '@/lib/auth-tokens';
import { getEmailVerificationService } from '@/modules/auth/infrastructure/di/Container';

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

    const emailVerificationService = getEmailVerificationService();
    const result = await emailVerificationService.verify({
      code: String(otp),
      type: 'email_verify',
      keycloakUserId: session.userId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Email verified - user must login again to get updated token
    return NextResponse.json({ success: true, requiresLogin: true });
  } catch (err) {
    console.error('[verify-otp]', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
