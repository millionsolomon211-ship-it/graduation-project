import { NextRequest, NextResponse } from 'next/server';
import { getRegistrationService } from '@/modules/auth/infrastructure/di/Container';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    const registrationService = getRegistrationService();
    const result = await registrationService.register({
      firstName,
      lastName,
      email,
      password,
    });

    if (!result.success) {
      const status = result.error?.includes('already exists') ? 409 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    // Registration successful - user must now login via Keycloak
    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email for verification code.',
      requiresLogin: true,
    });
  } catch (err: unknown) {
    console.error('[register] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error. Is Keycloak running?' },
      { status: 500 }
    );
  }
}
