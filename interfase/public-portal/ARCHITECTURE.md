# Backend Architecture - Hexagonal (Ports & Adapters)

## Overview

The backend has been refactored to follow hexagonal architecture principles, providing clear separation of concerns and making the system more maintainable and testable.

## Architecture Layers

### 1. Domain Layer (`src/modules/auth/domain/`)
**Purpose:** Contains core business logic and entities, independent of external dependencies.

**Structure:**
- `entities/` - Business entities (User, OTP)
- `repositories/` - Repository interfaces (contracts for data access)

**Key Files:**
- `entities/User.ts` - User entity and command objects
- `entities/OTP.ts` - OTP entity and command objects
- `repositories/IUserRepository.ts` - User repository interface
- `repositories/IOTPRepository.ts` - OTP repository interface
- `repositories/IEmailRepository.ts` - Email repository interface
- `repositories/IAuthRepository.ts` - Authentication repository interface

### 2. Application Layer (`src/modules/auth/application/`)
**Purpose:** Contains use cases and business logic orchestration.

**Structure:**
- `services/` - Application services that orchestrate business logic

**Key Files:**
- `services/RegistrationService.ts` - Handles user registration flow
- `services/EmailVerificationService.ts` - Handles email verification flow
- `services/LoginService.ts` - Handles login flow
- `services/SessionService.ts` - Handles session refresh flow

### 3. Infrastructure Layer (`src/modules/auth/infrastructure/`)
**Purpose:** Contains implementations of domain interfaces and external system integrations.

**Structure:**
- `adapters/` - Concrete implementations of repository interfaces
- `di/` - Dependency injection container

**Key Files:**
- `adapters/KeycloakUserRepository.ts` - Keycloak implementation for user management
- `adapters/DatabaseOTPRepository.ts` - Database implementation for OTP storage
- `adapters/NodemailerEmailRepository.ts` - Email sending implementation
- `adapters/KeycloakAuthRepository.ts` - Keycloak implementation for authentication
- `di/Container.ts` - Dependency injection container with singleton instances

### 4. API Layer (`src/app/api/`)
**Purpose:** HTTP route handlers that delegate to application services.

**Key Files:**
- `api/auth/register/route.ts` - Registration endpoint
- `api/auth/login/route.ts` - Login endpoint
- `api/auth/verify-otp/route.ts` - OTP verification endpoint
- `api/auth/refresh-session/route.ts` - Session refresh endpoint
- `api/auth/resend-verify/route.ts` - Resend verification code endpoint

## Data Flow

### Registration Flow
1. **API Layer** (`/api/auth/register`)
   - Receives HTTP request
   - Validates input
   - Calls `RegistrationService`

2. **Application Layer** (`RegistrationService`)
   - Validates business rules (password length, required fields)
   - Checks if user exists via `IUserRepository`
   - Creates user via `IUserRepository`
   - Clears email block via `IUserRepository`
   - Generates OTP via `IOTPRepository`
   - Sends email via `IEmailRepository`

3. **Infrastructure Layer** (Adapters)
   - `KeycloakUserRepository` creates user in Keycloak
   - `DatabaseOTPRepository` stores OTP in database
   - `NodemailerEmailRepository` sends email

4. **Response**
   - Returns success with `requiresLogin: true`
   - No auto-login - user must login via Keycloak

### Login Flow
1. **API Layer** (`/api/auth/login`)
   - Receives credentials
   - Calls `LoginService`

2. **Application Layer** (`LoginService`)
   - Validates input
   - Calls `IAuthRepository.login()`
   - Decodes JWT to check email verification status

3. **Infrastructure Layer** (`KeycloakAuthRepository`)
   - POSTs to Keycloak token endpoint
   - Returns JWT tokens

4. **Response**
   - Sets HTTP-only cookies with tokens
   - Returns success with email verification status

### Email Verification Flow
1. **API Layer** (`/api/auth/verify-otp`)
   - Receives OTP
   - Calls `EmailVerificationService`

2. **Application Layer** (`EmailVerificationService`)
   - Validates OTP format
   - Verifies OTP via `IOTPRepository`
   - Marks email verified via `IUserRepository`

3. **Infrastructure Layer**
   - `DatabaseOTPRepository` validates OTP
   - `KeycloakUserRepository` updates Keycloak user

4. **Response**
   - Returns success with `requiresLogin: true`
   - User must re-login to get updated token

## Key Changes from Previous Architecture

### 1. Removed Auto-Login
- **Before:** Registration automatically logged in the user
- **After:** Registration returns success, user must login separately
- **Benefit:** JWTs are always issued by Keycloak, ensuring consistent issuer domain

### 2. Direct Keycloak Login
- **Before:** Login was proxied through Next.js backend
- **After:** Login still goes through Next.js but directly to Keycloak token endpoint
- **Benefit:** JWT issuer is Keycloak (nginx domain), not Next.js (Vercel domain)

### 3. Hexagonal Architecture
- **Before:** Business logic mixed with infrastructure code in route handlers
- **After:** Clear separation of domain, application, and infrastructure layers
- **Benefit:** Easier to test, maintain, and swap implementations

### 4. Dependency Injection
- **Before:** Direct instantiation of dependencies
- **After:** Singleton DI container manages dependencies
- **Benefit:** Easier to mock for testing, consistent instances

## Testing

### Test Structure
- `src/modules/auth/domain/entities/*.test.ts` - Unit tests for entities
- `src/modules/auth/application/services/*.test.ts` - Unit tests for services

### Running Tests
```bash
npm install  # Install vitest dependencies
npm test     # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage  # Run tests with coverage
```

## Environment Variables

Required environment variables:
- `KEYCLOAK_SERVER_URL` or `NEXT_PUBLIC_KEYCLOAK_URL` - Keycloak server URL
- `NEXT_PUBLIC_KEYCLOAK_REALM` - Keycloak realm name (default: public-citizen-portal)

## Benefits of This Architecture

1. **Single JWT Issuer:** All JWTs are issued by Keycloak via nginx domain
2. **Cross-Service Authentication:** Other services can validate JWTs from the same issuer
3. **Testability:** Clear separation allows easy mocking of dependencies
4. **Maintainability:** Business logic is isolated from infrastructure concerns
5. **Flexibility:** Easy to swap implementations (e.g., different email provider)
6. **Scalability:** Each layer can be scaled independently

## Future Improvements

1. Add request context for client IP in repositories
2. Implement proper error handling with error types
3. Add logging middleware
4. Add API rate limiting
5. Implement circuit breakers for external services
6. Add integration tests for full flows
7. Add API documentation (OpenAPI/Swagger)
