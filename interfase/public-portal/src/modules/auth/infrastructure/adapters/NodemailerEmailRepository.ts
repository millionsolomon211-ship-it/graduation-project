import { IEmailRepository } from '../../domain/repositories/IEmailRepository';
import { sendVerificationOtp } from '@/lib/email';

export class NodemailerEmailRepository implements IEmailRepository {
  async sendVerificationEmail(email: string, otp: string, firstName: string): Promise<void> {
    await sendVerificationOtp(email, otp, firstName);
  }

  async sendPasswordResetEmail(email: string, otp: string, firstName: string): Promise<void> {
    // Implement password reset email if needed
    throw new Error('Password reset email not implemented yet.');
  }
}
