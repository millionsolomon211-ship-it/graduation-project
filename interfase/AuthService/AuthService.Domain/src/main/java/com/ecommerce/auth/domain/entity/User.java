package com.ecommerce.auth.domain.entity;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PRIVATE)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class User {
    private String id;
    private String email;
    private String password;
    private String fullName;

    public static User create(String email, String password, String fullName) {
        validateEmail(email);
        // Note: Password validation for length should happen on the RAW password 
        // in the application layer, as this 'password' here is already encoded.
        
        return User.builder()
                .id(UUID.randomUUID().toString())
                .email(email)
                .password(password)
                .fullName(fullName)
                .build();
    }

    private static void validateEmail(String email) {
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Invalid email format: Must contain '@'");
        }
    }

    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }
}
