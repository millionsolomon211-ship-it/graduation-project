import { IOTPRepository } from '../../domain/repositories/IOTPRepository';
import { CreateOTPCommand, VerifyOTPCommand } from '../../domain/entities/OTP';
import { issueOtp, verifyStoredOtp } from '@/lib/otp-store';

export class DatabaseOTPRepository implements IOTPRepository {
  async create(command: CreateOTPCommand): Promise<string> {
    const otp = await issueOtp(command.keycloakUserId, command.email, command.type);
    return otp;
  }

  async verify(command: VerifyOTPCommand): Promise<{ valid: boolean; userId?: string }> {
    const result = await verifyStoredOtp(command.code, command.type, {
      keycloakUserId: command.keycloakUserId,
    });

    return {
      valid: result.valid,
      userId: result.valid ? command.keycloakUserId : undefined,
    };
  }

  async invalidate(userId: string, type: string): Promise<void> {
    // This would need to be implemented in otp-store
    // For now, OTPs expire automatically
  }
}
