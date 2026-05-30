package com.autowashpro.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
    private String access_token;
    private String token_type;
    private long expires_in; // seconds
}
