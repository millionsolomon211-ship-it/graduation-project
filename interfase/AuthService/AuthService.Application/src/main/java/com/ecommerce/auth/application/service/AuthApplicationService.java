package com.ecommerce.auth.application.service;

import com.ecommerce.auth.application.dto.AuthResponse;
import com.ecommerce.auth.application.dto.RegisterUserRequest;
import com.ecommerce.auth.application.dto.LoginRequest;
import com.ecommerce.auth.application.ports.EventPublisher;
import com.ecommerce.auth.application.ports.JwtProvider;
import com.ecommerce.auth.application.ports.PasswordEncoderPort;
import com.ecommerce.auth.application.usecase.LoginUseCase;
import com.ecommerce.auth.application.usecase.RegisterUserUseCase;
import com.ecommerce.auth.application.usecase.RefreshTokenUseCase;
import com.ecommerce.auth.domain.entity.User;
import com.ecommerce.auth.domain.repository.UserRepository;
import com.ecommerce.shared.messaging.event.UserLoggedInEvent;
import com.ecommerce.shared.messaging.event.UserRegisteredEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthApplicationService implements RegisterUserUseCase, LoginUseCase, RefreshTokenUseCase {

        private final UserRepository userRepository;
        private final EventPublisher eventPublisher;
        private final JwtProvider jwtProvider;
        private final PasswordEncoderPort passwordEncoder;

        @Override
        public AuthResponse register(RegisterUserRequest request) {
                if (request.getPassword() == null || request.getPassword().length() < 8) {
                        return AuthResponse.builder()
                                        .message("Password must be at least 8 characters long")
                                        .build();
                }

                if (userRepository.existsByEmail(request.getEmail())) {
                        return AuthResponse.builder()
                                        .message("User already exists")
                                        .build();
                }

                User user = User.create(
                                request.getEmail(),
                                passwordEncoder.encode(request.getPassword()),
                                request.getFullName()
                );

                userRepository.save(user);

                // Publish Event to RabbitMQ
                eventPublisher.publish(new UserRegisteredEvent(user.getId(), user.getEmail(), user.getFullName()));

                String token = jwtProvider.generateToken(user.getId(), user.getEmail());

                return AuthResponse.builder()
                                .userId(user.getId())
                                .token(token)
                                .message("User registered successfully")
                                .build();
        }

        @Override
        public AuthResponse login(LoginRequest request) {
                return userRepository.findByEmail(request.getEmail())
                                .filter(user -> passwordEncoder.matches(request.getPassword(), user.getPassword()))
                                .map(user -> {
                                        String token = jwtProvider.generateToken(user.getId(), user.getEmail());

                                        // Publish Event to RabbitMQ
                                        eventPublisher.publish(new UserLoggedInEvent(user.getId(), user.getEmail()));

                                        return AuthResponse.builder()
                                                        .userId(user.getId())
                                                        .token(token)
                                                        .message("Login successful")
                                                        .build();
                                })
                                .orElse(AuthResponse.builder()
                                                .message("Invalid credentials")
                                                .build());
        }

        @Override
        public AuthResponse refresh(String token) {
                if (jwtProvider.isTokenValid(token)) {
                        String email = jwtProvider.extractEmail(token);
                        return userRepository.findByEmail(email)
                                        .map(user -> AuthResponse.builder()
                                                        .userId(user.getId())
                                                        .token(jwtProvider.generateToken(user.getId(), user.getEmail()))
                                                        .message("Token refreshed")
                                                        .build())
                                        .orElse(AuthResponse.builder()
                                                        .message("User not found")
                                                        .build());
                }
                return AuthResponse.builder()
                                .message("Invalid token")
                                .build();
        }
}
