package com.autowashpro.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.mapper.MembershipTierMapper;
import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.entity.MembershipTier;
import com.autowashpro.backend.service.MembershipTierService;

@RestController
@RequestMapping("/api/membership-tiers")
public class MembershipTierController {

    @Autowired
    private MembershipTierService service;

    @Autowired
    private MembershipTierMapper mapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MembershipTier>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MembershipTier>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MembershipTier>> create(@RequestBody MembershipTier membershipTier) {
        return ResponseEntity.ok(ApiResponse.created(service.createNew(membershipTier)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<MembershipTier>> update(@RequestBody MembershipTier membershipTier, @PathVariable Long id) {
        MembershipTier target = service.findById(id);
        mapper.updateMembershipTierFromRequest(membershipTier, target);
        return ResponseEntity.ok(ApiResponse.success(service.update(target)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.noContent());
    }
}
