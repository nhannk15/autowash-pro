package com.autowashpro.backend.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.mapper.WashBayMapper;
import com.autowashpro.backend.service.WashBayService;

@RestController
public class WashBayController {

    private final WashBayService washBayService;

    @Autowired
    public WashBayController(WashBayService washBayService, WashBayMapper mapper) {
        this.washBayService = washBayService;
    }

    @GetMapping("/api/staff/wash-bays")
    public ResponseEntity<?> getWashBayListInTheCurrentSession() {
        return ResponseEntity.status(HttpStatus.OK).body(washBayService.getWashBayListInTheCurrentSession());
    }
}
