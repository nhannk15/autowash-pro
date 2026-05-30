package com.autowashpro.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.autowashpro.backend.model.dto.UserResponse;
import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository repository;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(Authentication authentication) {
        String email = (String) authentication.getPrincipal(); // lấy email từ JWT token

        User user = repository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return ResponseEntity.ok(new UserResponse(
                user.getEmail(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.getRole().toString()));
    }

}
