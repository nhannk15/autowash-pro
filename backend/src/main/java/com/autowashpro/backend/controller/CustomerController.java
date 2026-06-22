package com.autowashpro.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
public class CustomerController {

    private final CustomerService service;

    @Autowired
    public CustomerController(CustomerService service) {
        this.service = service;
    }

    @GetMapping("/api/customers/info")
    public ResponseEntity<?> getCurrentCustomerInfo(@AuthenticationPrincipal String email) {
        return ResponseEntity.status(HttpStatus.OK).body(service.getCurrentInfo(email));
    }

    @GetMapping("/api/admin/customers")
    public ResponseEntity<ApiResponse<Page<CustomerAdminResponse>>> findAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long tierId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(service.searchCustomersAdmin(search, tierId, pageable)));
    }

    @GetMapping("/api/admin/customers/{id}")
    public ResponseEntity<ApiResponse<CustomerAdminResponse>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.toCustomerAdminResponse(service.findById(id))));
    }

    @PostMapping("/api/admin/customers")
    public ResponseEntity<ApiResponse<CustomerAdminResponse>> create(@RequestBody CustomerRequest request) {
        return ResponseEntity.ok(ApiResponse.created(service.toCustomerAdminResponse(service.createByAdmin(request))));
    }

    @PutMapping("/api/admin/customers/{id}")
    public ResponseEntity<ApiResponse<CustomerAdminResponse>> update(@RequestBody CustomerRequest request,
            @PathVariable Long id) {
        return ResponseEntity
                .ok(ApiResponse.success(service.toCustomerAdminResponse(service.updateByAdmin(id, request))));
    }

    @DeleteMapping("/api/admin/customers/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        service.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/api/admin/customers/restore/{id}")
    public ResponseEntity<ApiResponse<Void>> restore(@PathVariable Long id) {
        service.activate(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
