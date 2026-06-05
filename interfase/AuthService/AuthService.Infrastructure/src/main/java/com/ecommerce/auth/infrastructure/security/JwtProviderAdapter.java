package com.ecommerce.auth.infrastructure.security;

import com.ecommerce.auth.application.ports.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Adapter: implements the Application layer's JwtProvider port
 * using the actual JwtUtil implementation.
 */
@Component
@RequiredArgsConstructor
public class JwtProviderAdapter implements JwtProvider {

    private final JwtUtil jwtUtil;

    @Override
    public String generateToken(String userId, String email) {
        return jwtUtil.generateToken(userId, email);
    }

    @Override
    public boolean isTokenValid(String token) {
        return jwtUtil.isTokenValid(token);
    }

    @Override
    public String extractEmail(String token) {
        return jwtUtil.extractEmail(token);
    }
}
