package com.efp.auth.application.usecase;

import com.efp.auth.application.dto.AuthResponse;
import com.efp.auth.application.dto.LoginRequest;
import com.efp.auth.application.dto.RegisterRequest;
import com.efp.auth.application.dto.ResetPasswordRequest;

public interface AuthUseCase {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void resetPassword(ResetPasswordRequest request);
}
