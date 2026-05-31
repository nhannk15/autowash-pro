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

import com.autowashpro.backend.mapper.PromotionUsageMapper;
import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.entity.PromotionUsage;
import com.autowashpro.backend.service.PromotionUsageService;

@RestController
@RequestMapping("/api/promotion-usages")
public class PromotionUsageController {

    @Autowired
    private PromotionUsageService service;

    @Autowired
    private PromotionUsageMapper mapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PromotionUsage>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionUsage>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PromotionUsage>> create(@RequestBody PromotionUsage promotionUsage) {
        return ResponseEntity.ok(ApiResponse.created(service.createNew(promotionUsage)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionUsage>> update(@RequestBody PromotionUsage promotionUsage, @PathVariable Long id) {
        PromotionUsage target = service.findById(id);
        mapper.updatePromotionUsageFromRequest(promotionUsage, target);
        return ResponseEntity.ok(ApiResponse.success(service.update(target)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.noContent());
    }
}
