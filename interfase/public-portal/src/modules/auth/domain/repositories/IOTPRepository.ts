import { OTP, CreateOTPCommand, VerifyOTPCommand } from '../entities/OTP';

export interface IOTPRepository {
  create(command: CreateOTPCommand): Promise<string>;
  verify(command: VerifyOTPCommand): Promise<{ valid: boolean; userId?: string }>;
  invalidate(userId: string, type: string): Promise<void>;
}
