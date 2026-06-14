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

import com.autowashpro.backend.mapper.RewardMapper;
import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.entity.Reward;
import com.autowashpro.backend.service.RewardService;

@RestController
@RequestMapping("/api/rewards")
public class RewardController {

    @Autowired
    private RewardService service;

    @Autowired
    private RewardMapper mapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Reward>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Reward>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Reward>> create(@RequestBody Reward reward) {
        return ResponseEntity.ok(ApiResponse.created(service.createNew(reward)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<Reward>> update(@RequestBody Reward reward, @PathVariable Long id) {
        Reward target = service.findById(id);
        mapper.updateRewardFromRequest(reward, target);
        return ResponseEntity.ok(ApiResponse.success(service.update(target)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.noContent());
    }
}
