import { IAuthRepository, AuthTokens } from '../../domain/repositories/IAuthRepository';
import { LoginCredentials } from '../../domain/entities/User';
import { loginWithPassword, refreshAccessToken, getClientIp } from '@/lib/keycloak-admin';

export class KeycloakAuthRepository implements IAuthRepository {
  private kcUrl: string;
  private kcRealm: string;

  constructor() {
    this.kcUrl = process.env.KEYCLOAK_SERVER_URL || process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost/auth';
    this.kcRealm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'public-citizen-portal';
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; tokens?: AuthTokens; error?: string }> {
    const clientIp = this.getClientIpFromContext();
    const result = await loginWithPassword(credentials.username, credentials.password, clientIp);

    if (!result.ok || !result.tokens) {
      return {
        success: false,
        error: result.error || 'Invalid credentials',
      };
    }

    return {
      success: true,
      tokens: {
        access_token: result.tokens.access_token,
        refresh_token: result.tokens.refresh_token,
        expires_in: (result.tokens as any).expires_in || 300,
        token_type: (result.tokens as any).token_type || 'Bearer',
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ success: boolean; tokens?: AuthTokens; error?: string }> {
    const result = await refreshAccessToken(refreshToken);

    if (!result || !result.access_token) {
      return {
        success: false,
        error: 'Failed to refresh token',
      };
    }

    return {
      success: true,
      tokens: {
        access_token: result.access_token,
        refresh_token: result.refresh_token || refreshToken,
        expires_in: (result as any).expires_in || 300,
        token_type: (result as any).token_type || 'Bearer',
      },
    };
  }

  private getClientIpFromContext(): string {
    // In a real implementation, this would come from request context
    // For now, return a default value
    return '127.0.0.1';
  }
}
