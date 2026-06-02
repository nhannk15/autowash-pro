package com.autowashpro.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.mapper.ServicePriceMapper;
import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.entity.ServicePrice;
import com.autowashpro.backend.service.ServicePriceService;

@RestController
@RequestMapping("/api/service-prices")
public class ServicePriceController {

    @Autowired
    private ServicePriceService service;

    @Autowired
    private ServicePriceMapper mapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServicePrice>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServicePrice>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ServicePrice>> create(@RequestBody ServicePrice servicePrice) {
        return ResponseEntity.ok(ApiResponse.created(service.createNew(servicePrice)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ServicePrice>> update(@RequestBody ServicePrice servicePrice, @PathVariable Long id) {
        ServicePrice target = service.findById(id);
        mapper.updateServicePriceFromRequest(servicePrice, target);
        return ResponseEntity.ok(ApiResponse.success(service.update(target)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.noContent());
    }
}
