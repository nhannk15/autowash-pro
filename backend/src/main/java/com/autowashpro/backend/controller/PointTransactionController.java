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

import com.autowashpro.backend.mapper.PointTransactionMapper;
import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.entity.PointTransaction;
import com.autowashpro.backend.service.PointTransactionService;

@RestController
@RequestMapping("/api/point-transactions")
public class PointTransactionController {

    @Autowired
    private PointTransactionService service;

    @Autowired
    private PointTransactionMapper mapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PointTransaction>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PointTransaction>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PointTransaction>> create(@RequestBody PointTransaction pointTransaction) {
        return ResponseEntity.ok(ApiResponse.created(service.createNew(pointTransaction)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<PointTransaction>> update(@RequestBody PointTransaction pointTransaction, @PathVariable Long id) {
        PointTransaction target = service.findById(id);
        mapper.updatePointTransactionFromRequest(pointTransaction, target);
        return ResponseEntity.ok(ApiResponse.success(service.update(target)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.noContent());
    }
}
