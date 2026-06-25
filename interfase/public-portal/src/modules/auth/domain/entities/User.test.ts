import { describe, it, expect } from 'vitest';
import { User, CreateUserCommand, LoginCredentials } from './User';

describe('User Entity', () => {
  describe('CreateUserCommand', () => {
    it('should create a valid command with all fields', () => {
      const command: CreateUserCommand = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      expect(command.firstName).toBe('John');
      expect(command.lastName).toBe('Doe');
      expect(command.email).toBe('john@example.com');
      expect(command.password).toBe('password123');
    });

    it('should validate password length requirement', () => {
      const command: CreateUserCommand = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'short',
      };

      expect(command.password.length).toBeLessThan(8);
    });
  });

  describe('LoginCredentials', () => {
    it('should create valid credentials', () => {
      const credentials: LoginCredentials = {
        username: 'john@example.com',
        password: 'password123',
      };

      expect(credentials.username).toBe('john@example.com');
      expect(credentials.password).toBe('password123');
    });
  });

  describe('User', () => {
    it('should create a user with required fields', () => {
      const user: User = {
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        emailVerified: false,
      };

      expect(user.id).toBe('123');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.emailVerified).toBe(false);
    });

    it('should create a user with optional fields', () => {
      const user: User = {
        id: '123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'john@example.com',
        enabled: true,
        emailVerified: true,
        createdAt: new Date('2024-01-01'),
      };

      expect(user.username).toBe('john@example.com');
      expect(user.enabled).toBe(true);
      expect(user.emailVerified).toBe(true);
      expect(user.createdAt).toEqual(new Date('2024-01-01'));
    });
  });
});
