package com.autowashpro.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.dto.CreateStaffRequest;
import com.autowashpro.backend.model.dto.StaffAdminResponse;
import com.autowashpro.backend.model.dto.UpdateStaffRequest;
import com.autowashpro.backend.service.StaffService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/staffs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStaffController {

    @Autowired
    private StaffService service;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<StaffAdminResponse>>> findAll(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(service.searchStaffsAdmin(search, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StaffAdminResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.toStaffAdminResponse(service.findById(id))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StaffAdminResponse>> create(@Valid @RequestBody CreateStaffRequest request) {
        return ResponseEntity.ok(ApiResponse.created(service.toStaffAdminResponse(service.createByAdmin(request))));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StaffAdminResponse>> update(@PathVariable Long id,
            @Valid @RequestBody UpdateStaffRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.toStaffAdminResponse(service.updateByAdmin(id, request))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        service.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/restore/{id}")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        service.activate(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
