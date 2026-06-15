package com.autowashpro.backend.controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.mapper.VehicleTypeMapper;
import com.autowashpro.backend.model.dto.VehicleTypeRequest;
import com.autowashpro.backend.model.dto.VehicleTypeResponse;
import com.autowashpro.backend.service.VehicleTypeService;

@RestController
public class VehicleTypeController {

    private final VehicleTypeService service;
    private final VehicleTypeMapper mapper;

    @Autowired
    public VehicleTypeController(VehicleTypeService service, VehicleTypeMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping("/api/admin/vehicle-types")
    public ResponseEntity<VehicleTypeResponse> create(@RequestBody VehicleTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createNew(request));
    }

    @GetMapping("/api/vehicle-types/{id}")
    public ResponseEntity<VehicleTypeResponse> findVehicleTypeById(@PathVariable Long id) {
        return ResponseEntity.ok().body(service.findById(id));
    }

    @GetMapping("/api/vehicle-types")
    public ResponseEntity<List<VehicleTypeResponse>> findAllVehicleTypes() {
        return ResponseEntity.status(HttpStatus.OK).body(service.findAll());
    }

    @PutMapping("/api/admin/vehicle-types/{id}")
    public ResponseEntity<VehicleTypeResponse> updateVehicleType(@PathVariable Long id, @RequestBody VehicleTypeRequest request) {
        return ResponseEntity.ok().body(service.updateVehicle(id, request));
    }

    @DeleteMapping("/api/admin/vehicle-types/{id}")
    public ResponseEntity<VehicleTypeResponse> deleteVehicleType(@PathVariable Long id) {
        return ResponseEntity.ok().body(service.deleteById(id));
    }

    @PutMapping("/api/admin/vehicle-types/restore/{id}")
    public ResponseEntity<VehicleTypeResponse> retoreVehicleType(@PathVariable Long id) {
        return ResponseEntity.ok().body(service.restoreById(id));
    }

}
