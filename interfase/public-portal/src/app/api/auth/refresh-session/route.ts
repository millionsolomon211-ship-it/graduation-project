import { NextRequest, NextResponse } from 'next/server';
import { setAuthCookies } from '@/lib/auth-tokens';
import { getSessionService } from '@/modules/auth/infrastructure/di/Container';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value;
    if (!refreshToken) {
      return NextResponse.json({ error: 'No session. Please log in again.' }, { status: 401 });
    }

    const sessionService = getSessionService();
    const result = await sessionService.refreshSession(refreshToken);

    if (!result.success || !result.tokens) {
      return NextResponse.json({ error: result.error || 'Session expired. Please log in again.' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, emailVerified: result.emailVerified });
    setAuthCookies(response, result.tokens.access_token, result.tokens.refresh_token);
    return response;
  } catch (err) {
    console.error('[refresh-session]', err);
    return NextResponse.json({ error: 'Failed to refresh session' }, { status: 500 });
  }
}
