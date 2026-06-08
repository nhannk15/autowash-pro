package com.autowashpro.backend.service;

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
        return repository.save(vehicle);
    }

    public Vehicle findById(Long id) {
        return repository.findById(id).get();
    }

    public List<Vehicle> findAll() {
        return repository.findAll();
    }

    public Vehicle update(Vehicle vehicle) {
        return repository.save(vehicle);
    }

    public void delete(Long id) {
        Vehicle vehicle = findById(id);
        repository.delete(vehicle);
    }

}
