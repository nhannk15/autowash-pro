package com.autowashpro.backend.model.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import com.autowashpro.backend.model.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CustomerAdminResponse {
    private Long id;
    private String email;
    private String googleId;
    private String fullName;
    private String phoneNumber;
    private String avatarUrl;
    private Role role;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDate dateOfBirth;
    private MembershipTierSummaryResponse tier;
    private Long currentPoints;
    private Long lifetimePoints;
    private LocalDate tierStartDate;
    private LocalDate nextReviewDate;
    private List<VehicleAdminResponse> vehicles;
}
