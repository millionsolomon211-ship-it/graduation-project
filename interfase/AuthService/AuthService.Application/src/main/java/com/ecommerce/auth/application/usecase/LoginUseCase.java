package com.ecommerce.auth.application.usecase;

import com.ecommerce.auth.application.dto.AuthResponse;
import com.ecommerce.auth.application.dto.LoginRequest;

public interface LoginUseCase {
    AuthResponse login(LoginRequest request);
}
