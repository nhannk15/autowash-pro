package com.autowashpro.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.dto.RewardResponse;
import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.service.RewardService;

@RestController
@RequestMapping("/api/customer/rewards")
public class RewardCustomerController {

    @Autowired
    private RewardService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RewardResponse>>> getActiveRewards(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(service.getActiveRewards()));
    }
}
