package com.autowashpro.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.model.dto.DashboardSummaryResponse;
import com.autowashpro.backend.service.AdminDashboardService;

@RestController
public class AdminDashboardController {
    
    private final AdminDashboardService adminDashboardService;
    
    @Autowired
    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }



    @GetMapping("/api/admin/dashboard/summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummaryResponse(@RequestParam String period) {
        return ResponseEntity.ok().body(adminDashboardService.getSummary(period));
    }

}
