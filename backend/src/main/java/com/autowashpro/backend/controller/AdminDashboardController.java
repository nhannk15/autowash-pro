package com.autowashpro.backend.controller;

import com.autowashpro.backend.service.PromotionUsageService;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.model.dto.DashboardSummaryResponse;
import com.autowashpro.backend.model.dto.DeductionChartItem;
import com.autowashpro.backend.model.dto.PeakHourStats;
import com.autowashpro.backend.model.dto.PromotionPerformanceItem;
import com.autowashpro.backend.model.dto.PromotionUsageStats;
import com.autowashpro.backend.model.dto.RecentTransactionItem;
import com.autowashpro.backend.model.dto.RevenueDataRequest;
import com.autowashpro.backend.model.dto.RevenueDataResponse;
import com.autowashpro.backend.model.dto.ServiceUsageStats;
import com.autowashpro.backend.service.AdminDashboardService;

@RestController
public class AdminDashboardController {
    
    private final PromotionUsageService promotionUsageService;
    private final AdminDashboardService adminDashboardService;
    
    @Autowired
    public AdminDashboardController(AdminDashboardService adminDashboardService, PromotionUsageService promotionUsageService) {
        this.adminDashboardService = adminDashboardService;
        this.promotionUsageService = promotionUsageService;
    }

    @GetMapping("/api/admin/dashboard/recent-transactions")
    public ResponseEntity<List<RecentTransactionItem>> getRecentTransactions() {
        return ResponseEntity.ok().body(adminDashboardService.getRecentTransactions());
    }

    @PostMapping("/api/admin/dashboard/summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummaryResponse(@RequestBody RevenueDataRequest request) {
        return ResponseEntity.ok().body(adminDashboardService.getSummary(request));
    }
    
    @PostMapping("/api/admin/dashboard/revenue-chart")
    public ResponseEntity<List<RevenueDataResponse>> getRevenueResponse(@RequestBody RevenueDataRequest request) {
        return ResponseEntity.ok().body(adminDashboardService.getRevenueData(request));
    }

    @PostMapping("/api/admin/dashboard/service-distribution")
    public ResponseEntity<List<ServiceUsageStats>> getServiceDistribution(@RequestBody RevenueDataRequest request) {
        return ResponseEntity.ok().body(adminDashboardService.getServiceUsagesStats(request));
    }

    @PostMapping("/api/admin/dashboard/peak-hours")
    public ResponseEntity<List<PeakHourStats>> getPeakHours(@RequestBody RevenueDataRequest request) {
        return ResponseEntity.ok().body(adminDashboardService.getPeakHours(request));
    }

    @PostMapping("/api/admin/dashboard/promotion-usages")
    public ResponseEntity<List<PromotionUsageStats>> getPromotionsUsage(@RequestBody RevenueDataRequest request) {
        return ResponseEntity.ok().body(adminDashboardService.getPromotionUsageStats(request));
    }

    @PostMapping("/api/admin/dashboard/promotion-usage-count")
    public ResponseEntity<HashMap<String, Long>> getPromotionUsageCount(@RequestBody RevenueDataRequest request) {
        return ResponseEntity.ok().body(adminDashboardService.countPromotionUsage(request));
    }

    @PostMapping("/api/admin/dashboard/deduction-chart")
    public ResponseEntity<List<DeductionChartItem>> getDeductionChartItems(@RequestBody RevenueDataRequest request) {
        return ResponseEntity.ok().body(adminDashboardService.getPromotionDeductionChartItems(request));
    }

    @PostMapping("/api/admin/dashboard/promotion-performance")
    public ResponseEntity<List<PromotionPerformanceItem>> getPromotionPerformanceItems(@RequestBody RevenueDataRequest request) {
        return ResponseEntity.ok().body(adminDashboardService.getPromotionPerformance(request));
    }
    
}
