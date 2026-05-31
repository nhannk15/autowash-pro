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

import com.autowashpro.backend.mapper.TierRuleMapper;
import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.entity.TierRule;
import com.autowashpro.backend.service.TierRuleService;

@RestController
@RequestMapping("/api/tier-rules")
public class TierRuleController {

    @Autowired
    private TierRuleService service;

    @Autowired
    private TierRuleMapper mapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TierRule>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TierRule>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TierRule>> create(@RequestBody TierRule tierRule) {
        return ResponseEntity.ok(ApiResponse.created(service.createNew(tierRule)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<TierRule>> update(@RequestBody TierRule tierRule, @PathVariable Long id) {
        TierRule target = service.findById(id);
        mapper.updateTierRuleFromRequest(tierRule, target);
        return ResponseEntity.ok(ApiResponse.success(service.update(target)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.noContent());
    }
}
