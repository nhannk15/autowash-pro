package com.autowashpro.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.model.dto.DashboardSummaryResponse;
import com.autowashpro.backend.model.dto.RecentTransactionItem;
import com.autowashpro.backend.model.dto.RevenueDataRequest;
import com.autowashpro.backend.model.dto.RevenueDataResponse;
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

    @GetMapping("/api/admin/dashboard/recent-transactions")
    public ResponseEntity<List<RecentTransactionItem>> getRecentTransactions() {
        return ResponseEntity.ok().body(adminDashboardService.getRecentTransactions());
    }
    
    @PostMapping("/api/admin/dashboard/revenue-chart")
    public ResponseEntity<List<RevenueDataResponse>> getRevenueResponse(@RequestBody RevenueDataRequest request) {
        return ResponseEntity.ok().body(adminDashboardService.getRevenueData(request));
    }
}
