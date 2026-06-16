package com.autowashpro.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.mapper.BillingMapper;
import com.autowashpro.backend.service.BillingService;

@RestController
@RequestMapping("/api/billings")
public class BillingController {

    private final BillingService service;
    private final BillingMapper mapper;

    @Autowired
    public BillingController(BillingService service, BillingMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    
}
