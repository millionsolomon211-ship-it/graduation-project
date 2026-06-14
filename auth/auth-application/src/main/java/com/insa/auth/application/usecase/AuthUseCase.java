package com.insa.auth.application.usecase;

import com.insa.auth.application.dto.AuthResponse;
import com.insa.auth.application.dto.LoginRequest;
import com.insa.auth.application.dto.RegisterRequest;
import com.insa.auth.application.dto.ResetPasswordRequest;

public interface AuthUseCase {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void resetPassword(ResetPasswordRequest request);
}
