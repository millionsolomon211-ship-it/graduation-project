import { NextRequest, NextResponse } from 'next/server';
import {
  isOtpExpired,
  verifyOtpHash,
  OTP_ATTRIBUTES,
} from '@/lib/otp';
import {
  getAdminToken,
  findUserByEmail,
  updateUser,
  resetUserPassword,
  getClientIp,
} from '@/lib/keycloak-admin';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, password } = await req.json();

    if (!email || !otp || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const clientIp = getClientIp(req.headers);
    const adminToken = await getAdminToken(clientIp);
    const user = await findUserByEmail(adminToken, email, clientIp);

    if (!user?.attributes) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    const storedHash = user.attributes[OTP_ATTRIBUTES.reset.code]?.[0];
    const expiry = user.attributes[OTP_ATTRIBUTES.reset.expiry]?.[0];

    if (isOtpExpired(expiry) || !verifyOtpHash(String(otp), storedHash)) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    const clearedAttrs = { ...(user.attributes || {}) };
    delete clearedAttrs[OTP_ATTRIBUTES.reset.code];
    delete clearedAttrs[OTP_ATTRIBUTES.reset.expiry];

    const passwordOk = await resetUserPassword(adminToken, user.id, password, clientIp);
    if (!passwordOk) {
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }

    await updateUser(adminToken, user.id, { attributes: clearedAttrs }, clientIp);

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('[reset-password]', err);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
