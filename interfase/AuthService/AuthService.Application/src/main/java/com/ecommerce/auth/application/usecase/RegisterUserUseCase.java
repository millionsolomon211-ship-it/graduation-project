package com.ecommerce.auth.application.usecase;

import com.ecommerce.auth.application.dto.AuthResponse;
import com.ecommerce.auth.application.dto.RegisterUserRequest;

public interface RegisterUserUseCase {
    AuthResponse register(RegisterUserRequest request);
}
