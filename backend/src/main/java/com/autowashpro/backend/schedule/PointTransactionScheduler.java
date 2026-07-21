package com.autowashpro.backend.schedule;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.service.PointTransactionService;

@Component
public class PointTransactionScheduler {
    
    private final PointTransactionService pointTransactionService;

    @Autowired
    public PointTransactionScheduler(PointTransactionService pointTransactionService) {
        this.pointTransactionService = pointTransactionService;
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void evaluatePointTransaction() {
        pointTransactionService.evaluatePointTransactionExpiryDate();
    }
}
