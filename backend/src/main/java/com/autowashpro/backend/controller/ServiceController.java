package com.autowashpro.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.mapper.ServiceMapper;
import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.service.ServiceService;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired
    private ServiceService service;

    @Autowired
    private ServiceMapper mapper;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllServices() {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(service.getAllServiceAndServicePrice()));
    }
}
