import { KeycloakUserRepository } from '../adapters/KeycloakUserRepository';
import { DatabaseOTPRepository } from '../adapters/DatabaseOTPRepository';
import { NodemailerEmailRepository } from '../adapters/NodemailerEmailRepository';
import { KeycloakAuthRepository } from '../adapters/KeycloakAuthRepository';
import { RegistrationService } from '../../application/services/RegistrationService';
import { EmailVerificationService } from '../../application/services/EmailVerificationService';
import { LoginService } from '../../application/services/LoginService';
import { SessionService } from '../../application/services/SessionService';

// Singleton instances
let userRepository: KeycloakUserRepository | null = null;
let otpRepository: DatabaseOTPRepository | null = null;
let emailRepository: NodemailerEmailRepository | null = null;
let authRepository: KeycloakAuthRepository | null = null;

let registrationService: RegistrationService | null = null;
let emailVerificationService: EmailVerificationService | null = null;
let loginService: LoginService | null = null;
let sessionService: SessionService | null = null;

export const getUserRepository = (): KeycloakUserRepository => {
  if (!userRepository) {
    userRepository = new KeycloakUserRepository();
  }
  return userRepository;
};

export const getOTPRepository = (): DatabaseOTPRepository => {
  if (!otpRepository) {
    otpRepository = new DatabaseOTPRepository();
  }
  return otpRepository;
};

export const getEmailRepository = (): NodemailerEmailRepository => {
  if (!emailRepository) {
    emailRepository = new NodemailerEmailRepository();
  }
  return emailRepository;
};

export const getAuthRepository = (): KeycloakAuthRepository => {
  if (!authRepository) {
    authRepository = new KeycloakAuthRepository();
  }
  return authRepository;
};

export const getRegistrationService = (): RegistrationService => {
  if (!registrationService) {
    registrationService = new RegistrationService(
      getUserRepository(),
      getOTPRepository(),
      getEmailRepository()
    );
  }
  return registrationService;
};

export const getEmailVerificationService = (): EmailVerificationService => {
  if (!emailVerificationService) {
    emailVerificationService = new EmailVerificationService(
      getOTPRepository(),
      getUserRepository()
    );
  }
  return emailVerificationService;
};

export const getLoginService = (): LoginService => {
  if (!loginService) {
    loginService = new LoginService(getAuthRepository());
  }
  return loginService;
};

export const getSessionService = (): SessionService => {
  if (!sessionService) {
    sessionService = new SessionService(getAuthRepository());
  }
  return sessionService;
};
