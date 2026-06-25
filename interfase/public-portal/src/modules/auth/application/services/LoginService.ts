import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { LoginCredentials } from '../../domain/entities/User';

export interface LoginResult {
  success: boolean;
  tokens?: {
    access_token: string;
    refresh_token: string;
  };
  emailVerified?: boolean;
  error?: string;
}

export class LoginService {
  constructor(private authRepository: IAuthRepository) {}

  async login(credentials: LoginCredentials): Promise<LoginResult> {
    if (!credentials.username || !credentials.password) {
      return { success: false, error: 'Email and password are required' };
    }

    const result = await this.authRepository.login(credentials);

    if (!result.success || !result.tokens) {
      return { success: false, error: result.error || 'Invalid credentials' };
    }

    // Decode JWT to check email verification status
    let emailVerified = false;
    try {
      const payload = this.decodeJWT(result.tokens.access_token);
      emailVerified = payload.email_verified === true;
    } catch {
      // Ignore decode errors
    }

    return {
      success: true,
      tokens: {
        access_token: result.tokens.access_token,
        refresh_token: result.tokens.refresh_token || '',
      },
      emailVerified,
    };
  }

  private decodeJWT(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }
}
