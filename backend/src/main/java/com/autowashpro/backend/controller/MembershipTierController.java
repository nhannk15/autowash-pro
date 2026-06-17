package com.autowashpro.backend.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.mapper.MembershipTierMapper;
import com.autowashpro.backend.model.dto.CustomerTierResponse;
import com.autowashpro.backend.service.MembershipTierService;

@RestController
public class MembershipTierController {

    private final MembershipTierService membershipTierService;
    private final MembershipTierMapper membershipTierMapper;

    @Autowired
    public MembershipTierController(MembershipTierService membershipTierService,
            MembershipTierMapper membershipTierMapper) {
        this.membershipTierService = membershipTierService;
        this.membershipTierMapper = membershipTierMapper;
    }

    @GetMapping("/api/membership-tier")
    public ResponseEntity<CustomerTierResponse> getCustomerTierResponse(@AuthenticationPrincipal String email) {
        return ResponseEntity.status(HttpStatus.OK).body(membershipTierService.getCustomerMembershipTier(email));
    }
    
}
