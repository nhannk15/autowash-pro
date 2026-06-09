package com.autowashpro.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.mapper.CustomerMapper;
import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.dto.CustomerAdminResponse;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.service.CustomerService;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerService service;

    @Autowired
    private CustomerMapper mapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Customer>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(service.findAll()));
    }

    @GetMapping("/admin")
    public ResponseEntity<ApiResponse<Page<CustomerAdminResponse>>> findCustomersAdmin(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long tierId,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(service.searchCustomersAdmin(search, tierId, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Customer>> create(@RequestBody Customer customer) {
        return ResponseEntity.ok(ApiResponse.created(service.createNew(customer)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> update(@RequestBody Customer customer, @PathVariable Long id) {
        Customer target = service.findById(id);
        mapper.updateCustomerFromRequest(customer, target);
        return ResponseEntity.ok(ApiResponse.success(service.update(target)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.noContent());
    }
}
