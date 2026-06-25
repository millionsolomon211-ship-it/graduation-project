import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookies } from '@/lib/auth-tokens';
import { getLoginService } from '@/modules/auth/infrastructure/di/Container';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const loginService = getLoginService();
    const result = await loginService.login({ username, password });

    if (!result.success || !result.tokens) {
      return NextResponse.json(
        { error: result.error || 'Invalid credentials' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true, emailVerified: result.emailVerified });
    setAuthCookies(response, result.tokens.access_token, result.tokens.refresh_token);
    return response;
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
