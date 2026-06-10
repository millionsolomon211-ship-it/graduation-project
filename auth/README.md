# Auth Microservice

This microservice handles user authentication including registration, login, and password reset.

## Architecture
This project follows **Hexagonal Architecture** (Ports and Adapters):
- **Domain**: Contains business entities and core logic.
- **Application**: Contains use cases (ports) and application services that orchestrate domain logic.
- **Infrastructure** (To be implemented): Contains adapters for persistence, security, and external services.

## Features
- **User Registration**: Validates email format and ensures password is at least 8 characters.
- **Login**: Authenticates users and provides a JWT token.
- **Password Reset**: Allows users to update their password.
- **Email Uniqueness**: Ensures each email is registered only once.
- **Tokenization**: Uses a `TokenProvider` port for JWT generation.

## Validations
- Password: Minimum 8 characters (in `RegisterRequest` and `ResetPasswordRequest`).
- Email: Unique check in `AuthApplicationService`.
- Email Format: Basic check in `User` domain model and `@Email` validation in DTO.
