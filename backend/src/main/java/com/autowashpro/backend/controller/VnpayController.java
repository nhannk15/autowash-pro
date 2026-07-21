package com.autowashpro.backend.controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.exception.UserNotFoundException;
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
            @AuthenticationPrincipal String email,
            @RequestBody CreatePaymentRequest request,
            HttpServletRequest httpRequest) {

        String paymentUrl = paymentService.createPaymentUrl(
                request.billingId(), request.orderInfo(), httpRequest, email);

        return ResponseEntity.ok(new CreatePaymentResponse(paymentUrl));
    }

    @GetMapping("/return")
    public void handleReturn(@AuthenticationPrincipal String name, HttpServletRequest request,
            HttpServletResponse response) throws IOException {
        Map<String, String> params = extractParams(request);
        if (!paymentService.verifySignature(params)) {
            response.sendError(HttpStatus.BAD_REQUEST.value(), "Invalid VNPay signature");
            return;
        }

        billingService.completeBankingPayment(params);
        String vnpTxnRef = params.get("vnp_TxnRef");
        String vnpTransactionStatus = params.get("vnp_TransactionStatus");
        String billingId = vnpTxnRef.substring(0, vnpTxnRef.indexOf("_"));
        Role role = name == null
                ? Role.CUSTOMER
                : userRepository.findByEmail(name)
                        .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng"))
                        .getRole();
        if (role.equals(Role.CUSTOMER)) {
            response.sendRedirect(frontendBaseUrl + "/ca-nhan/tong-quan" + "?" + "status=" + vnpTransactionStatus
                    + "&billing=" + billingId + "&role=" + role);
        } else if (role.equals(Role.STAFF)) {
            response.sendRedirect(frontendBaseUrl + "/staff/payment" + "?" + "status=" + vnpTransactionStatus
                    + "&billing=" + billingId + "&role=" + role);
        } else {
            response.sendRedirect(frontendBaseUrl + "?" + "status=" + vnpTransactionStatus + "&billing=" + billingId
                    + "&role=" + role);
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
