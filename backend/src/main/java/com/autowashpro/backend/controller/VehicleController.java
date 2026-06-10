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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.mapper.VehicleMapper;
import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.dto.CreateVehicleRequest;
import com.autowashpro.backend.model.dto.VehicleResponse;
import com.autowashpro.backend.service.VehicleService;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Autowired
    private VehicleService service;

    @Autowired
    private VehicleMapper vehicleMapper;

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponse>> addNewVehicle(@RequestBody CreateVehicleRequest request) {
        VehicleResponse response = service.addNewVehicleForCustomer(request);
        return ResponseEntity.ok(ApiResponse.created(response));
    }

    @GetMapping("/user/{customerId}")
    public ResponseEntity<ApiResponse<?>> findVehicleByUserId(@PathVariable Long customerId) {
        List<VehicleResponse> vehicles = service.findByCustomerId(customerId);
        return ResponseEntity.ok(ApiResponse.success(vehicles));
    }

    @DeleteMapping("/{carId}")
    public ResponseEntity<?> deleteMyCar(@AuthenticationPrincipal String email, @PathVariable Long carId) {
        service.deleteMyCar(carId, email);
        return ResponseEntity.status(HttpStatus.OK).body(null);
    }

}
