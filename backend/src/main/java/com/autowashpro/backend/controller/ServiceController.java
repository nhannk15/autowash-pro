package com.autowashpro.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.dto.ServiceAdminResponse;
import com.autowashpro.backend.model.entity.Service;
import com.autowashpro.backend.service.ServiceService;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired
    private ServiceService service;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllServices() {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(service.getAllServiceAndServicePrice()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceAdminResponse>> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.toServiceAdminResponse(service.findById(id))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceAdminResponse>> createService(@RequestBody Service newService) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(service.toServiceAdminResponse(service.create(newService))));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceAdminResponse>> updateService(@PathVariable Long id, @RequestBody Service updatedService) {
        return ResponseEntity.ok(ApiResponse.success(service.toServiceAdminResponse(service.update(id, updatedService))));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.noContent());
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<ApiResponse<ServiceAdminResponse>> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.toServiceAdminResponse(service.toggleActive(id))));
    }
}
