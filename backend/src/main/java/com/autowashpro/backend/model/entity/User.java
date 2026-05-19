package com.autowashpro.backend.model.entity;

import java.time.LocalDateTime;

public class User {
    private Long id;
    private String email;
    private String googleId;
    private String password;
    private String fullName;
    private String phoneNumber;
    private String avatarUrl;
    private String role;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt; // new

}
