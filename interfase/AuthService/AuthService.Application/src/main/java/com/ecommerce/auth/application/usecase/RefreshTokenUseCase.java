package com.ecommerce.auth.application.usecase;

import com.ecommerce.auth.application.dto.AuthResponse;

public interface RefreshTokenUseCase {
    AuthResponse refresh(String token);
}
