import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, setAuthCookies } from '@/lib/auth-tokens';
import {
  isOtpExpired,
  verifyOtpHash,
  OTP_ATTRIBUTES,
} from '@/lib/otp';
import {
  getAdminToken,
  getUserById,
  updateUser,
  refreshAccessToken,
  getClientIp,
} from '@/lib/keycloak-admin';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value;
    const refreshToken = req.cookies.get('refresh_token')?.value;
    const { valid, payload, emailVerified } = await verifyAuthToken(token);

    if (!valid || !payload?.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (emailVerified) {
      return NextResponse.json({ success: true, alreadyVerified: true });
    }

    const { otp } = await req.json();
    if (!otp || String(otp).length !== 6) {
      return NextResponse.json({ error: 'Enter a valid 6-digit code' }, { status: 400 });
    }

    const clientIp = getClientIp(req.headers);
    const adminToken = await getAdminToken(clientIp);
    const user = await getUserById(adminToken, payload.sub as string, clientIp);

    if (!user?.attributes) {
      return NextResponse.json({ error: 'No verification code found. Request a new one.' }, { status: 400 });
    }

    const storedHash = user.attributes[OTP_ATTRIBUTES.verify.code]?.[0];
    const expiry = user.attributes[OTP_ATTRIBUTES.verify.expiry]?.[0];

    if (isOtpExpired(expiry) || !verifyOtpHash(String(otp), storedHash)) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    const clearedAttrs = { ...(user.attributes || {}) };
    delete clearedAttrs[OTP_ATTRIBUTES.verify.code];
    delete clearedAttrs[OTP_ATTRIBUTES.verify.expiry];

    await updateUser(
      adminToken,
      user.id,
      { emailVerified: true, attributes: clearedAttrs },
      clientIp
    );

    if (!refreshToken) {
      return NextResponse.json({
        success: true,
        message: 'Email verified. Please log in again.',
        requiresLogin: true,
      });
    }

    const tokens = await refreshAccessToken(refreshToken);
    if (!tokens?.access_token) {
      return NextResponse.json({
        success: true,
        message: 'Email verified. Please log in again.',
        requiresLogin: true,
      });
    }

    const response = NextResponse.json({ success: true });
    setAuthCookies(response, tokens.access_token, tokens.refresh_token);
    return response;
  } catch (err) {
    console.error('[verify-otp]', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
