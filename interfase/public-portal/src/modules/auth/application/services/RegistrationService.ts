import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IOTPRepository } from '../../domain/repositories/IOTPRepository';
import { IEmailRepository } from '../../domain/repositories/IEmailRepository';
import { CreateUserCommand } from '../../domain/entities/User';

export interface RegistrationResult {
  success: boolean;
  error?: string;
  userId?: string;
}

export class RegistrationService {
  constructor(
    private userRepository: IUserRepository,
    private otpRepository: IOTPRepository,
    private emailRepository: IEmailRepository
  ) {}

  async register(command: CreateUserCommand): Promise<RegistrationResult> {
    // Validation
    if (!command.firstName || !command.lastName || !command.email || !command.password) {
      return { success: false, error: 'All fields are required.' };
    }

    if (command.password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters.' };
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // Create user
    const user = await this.userRepository.create(command);
    if (!user) {
      return { success: false, error: 'Registration failed.' };
    }

    // Clear any email block
    await this.userRepository.clearEmailBlock(user.id);

    // Generate and send OTP
    const otp = await this.otpRepository.create({
      keycloakUserId: user.id,
      email: user.email,
      type: 'email_verify',
    });

    try {
      await this.emailRepository.sendVerificationEmail(user.email, otp, user.firstName);
    } catch (error) {
      console.error('[RegistrationService] Failed to send verification email:', error);
      // Continue even if email fails - user can request resend
    }

    return { success: true, userId: user.id };
  }
}
