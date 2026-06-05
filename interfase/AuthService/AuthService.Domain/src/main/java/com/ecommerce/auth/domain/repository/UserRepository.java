package com.ecommerce.auth.domain.repository;

import com.ecommerce.auth.domain.entity.User;
import java.util.Optional;

public interface UserRepository {
    User save(User user);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
