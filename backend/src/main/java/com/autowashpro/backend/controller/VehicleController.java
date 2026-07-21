package com.autowashpro.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.mapper.VehicleMapper;
import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.dto.CreateVehicleRequest;
import com.autowashpro.backend.model.dto.UpdateVehicleRequest;
import com.autowashpro.backend.model.dto.VehicleResponse;
import com.autowashpro.backend.service.VehicleService;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;
    private final VehicleMapper vehicleMapper;

    @Autowired
    public VehicleController(VehicleService vehicleService, VehicleMapper vehicleMapper) {
        this.vehicleService = vehicleService;
        this.vehicleMapper = vehicleMapper;
    }

    @GetMapping
    public ResponseEntity<?> getAllVehicles() {
        return ResponseEntity.status(HttpStatus.OK).body(vehicleService.findAllVehicles());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponse>> addNewVehicle(@AuthenticationPrincipal String email,
            @RequestBody CreateVehicleRequest request) {
        VehicleResponse response = vehicleService.addNewVehicleForCustomer(email, request);
        return ResponseEntity.ok(ApiResponse.created(response));
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<?>> findVehicleByUserId(@AuthenticationPrincipal String email) {
        List<VehicleResponse> vehicles = vehicleService.findAllVehiclesForCustomer(email);
        return ResponseEntity.ok(ApiResponse.success(vehicles));
    }

    @DeleteMapping("/{carId}")
    public ResponseEntity<?> deleteMyCar(@AuthenticationPrincipal String email, @PathVariable Long carId) {
        vehicleService.deleteMyCar(carId, email);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

    @PutMapping("/{vehicleId}")
    public ResponseEntity<?> updateMyCar(@AuthenticationPrincipal String email, @PathVariable Long vehicleId,
            @RequestBody UpdateVehicleRequest request) {
        return ResponseEntity.status(HttpStatus.OK).body(vehicleService.updateMyCar(email, vehicleId, request));
    }

}
