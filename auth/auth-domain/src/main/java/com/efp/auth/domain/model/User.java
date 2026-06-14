package com.efp.auth.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String id;
    private String email;
    private String password; // This will be the encoded password

    public static User create(String email, String encodedPassword) {
        validateEmail(email);
        return User.builder()
                .id(UUID.randomUUID().toString())
                .email(email)
                .password(encodedPassword)
                .build();
    }

    public void updatePassword(String newEncodedPassword) {
        this.password = newEncodedPassword;
    }

    private static void validateEmail(String email) {
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }
}
