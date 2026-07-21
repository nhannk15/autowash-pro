package com.autowashpro.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.mapper.PointTransactionMapper;
import com.autowashpro.backend.model.dto.RecentTransactionResponse;
import com.autowashpro.backend.schedule.TaskScheduler;
import com.autowashpro.backend.schedule.TierReviewScheduler;
import com.autowashpro.backend.service.PointTransactionService;

@RestController
public class PointTransactionController {

    private final PointTransactionService pointTransactionService;
    private final PointTransactionMapper pointTransactionMapper;
    private final TaskScheduler taskScheduler;

    @Autowired
    public PointTransactionController(PointTransactionService pointTransactionService,
            PointTransactionMapper pointTransactionMapper, TierReviewScheduler tierReviewScheduler) {
        this.pointTransactionService = pointTransactionService;
        this.pointTransactionMapper = pointTransactionMapper;
        this.taskScheduler = tierReviewScheduler;
    }

    @GetMapping("/api/admin/evaluate-point-transaction")
    public ResponseEntity<Void> evaluatePointTransactionExpiryDate() {
        pointTransactionService.evaluatePointTransactionExpiryDate();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/admin/tier-evaluate")
    public ResponseEntity<Void> evaluateCustomerTier() {
        taskScheduler.doScheduleTask();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/customer/recent-activities")
    public ResponseEntity<List<RecentTransactionResponse>> getRecentActivities(@AuthenticationPrincipal String email) {
        return ResponseEntity.status(HttpStatus.OK).body(pointTransactionService.getCustomerRecentActivities(email));
    }
}
