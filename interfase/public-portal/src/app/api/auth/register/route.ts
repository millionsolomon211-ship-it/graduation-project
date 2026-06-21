import { NextRequest, NextResponse } from 'next/server';

const KC_URL    = process.env.NEXT_PUBLIC_KEYCLOAK_URL    || 'http://localhost:8080/auth';
const KC_REALM  = process.env.NEXT_PUBLIC_KEYCLOAK_REALM  || 'public-citizen-portal';
const KC_CLIENT = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'civilian-nextjs-web';
const KC_ADMIN_USER = process.env.KEYCLOAK_ADMIN_USER || 'admin';
const KC_ADMIN_PASS = process.env.KEYCLOAK_ADMIN_PASS || 'admin';

async function getAdminToken(clientIp: string): Promise<string> {
  const res = await fetch(
    `${KC_URL}/realms/master/protocol/openid-connect/token`,
    {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Forwarded-For': clientIp
      },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id:  'admin-cli',
        username:   KC_ADMIN_USER,
        password:   KC_ADMIN_PASS,
      }),
    }
  );
  if (!res.ok) throw new Error('Could not connect to Keycloak');
  return (await res.json()).access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // Get the client IP from the incoming request headers to forward to Nginx -> Keycloak
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    // 1. Get admin token (server-side only — never exposed to browser)
    const adminToken = await getAdminToken(clientIp);

    // 2. Create user in Keycloak
    const createRes = await fetch(
      `${KC_URL}/admin/realms/${KC_REALM}/users`,
      {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${adminToken}`,
          'X-Forwarded-For': clientIp,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          username:      email,
          enabled:       true,
          emailVerified: false,
          credentials:   [{ type: 'password', value: password, temporary: false }],
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

    // 3. Auto-login: get access token for the new user
    const tokenRes = await fetch(
      `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Forwarded-For': clientIp 
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id:  KC_CLIENT,
          username:   email,
          password,
        }),
      }
    );

    if (!tokenRes.ok) {
      // Registration succeeded but auto-login failed — still OK, just send them to login
      return NextResponse.json({ success: true, autoLogin: false });
    }

    const { access_token } = await tokenRes.json();
    return NextResponse.json({ success: true, autoLogin: true, token: access_token });

  } catch (err: any) {
    console.error('[register] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Server error. Is Keycloak running?' },
      { status: 500 }
    );
  }
}
