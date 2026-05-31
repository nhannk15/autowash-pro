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

import com.autowashpro.backend.mapper.WashBayMapper;
import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.entity.WashBay;
import com.autowashpro.backend.service.WashBayService;

@RestController
@RequestMapping("/api/wash-bays")
public class WashBayController {

    @Autowired
    private WashBayService service;

    @Autowired
    private WashBayMapper mapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WashBay>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WashBay>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WashBay>> create(@RequestBody WashBay washBay) {
        return ResponseEntity.ok(ApiResponse.created(service.createNew(washBay)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<WashBay>> update(@RequestBody WashBay washBay, @PathVariable Long id) {
        WashBay target = service.findById(id);
        mapper.updateWashBayFromRequest(washBay, target);
        return ResponseEntity.ok(ApiResponse.success(service.update(target)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.noContent());
    }
}
