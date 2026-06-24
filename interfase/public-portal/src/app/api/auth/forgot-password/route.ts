import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminToken,
  findUserByEmail,
  sendPasswordResetEmail,
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

    if (user) {
      await sendPasswordResetEmail(adminToken, user.id, clientIp);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists, Keycloak has sent a password reset link to your email.',
    });
  } catch (err) {
    console.error('[forgot-password]', err);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
