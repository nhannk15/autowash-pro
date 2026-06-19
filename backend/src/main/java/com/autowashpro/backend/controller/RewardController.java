package com.autowashpro.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.dto.RewardRequest;
import com.autowashpro.backend.model.dto.RewardResponse;
import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.service.RewardService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/rewards")
@PreAuthorize("hasRole('ADMIN')")
public class RewardController {

    @Autowired
    private RewardService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RewardResponse>>> findAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(service.getAllRewards()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RewardResponse>> findById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(service.getRewardById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RewardResponse>> create(
            @Valid @RequestBody RewardRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(201).body(ApiResponse.created(service.createReward(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RewardResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody RewardRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(service.updateReward(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id, @AuthenticationPrincipal User user) {
        service.deactivateReward(id);
        return ResponseEntity.status(204).body(ApiResponse.noContent());
    }
}
