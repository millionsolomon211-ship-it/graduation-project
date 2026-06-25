export interface IEmailRepository {
  sendVerificationEmail(email: string, otp: string, firstName: string): Promise<void>;
  sendPasswordResetEmail(email: string, otp: string, firstName: string): Promise<void>;
}
