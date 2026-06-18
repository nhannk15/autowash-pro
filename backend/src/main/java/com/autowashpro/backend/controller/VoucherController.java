package com.autowashpro.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.mapper.VoucherMapper;
import com.autowashpro.backend.model.dto.ExchangeVoucherRequest;
import com.autowashpro.backend.model.dto.VoucherResponse;
import com.autowashpro.backend.service.VoucherService;

@RestController
public class VoucherController {

    private final VoucherService voucherService;
    private final VoucherMapper voucherMapper;

    @Autowired
    public VoucherController(VoucherService voucherService, VoucherMapper voucherMapper) {
        this.voucherService = voucherService;
        this.voucherMapper = voucherMapper;
    }

    @PostMapping("/api/voucher/exchange")
    public ResponseEntity<VoucherResponse> exchangeVoucherForCustomer(@RequestBody ExchangeVoucherRequest request) {
        return ResponseEntity.status(HttpStatus.OK).body(voucherService.exchangeVoucherForCustomer(request));
    }

}
