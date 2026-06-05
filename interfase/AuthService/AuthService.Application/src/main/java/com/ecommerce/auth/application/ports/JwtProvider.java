package com.ecommerce.auth.application.ports;

/**
 * Port interface for JWT token generation.
 * Infrastructure layer provides the implementation (JwtUtil).
 * This keeps the Application layer framework-free (Onion Architecture).
 */
public interface JwtProvider {
    String generateToken(String userId, String email);
    boolean isTokenValid(String token);
    String extractEmail(String token);
}
