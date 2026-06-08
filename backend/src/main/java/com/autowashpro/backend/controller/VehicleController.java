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

import com.autowashpro.backend.mapper.VehicleMapper;
import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.dto.VehicleResponse;
import com.autowashpro.backend.model.entity.Vehicle;
import com.autowashpro.backend.service.VehicleService;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Autowired
    private VehicleService service;

    @Autowired
    private VehicleMapper vehicleMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Vehicle>>> findAllVehicles() {
        List<Vehicle> vehicles = service.findAll();
        return ResponseEntity.ok(ApiResponse.success(vehicles));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Vehicle>> findVehicleById(@PathVariable Long id) {
        Vehicle vehicle = service.findById(id);
        return ResponseEntity.ok(ApiResponse.success(vehicle));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Vehicle>> addNewVehicle(@RequestBody Vehicle newVehicle) {
        Vehicle created = service.createNew(newVehicle);
        return ResponseEntity.ok(ApiResponse.created(created));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<Vehicle>> updateVehicle(@RequestBody Vehicle vehicle, @PathVariable Long id) {
        Vehicle target = service.findById(id);
        vehicleMapper.updateVehicleFromRequest(vehicle, target);
        Vehicle updated = service.update(target);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.noContent());
    }

    @GetMapping("/user/{customerId}")
    public ResponseEntity<ApiResponse<?>> findVehicleByUserId(@PathVariable Long customerId) {
        List<VehicleResponse> vehicles = service.findByCustomerId(customerId);
        return ResponseEntity.ok(ApiResponse.success(vehicles));
    }

}
