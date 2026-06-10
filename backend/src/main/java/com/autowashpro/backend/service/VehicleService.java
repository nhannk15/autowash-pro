package com.autowashpro.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.mapper.VehicleMapper;
import com.autowashpro.backend.model.dto.VehicleResponse;
import com.autowashpro.backend.model.entity.Vehicle;
import com.autowashpro.backend.repository.UserRepository;
import com.autowashpro.backend.repository.VehicleRepository;

@Service
public class VehicleService {
    
    @Autowired
    private VehicleRepository repository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleMapper vehicleMapper;

    public List<VehicleResponse> findByCustomerId(Long id) {
        userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("Người dùng không tồn tại."));
        return vehicleMapper.toVehicleResponseList(repository.findByCustomerId(id));
    }

    public Vehicle createNew(Vehicle vehicle) {
        // Validate unique license plate
        if (vehicle.getLicensePlate() != null && repository.existsByLicensePlate(vehicle.getLicensePlate())) {
            throw new IllegalArgumentException("Biển số xe đã tồn tại!");
        }

        // Set defaults
        vehicle.setActive(true);
        vehicle.setCreatedAt(LocalDateTime.now());
        vehicle.setUpdatedAt(LocalDateTime.now());

        return repository.save(vehicle);
    }

    public Vehicle findById(Long id) {
        return repository.findById(id).get();
    }

    public List<Vehicle> findAll() {
        return repository.findAll();
    }

    public Vehicle update(Vehicle vehicle) {
        Vehicle existing = findById(vehicle.getId());

        // Check license plate unique if changed
        if (vehicle.getLicensePlate() != null
                && !vehicle.getLicensePlate().equals(existing.getLicensePlate())
                && repository.existsByLicensePlate(vehicle.getLicensePlate())) {
            throw new IllegalArgumentException("Biển số xe đã tồn tại!");
        }

        vehicle.setUpdatedAt(LocalDateTime.now());
        return repository.save(vehicle);
    }

    public void delete(Long id) {
        Vehicle vehicle = findById(id);
        repository.delete(vehicle);
    }

}
