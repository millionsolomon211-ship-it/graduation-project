import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-session';
import { getEmailVerificationService } from '@/modules/auth/infrastructure/di/Container';
import { getEmailRepository } from '@/modules/auth/infrastructure/di/Container';
import { getUserRepository } from '@/modules/auth/infrastructure/di/Container';

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

    const emailVerificationService = getEmailVerificationService();
    const result = await emailVerificationService.resendVerification(
      session.userId,
      session.email,
      ''
    );

    if (!result.success || !result.otp) {
      return NextResponse.json({ error: result.error || 'Failed to generate verification code' }, { status: 500 });
    }

    // Get user details for email
    const userRepository = getUserRepository();
    const user = await userRepository.findById(session.userId);

    // Send email
    const emailRepository = getEmailRepository();
    await emailRepository.sendVerificationEmail(session.email, result.otp, user?.firstName || '');

    return NextResponse.json({ success: true, message: 'Verification code sent' });
  } catch (err) {
    console.error('[resend-verify]', err);
    const message = err instanceof Error ? err.message : 'Failed to send verification code';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
