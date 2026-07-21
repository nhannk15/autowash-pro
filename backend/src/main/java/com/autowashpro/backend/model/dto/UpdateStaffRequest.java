package com.autowashpro.backend.model.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class UpdateStaffRequest {

    private String fullName;

    @Email(message = "Invalid email format")
    private String email;

    private String password;

    private String phoneNumber;

    private LocalDate hiredDate;
}
