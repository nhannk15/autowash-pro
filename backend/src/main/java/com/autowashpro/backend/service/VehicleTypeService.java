package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.entity.VehicleType;
import com.autowashpro.backend.repository.VehicleTypeRepository;

@Service
public class VehicleTypeService {

    private VehicleTypeRepository repository;

    public VehicleTypeService() {
    }

    @Autowired
    public VehicleTypeService(VehicleTypeRepository repository) {
        this.repository = repository;
    }

    public VehicleType createNew(@NonNull VehicleType vehicleType) {
        return repository.save(vehicleType);
    }

    public VehicleType findById(@NonNull Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("VehicleType not found with id: " + id));
    }

    public List<VehicleType> findAll() {
        return repository.findAll();
    }

    public VehicleType update(@NonNull VehicleType vehicleType) {
        return repository.save(vehicleType);
    }

    public void delete(@NonNull Long id) {
        VehicleType vehicleType = findById(id);
        repository.delete(vehicleType);
    }
}
