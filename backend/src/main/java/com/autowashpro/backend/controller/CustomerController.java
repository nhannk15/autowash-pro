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
import com.autowashpro.backend.model.dto.CustomerAdminResponse;
import com.autowashpro.backend.model.dto.CustomerRequest;
import com.autowashpro.backend.service.CustomerService;

@RestController
@RequestMapping("/api/admin/customers")
@PreAuthorize("hasRole('ADMIN')")
public class CustomerController {

    @Autowired
    private CustomerService service;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CustomerAdminResponse>>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long tierId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(service.searchCustomersAdmin(search, tierId, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerAdminResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.toCustomerAdminResponse(service.findById(id))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerAdminResponse>> create(@RequestBody CustomerRequest request) {
        return ResponseEntity.ok(ApiResponse.created(service.toCustomerAdminResponse(service.createByAdmin(request))));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerAdminResponse>> update(@RequestBody CustomerRequest request,
            @PathVariable Long id) {
        return ResponseEntity
                .ok(ApiResponse.success(service.toCustomerAdminResponse(service.updateByAdmin(id, request))));
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
