package com.autowashpro.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.dto.MembershipTierRequest;
import com.autowashpro.backend.model.dto.MembershipTierResponse;
import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.service.MembershipTierService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/membership-tiers")
@PreAuthorize("hasRole('ADMIN')")
public class AdminMembershipTierController {

    private final MembershipTierService membershipTierService;

    @Autowired
    public AdminMembershipTierController(MembershipTierService membershipTierService) {
        this.membershipTierService = membershipTierService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MembershipTierResponse>>> getAllTiers(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(membershipTierService.getAllTiers()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MembershipTierResponse>> getTierById(
            @PathVariable Long id, 
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(membershipTierService.getTierById(id)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MembershipTierResponse>> updateTier(
            @PathVariable Long id,
            @Valid @RequestBody MembershipTierRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(membershipTierService.updateTier(id, request)));
    }
}
