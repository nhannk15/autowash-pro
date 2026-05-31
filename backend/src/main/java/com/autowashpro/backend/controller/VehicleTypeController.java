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

import com.autowashpro.backend.mapper.VehicleTypeMapper;
import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.entity.VehicleType;
import com.autowashpro.backend.service.VehicleTypeService;

@RestController
@RequestMapping("/api/vehicle-types")
public class VehicleTypeController {

    @Autowired
    private VehicleTypeService service;

    @Autowired
    private VehicleTypeMapper mapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleType>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleType>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleType>> create(@RequestBody VehicleType vehicleType) {
        return ResponseEntity.ok(ApiResponse.created(service.createNew(vehicleType)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleType>> update(@RequestBody VehicleType vehicleType, @PathVariable Long id) {
        VehicleType target = service.findById(id);
        mapper.updateVehicleTypeFromRequest(vehicleType, target);
        return ResponseEntity.ok(ApiResponse.success(service.update(target)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.noContent());
    }
}
