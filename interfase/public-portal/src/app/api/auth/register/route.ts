import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminToken,
  findUserByEmail,
  clearKeycloakEmailBlock,
  loginWithPassword,
  getClientIp,
} from '@/lib/keycloak-admin';
import { issueOtp } from '@/lib/otp-store';
import { sendVerificationOtp } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const clientIp = getClientIp(req.headers);
    const adminToken = await getAdminToken(clientIp);
    const kcUrl = process.env.KEYCLOAK_SERVER_URL || process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost/auth';
    const kcRealm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'public-citizen-portal';

    const createRes = await fetch(
      `${kcUrl}/admin/realms/${kcRealm}/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
          'X-Forwarded-For': clientIp,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          username: email,
          enabled: true,
          emailVerified: false,
          requiredActions: [],
          credentials: [{ type: 'password', value: password, temporary: false }],
        }),
      }
    );

    if (createRes.status === 409) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }
    if (!createRes.ok) {
      const body = await createRes.text();
      return NextResponse.json({ error: body || 'Registration failed.' }, { status: 400 });
    }

    const user = await findUserByEmail(adminToken, email, clientIp);
    if (user?.id) {
      await clearKeycloakEmailBlock(adminToken, user.id, clientIp);

      const otp = await issueOtp(user.id, email, 'email_verify');
      try {
        await sendVerificationOtp(email, otp, firstName);
      } catch (emailErr) {
        console.error('[register] OTP email failed:', emailErr);
      }
    }

    const login = await loginWithPassword(email, password, clientIp);
    if (!login.ok || !login.tokens?.access_token) {
      return NextResponse.json({ success: true, autoLogin: false });
    }

    return NextResponse.json({
      success: true,
      autoLogin: true,
      token: login.tokens.access_token,
      refreshToken: login.tokens.refresh_token,
    });
  } catch (err: unknown) {
    console.error('[register] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error. Is Keycloak running?' },
      { status: 500 }
    );
  }
}
