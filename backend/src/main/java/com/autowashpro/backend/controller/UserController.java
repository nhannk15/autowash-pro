package com.autowashpro.backend.controller;

import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;

import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.dto.UserResponse;
import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    @Autowired
    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> findAllUsers() {
        List<User> users = service.findAll();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal String email) {
        return ResponseEntity.status(HttpStatus.OK).body(service.getMyInfo(email));
    }

    public record CheckPasswordEqualRequest(String password, String confirm) {
    }
    @PostMapping("/check-password")
    public ResponseEntity<HashMap<String, Boolean>> checkIfPasswordEquals(@AuthenticationPrincipal String email, @RequestBody CheckPasswordEqualRequest request) {
        return ResponseEntity.ok().body(service.checkPasswordEqual(email, request));
    }

    public record ChangePasswordRequest(String newPassword) {
    }
    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal String email, @RequestBody ChangePasswordRequest request) {
        service.changePassword(email, request);
        return ResponseEntity.noContent().build();
    }

}
