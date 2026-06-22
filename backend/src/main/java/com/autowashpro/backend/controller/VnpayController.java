package com.autowashpro.backend.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.service.BillingService;
import com.autowashpro.backend.service.VnpayService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/payment/vnpay")
public class VnpayController {
    
    @Value("${frontend.base-url}")
    private String frontendBaseUrl;
    private final VnpayService paymentService;
    private final BillingService billingService;

    @Autowired
    public VnpayController(VnpayService paymentService, BillingService billingService) {
        this.paymentService = paymentService;
        this.billingService = billingService;
    }

    public record CreatePaymentRequest(Long billingId, String orderInfo) {
    }
    public record CreatePaymentResponse(String paymentUrl) {
    }

    
    @PostMapping("/create")
    public ResponseEntity<CreatePaymentResponse> createPayment(
            @RequestBody CreatePaymentRequest request,
            HttpServletRequest httpRequest) {

        String paymentUrl = paymentService.createPaymentUrl(
                request.billingId(), request.orderInfo(), httpRequest);

        return ResponseEntity.ok(new CreatePaymentResponse(paymentUrl));
    }

    @GetMapping("/return")
    public void handleReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Map<String, String> params = extractParams(request);
        billingService.completeBankingPayment(params);
        response.sendRedirect(frontendBaseUrl);
    }

    private Map<String, String> extractParams(HttpServletRequest request) {
        Map<String, String> params = new HashMap<>();
        request.getParameterMap().forEach((key, values) -> {
            if (values.length > 0) {
                params.put(key, values[0]);
            }
        });
        return params;
    }

}
