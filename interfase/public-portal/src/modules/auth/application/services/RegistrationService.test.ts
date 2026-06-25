import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegistrationService } from './RegistrationService';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IOTPRepository } from '../../domain/repositories/IOTPRepository';
import { IEmailRepository } from '../../domain/repositories/IEmailRepository';
import { CreateUserCommand } from '../../domain/entities/User';

describe('RegistrationService', () => {
  let registrationService: RegistrationService;
  let mockUserRepository: IUserRepository;
  let mockOTPRepository: IOTPRepository;
  let mockEmailRepository: IEmailRepository;

  beforeEach(() => {
    mockUserRepository = {
      create: vi.fn(),
      findByEmail: vi.fn(),
      findById: vi.fn(),
      markEmailVerified: vi.fn(),
      clearEmailBlock: vi.fn(),
    };

    mockOTPRepository = {
      create: vi.fn(),
      verify: vi.fn(),
      invalidate: vi.fn(),
    };

    mockEmailRepository = {
      sendVerificationEmail: vi.fn(),
      sendPasswordResetEmail: vi.fn(),
    };

    registrationService = new RegistrationService(
      mockUserRepository,
      mockOTPRepository,
      mockEmailRepository
    );
  });

  it('should successfully register a new user', async () => {
    const command: CreateUserCommand = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(mockUserRepository.create).mockResolvedValue({
      id: 'user123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      emailVerified: false,
    });
    vi.mocked(mockOTPRepository.create).mockResolvedValue('123456');
    vi.mocked(mockEmailRepository.sendVerificationEmail).mockResolvedValue(undefined);

    const result = await registrationService.register(command);

    expect(result.success).toBe(true);
    expect(result.userId).toBe('user123');
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(command.email);
    expect(mockUserRepository.create).toHaveBeenCalledWith(command);
    expect(mockOTPRepository.create).toHaveBeenCalled();
    expect(mockEmailRepository.sendVerificationEmail).toHaveBeenCalled();
  });

  it('should fail if email already exists', async () => {
    const command: CreateUserCommand = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue({
      id: 'existing123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      emailVerified: true,
    });

    const result = await registrationService.register(command);

    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it('should fail if password is too short', async () => {
    const command: CreateUserCommand = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'short',
    };

    const result = await registrationService.register(command);

    expect(result.success).toBe(false);
    expect(result.error).toContain('8 characters');
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
  });

  it('should fail if required fields are missing', async () => {
    const command: CreateUserCommand = {
      firstName: '',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    const result = await registrationService.register(command);

    expect(result.success).toBe(false);
    expect(result.error).toContain('All fields are required');
  });

  it('should continue even if email sending fails', async () => {
    const command: CreateUserCommand = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(mockUserRepository.create).mockResolvedValue({
      id: 'user123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      emailVerified: false,
    });
    vi.mocked(mockOTPRepository.create).mockResolvedValue('123456');
    vi.mocked(mockEmailRepository.sendVerificationEmail).mockRejectedValue(new Error('Email failed'));

    const result = await registrationService.register(command);

    expect(result.success).toBe(true);
    expect(result.userId).toBe('user123');
  });
});
