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

import com.autowashpro.backend.mapper.WashSessionMapper;
import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.entity.WashSession;
import com.autowashpro.backend.service.WashSessionService;

@RestController
@RequestMapping("/api/wash-sessions")
public class WashSessionController {

    @Autowired
    private WashSessionService service;

    @Autowired
    private WashSessionMapper mapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WashSession>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WashSession>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WashSession>> create(@RequestBody WashSession washSession) {
        return ResponseEntity.ok(ApiResponse.created(service.createNew(washSession)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<WashSession>> update(@RequestBody WashSession washSession, @PathVariable Long id) {
        WashSession target = service.findById(id);
        mapper.updateWashSessionFromRequest(washSession, target);
        return ResponseEntity.ok(ApiResponse.success(service.update(target)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.noContent());
    }
}
