package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.entity.Vehicle;
import com.autowashpro.backend.repository.VehicleRepository;

@Service
public class VehicleService {
    
    private VehicleRepository repository;

    public VehicleService() {
    }

    @org.springframework.beans.factory.annotation.Autowired
    public VehicleService(VehicleRepository repository) {
        this.repository = repository;
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
