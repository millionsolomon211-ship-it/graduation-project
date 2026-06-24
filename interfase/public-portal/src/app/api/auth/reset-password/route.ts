import { NextRequest, NextResponse } from 'next/server';
import { verifyStoredOtp } from '@/lib/otp-store';
import {
  getAdminToken,
  resetUserPassword,
  getClientIp,
} from '@/lib/keycloak-admin';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { email, otp, password } = await req.json();

    if (!email || !otp || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const check = await verifyStoredOtp(String(otp), 'password_reset', { email });
    if (!check.valid || !check.keycloakUserId) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    const clientIp = getClientIp(req.headers);
    const adminToken = await getAdminToken(clientIp);
    const ok = await resetUserPassword(adminToken, check.keycloakUserId, password, clientIp);
    if (!ok) {
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[reset-password]', err);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
