import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken } from '@/lib/auth-tokens';
import { sendVerificationOtp } from '@/lib/email';
import {
  generateOtp,
  hashOtp,
  getOtpExpiry,
  OTP_ATTRIBUTES,
} from '@/lib/otp';
import {
  getAdminToken,
  getUserById,
  updateUser,
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

    const email = payload.email as string | undefined;
    if (!email) {
      return NextResponse.json({ error: 'No email on account' }, { status: 400 });
    }

    const clientIp = getClientIp(req.headers);
    const adminToken = await getAdminToken(clientIp);
    const user = await getUserById(adminToken, payload.sub as string, clientIp);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const otp = generateOtp();
    const attrs = {
      ...(user.attributes || {}),
      [OTP_ATTRIBUTES.verify.code]: [hashOtp(otp)],
      [OTP_ATTRIBUTES.verify.expiry]: [getOtpExpiry()],
    };

    await updateUser(adminToken, user.id, { attributes: attrs }, clientIp);
    await sendVerificationOtp(
      email,
      otp,
      user.firstName || undefined
    );

    return NextResponse.json({ success: true, message: 'Verification code sent' });
  } catch (err) {
    console.error('[send-otp]', err);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
