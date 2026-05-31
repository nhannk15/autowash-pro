package com.autowashpro.backend.controller;

import java.util.List;

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

import com.autowashpro.backend.mapper.VehicleMapper;
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
    public List<Vehicle> findAllVehicles() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findVehicleById(@PathVariable Long id) {
        return ResponseEntity.ok().body(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<?> addNewVehicle(@RequestBody Vehicle newVehicle) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createNew(newVehicle));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateVehicle(@RequestBody Vehicle vehicle, @PathVariable Long id) {
        Vehicle target = service.findById(id);
        vehicleMapper.updateVehicleFromRequest(vehicle, target);
        return ResponseEntity.ok().body(service.update(target));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

}
