package com.autowashpro.backend.model.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class StaffInfoResponse {
    private Long id;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String role;
    private String phoneNumber;
    private LocalDate hiredDate;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
