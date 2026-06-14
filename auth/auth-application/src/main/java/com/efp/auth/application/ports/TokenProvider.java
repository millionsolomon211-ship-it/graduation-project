package com.efp.auth.application.ports;

public interface TokenProvider {
    String generateToken(String email);
    boolean validateToken(String token);
    String getEmailFromToken(String token);
}
