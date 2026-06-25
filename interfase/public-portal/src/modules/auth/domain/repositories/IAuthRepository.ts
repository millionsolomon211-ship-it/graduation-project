import { LoginCredentials } from '../entities/User';

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<{ success: boolean; tokens?: AuthTokens; error?: string }>;
  refreshToken(refreshToken: string): Promise<{ success: boolean; tokens?: AuthTokens; error?: string }>;
}
