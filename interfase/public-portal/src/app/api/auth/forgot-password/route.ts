import { NextRequest, NextResponse } from 'next/server';
import { issueOtp } from '@/lib/otp-store';
import { sendPasswordResetOtp } from '@/lib/email';
import {
  getAdminToken,
  findUserByEmail,
  getClientIp,
} from '@/lib/keycloak-admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const clientIp = getClientIp(req.headers);
    const adminToken = await getAdminToken(clientIp);
    const user = await findUserByEmail(adminToken, email, clientIp);

    if (user?.email) {
      const otp = await issueOtp(user.id, user.email, 'password_reset');
      await sendPasswordResetOtp(user.email, otp, user.firstName);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists, a reset code has been sent.',
    });
  } catch (err) {
    console.error('[forgot-password]', err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
