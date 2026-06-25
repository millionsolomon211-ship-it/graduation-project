export interface OTP {
  id: string;
  code: string;
  keycloakUserId: string;
  email: string;
  type: OTPType;
  expiresAt: Date;
  createdAt: Date;
  used: boolean;
}

export type OTPType = 'email_verify' | 'password_reset';

export interface CreateOTPCommand {
  keycloakUserId: string;
  email: string;
  type: OTPType;
}

export interface VerifyOTPCommand {
  code: string;
  type: OTPType;
  keycloakUserId: string;
}
