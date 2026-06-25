import { describe, it, expect } from 'vitest';
import { OTP, CreateOTPCommand, VerifyOTPCommand, OTPType } from './OTP';

describe('OTP Entity', () => {
  describe('OTPType', () => {
    it('should have email_verify type', () => {
      expect('email_verify'). satisfies OTPType;
    });

    it('should have password_reset type', () => {
      expect('password_reset'). satisfies OTPType;
    });
  });

  describe('CreateOTPCommand', () => {
    it('should create and validate command structure', () => {
      const command: CreateOTPCommand = {
        keycloakUserId: 'user123',
        email: 'test@example.com',
        type: 'email_verify',
      };

      expect(command.keycloakUserId).toBe('user123');
      expect(command.email).toBe('test@example.com');
      expect(command.type).toBe('email_verify');
    });
  });

  describe('VerifyOTPCommand', () => {
    it('should create and verify command structure', () => {
      const command: VerifyOTPCommand = {
        code: '123456',
        type: 'email_verify',
        keycloakUserId: 'user123',
      };

      expect(command.code).toBe('123456');
      expect(command.type).toBe('email_verify');
      expect(command.keycloakUserId).toBe('user123');
    });

    it('should validate OTP code length', () => {
      const command: VerifyOTPCommand = {
        code: '123456',
        type: 'email_verify',
        keycloakUserId: 'user123',
      };

      expect(command.code.length).toBe(6);
    });
  });

  describe('OTP', () => {
    it('should create a complete OTP entity', () => {
      const otp: OTP = {
        id: 'otp123',
        code: '123456',
        keycloakUserId: 'user123',
        email: 'test@example.com',
        type: 'email_verify',
        expiresAt: new Date(Date.now() + 300000),
        createdAt: new Date(),
        used: false,
      };

      expect(otp.id).toBe('otp123');
      expect(otp.code).toBe('123456');
      expect(otp.keycloakUserId).toBe('user123');
      expect(otp.email).toBe('test@example.com');
      expect(otp.type).toBe('email_verify');
      expect(otp.used).toBe(false);
      expect(otp.expiresAt).toBeInstanceOf(Date);
      expect(otp.createdAt).toBeInstanceOf(Date);
    });
  });
});
