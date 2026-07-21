package com.autowashpro.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autowashpro.backend.config.VnpayConfig;
import com.autowashpro.backend.exception.BillingNotFoundException;
import com.autowashpro.backend.model.entity.Billing;
import com.autowashpro.backend.model.enums.DepositStatus;
import com.autowashpro.backend.repository.BillingRepository;
import com.autowashpro.backend.utils.VnpayUtils;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class VnpayService {

    private final VnpayConfig vnpayConfig;
    private final VnpayUtils vnpayUtils;
    private final BillingRepository billingRepository;

    @Autowired
    public VnpayService(VnpayConfig vnpayConfig, VnpayUtils vnpayUtils, BillingRepository billingRepository) {
        this.vnpayConfig = vnpayConfig;
        this.vnpayUtils = vnpayUtils;
        this.billingRepository = billingRepository;
    }

    private static final DateTimeFormatter VNPAY_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    @Transactional
    public String createPaymentUrl(Long billingId, String orderInfo, HttpServletRequest request) {

        Billing billing = billingRepository.findById(billingId)
                .orElseThrow(() -> new BillingNotFoundException("Không tìm thấy hóa đơn với id: " + billingId));

        BigDecimal bankingAmount = billing.getFinalAmount();
        if (billing.getDepositStatus().equals(DepositStatus.PENDING)) {
            bankingAmount = billing.getDepositAmount();
        }
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", vnpayConfig.getVersion());
        params.put("vnp_Command", vnpayConfig.getCommand());
        params.put("vnp_TmnCode", vnpayConfig.getTmnCode());
        params.put("vnp_Amount", String.valueOf(bankingAmount.longValue() * 100L));
        params.put("vnp_CurrCode", vnpayConfig.getCurrCode());
        params.put("vnp_TxnRef", VnpayUtils.generateTxnRef(billingId));
        params.put("vnp_OrderInfo", orderInfo);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", vnpayConfig.getLocale());
        params.put("vnp_ReturnUrl", vnpayConfig.getReturnUrl());
        params.put("vnp_IpAddr", VnpayUtils.getClientIp(request));
        params.put("vnp_CreateDate", LocalDateTime.now().format(VNPAY_DATE_FORMAT));
        params.put("vnp_ExpireDate", LocalDateTime.now().plusMinutes(15).format(VNPAY_DATE_FORMAT));

        String hashData = VnpayUtils.buildHashData(params);
        String secureHash = VnpayUtils.toSecureHashString(vnpayConfig.getHashSecret(), hashData);

        TreeMap<String, String> sortedParams = new TreeMap<>(params);
        StringBuilder query = new StringBuilder();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            query.append(entry.getKey())
                    .append('=')
                    .append(VnpayUtils.urlEncode(entry.getValue()))
                    .append('&');
        }
        query.append("vnp_SecureHash=").append(secureHash);
 
        return vnpayConfig.getPayUrl() + "?" + query;
    }

    public boolean verifySignature(Map<String, String> vnpParams) {
        String receivedHash = vnpParams.get("vnp_SecureHash");
        if (receivedHash == null) {
            return false;
        }
 
        Map<String, String> filteredParams = new HashMap<>(vnpParams);
        filteredParams.remove("vnp_SecureHash");
        filteredParams.remove("vnp_SecureHashType");
 
        String hashData = VnpayUtils.buildHashData(filteredParams);
        String calculatedHash = VnpayUtils.toSecureHashString(vnpayConfig.getHashSecret(), hashData);
 
        return calculatedHash.equalsIgnoreCase(receivedHash);
    }

}
