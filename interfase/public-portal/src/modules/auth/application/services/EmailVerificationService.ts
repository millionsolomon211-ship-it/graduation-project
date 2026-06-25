import { IOTPRepository } from '../../domain/repositories/IOTPRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { VerifyOTPCommand } from '../../domain/entities/OTP';

export interface VerificationResult {
  success: boolean;
  error?: string;
  requiresLogin?: boolean;
}

export class EmailVerificationService {
  constructor(
    private otpRepository: IOTPRepository,
    private userRepository: IUserRepository
  ) {}

  async verify(command: VerifyOTPCommand): Promise<VerificationResult> {
    // Validate OTP format
    if (!command.code || command.code.length !== 6) {
      return { success: false, error: 'Enter a valid 6-digit code' };
    }

    // Verify OTP
    const verification = await this.otpRepository.verify(command);
    if (!verification.valid) {
      return { success: false, error: 'Invalid or expired code' };
    }

    // Mark email as verified in Keycloak
    const marked = await this.userRepository.markEmailVerified(command.keycloakUserId);
    if (!marked) {
      return { success: false, error: 'Could not update account in Keycloak' };
    }

    return { success: true, requiresLogin: true };
  }

  async resendVerification(userId: string, email: string, firstName: string): Promise<{ success: boolean; error?: string; otp?: string }> {
    const otp = await this.otpRepository.create({
      keycloakUserId: userId,
      email,
      type: 'email_verify',
    });

    // Note: Email sending is handled by the caller or a separate service
    return { success: true, otp };
  }
}
