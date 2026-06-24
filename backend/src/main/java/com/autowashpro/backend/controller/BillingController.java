package com.autowashpro.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.mapper.BillingMapper;
import com.autowashpro.backend.model.dto.ApplyVoucherToBillingRequest;
import com.autowashpro.backend.model.dto.BillingResponse;
import com.autowashpro.backend.model.dto.VoucherResponse;
import com.autowashpro.backend.service.BillingService;

@RestController
public class BillingController {

    private final BillingService billingService;
    private final BillingMapper mapper;

    @Autowired
    public BillingController(BillingService billingService, BillingMapper mapper) {
        this.billingService = billingService;
        this.mapper = mapper;
    }

    @PostMapping("/api/billings")
    public ResponseEntity<List<BillingResponse>> getAllBillingAccordingToListOfBookingIds(@RequestBody List<Long> bookingIds) {
        return ResponseEntity.status(HttpStatus.OK).body(billingService.getAllBillingAccordingToListOfBookingIds(bookingIds));
    }

    @PostMapping("/api/billings/complete/cash")
    public ResponseEntity<BillingResponse> completeBillingUsingCashMethod(@RequestBody Long billingId) {
        return ResponseEntity.status(HttpStatus.OK).body(billingService.completeBillingUsingCashMethod(billingId));
    }

    @PostMapping("/api/billings/apply-voucher")
    public ResponseEntity<VoucherResponse> applyVoucherForBilling(@RequestBody ApplyVoucherToBillingRequest request) {
        return ResponseEntity.status(HttpStatus.OK).body(billingService.applyVoucherForBilling(request));
    }
    
}
