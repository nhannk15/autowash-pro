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

import com.autowashpro.backend.mapper.BillingMapper;
import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.entity.Billing;
import com.autowashpro.backend.service.BillingService;

@RestController
@RequestMapping("/api/billings")
public class BillingController {

    @Autowired
    private BillingService service;

    @Autowired
    private BillingMapper mapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Billing>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Billing>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Billing>> create(@RequestBody Billing billing) {
        return ResponseEntity.ok(ApiResponse.created(service.createNew(billing)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<Billing>> update(@RequestBody Billing billing, @PathVariable Long id) {
        Billing target = service.findById(id);
        mapper.updateBillingFromRequest(billing, target);
        return ResponseEntity.ok(ApiResponse.success(service.update(target)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.noContent());
    }
}
