package com.autowashpro.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.dto.NewServiceRequest;
import com.autowashpro.backend.model.dto.ServiceAdminResponse;
import com.autowashpro.backend.service.ServiceService;

@RestController
public class ServiceController {

    private final ServiceService service;

    @Autowired
    public ServiceController(ServiceService service) {
        this.service = service;
    }

    @GetMapping("/api/services")
    public ResponseEntity<ApiResponse<?>> getAllServices() {
        return ResponseEntity.status(HttpStatus.OK).body(ApiResponse.success(service.getAllServiceAndServicePrice()));
    }

    @PostMapping("/api/admin/services")
    public ResponseEntity<ServiceAdminResponse> createNewService(@RequestBody NewServiceRequest request) {
        return ResponseEntity.status(HttpStatus.OK).body(service.createNewService(request));
    }

    @DeleteMapping("api/admin/services/{serviceId}")
    public ResponseEntity<ServiceAdminResponse> deactiveService(@PathVariable Long serviceId) {
        return ResponseEntity.status(HttpStatus.OK).body(service.deactiveService(serviceId));
    }
}
