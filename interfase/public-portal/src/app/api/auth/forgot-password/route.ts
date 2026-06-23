import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetOtp } from '@/lib/email';
import {
  generateOtp,
  hashOtp,
  getOtpExpiry,
  OTP_ATTRIBUTES,
} from '@/lib/otp';
import {
  getAdminToken,
  findUserByEmail,
  updateUser,
  getClientIp,
} from '@/lib/keycloak-admin';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const clientIp = getClientIp(req.headers);
    const adminToken = await getAdminToken(clientIp);
    const user = await findUserByEmail(adminToken, email, clientIp);

    // Always return success to avoid email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a reset code has been sent.',
      });
    }

    const otp = generateOtp();
    const attrs = {
      ...(user.attributes || {}),
      [OTP_ATTRIBUTES.reset.code]: [hashOtp(otp)],
      [OTP_ATTRIBUTES.reset.expiry]: [getOtpExpiry()],
    };

    await updateUser(adminToken, user.id, { attributes: attrs }, clientIp);
    await sendPasswordResetOtp(email, otp, user.firstName || undefined);

    return NextResponse.json({
      success: true,
      message: 'If an account exists, a reset code has been sent.',
    });
  } catch (err) {
    console.error('[forgot-password]', err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
