import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminToken,
  findUserByEmail,
  sendVerifyEmail,
  getClientIp,
} from '@/lib/keycloak-admin';

const KC_URL = process.env.KEYCLOAK_SERVER_URL || process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost/auth';
const KC_REALM = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'public-citizen-portal';
const KC_CLIENT = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'civilian-nextjs-web';

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

    const createRes = await fetch(
      `${KC_URL}/admin/realms/${KC_REALM}/users`,
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
          requiredActions: ['VERIFY_EMAIL'],
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
    if (user) {
      const sent = await sendVerifyEmail(adminToken, user.id, clientIp);
      if (!sent.ok) {
        console.error('[register] Keycloak failed to send verification email:', sent.error);
      }
    }

    const tokenRes = await fetch(
      `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Forwarded-For': clientIp,
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: KC_CLIENT,
          username: email,
          password,
          scope: 'openid email profile',
        }),
      }
    );

    if (!tokenRes.ok) {
      return NextResponse.json({ success: true, autoLogin: false });
    }

    const tokens = await tokenRes.json();
    return NextResponse.json({
      success: true,
      autoLogin: true,
      token: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });
  } catch (err: unknown) {
    console.error('[register] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error. Is Keycloak running?' },
      { status: 500 }
    );
  }
}
