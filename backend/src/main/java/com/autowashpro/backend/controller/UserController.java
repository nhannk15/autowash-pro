package com.autowashpro.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

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
    public ResponseEntity<ApiResponse<List<User>>> findAllUsers() {
        List<User> users = service.findAll();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal String email) {
        return ResponseEntity.status(HttpStatus.OK).body(service.getMyInfo(email));
    }   

}
