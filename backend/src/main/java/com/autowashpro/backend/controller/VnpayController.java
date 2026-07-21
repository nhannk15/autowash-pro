package com.autowashpro.backend.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.model.enums.Role;
import com.autowashpro.backend.repository.UserRepository;
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
    private final UserRepository userRepository;

    @Autowired
    public VnpayController(VnpayService paymentService, BillingService billingService, UserRepository userRepository) {
        this.paymentService = paymentService;
        this.billingService = billingService;
        this.userRepository = userRepository;
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
    public void handleReturn(@AuthenticationPrincipal String name, HttpServletRequest request,
            HttpServletResponse response) throws IOException {

        User user = userRepository.findByEmail(name)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng"));

        Map<String, String> params = extractParams(request);
        billingService.completeBankingPayment(params);
        String vnpTxnRef = params.get("vnp_TxnRef");
        String vnpTransactionStatus = params.get("vnp_TransactionStatus");
        String billingId = vnpTxnRef.substring(0, vnpTxnRef.indexOf("_"));
        if (user.getRole().equals(Role.CUSTOMER)) {
            response.sendRedirect(frontendBaseUrl + "/ca-nhan/tong-quan" + "?" + "status=" + vnpTransactionStatus
                    + "&billing=" + billingId + "&role=" + user.getRole().toString());
        } else if (user.getRole().equals(Role.STAFF)) {
            response.sendRedirect(frontendBaseUrl + "/staff/payment" + "?" + "status=" + vnpTransactionStatus
                    + "&billing=" + billingId + "&role=" + user.getRole().toString());
        } else {
            response.sendRedirect(frontendBaseUrl + "?" + "status=" + vnpTransactionStatus + "&billing=" + billingId
                    + "&role=" + user.getRole().toString());
        }
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
