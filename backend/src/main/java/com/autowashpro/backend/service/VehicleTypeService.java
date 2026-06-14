package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.mapper.VehicleTypeMapper;
import com.autowashpro.backend.model.dto.VehicleTypeRequest;
import com.autowashpro.backend.model.dto.VehicleTypeResponse;
import com.autowashpro.backend.model.entity.VehicleType;
import com.autowashpro.backend.repository.VehicleTypeRepository;

@Service
public class VehicleTypeService {

    private final VehicleTypeRepository repository;
    private final VehicleTypeMapper vehicleTypeMapper;

    @Autowired
    public VehicleTypeService(VehicleTypeRepository repository, VehicleTypeMapper vehicleTypeMapper) {
        this.repository = repository;
        this.vehicleTypeMapper = vehicleTypeMapper;
    }

    public VehicleTypeResponse createNew(VehicleTypeRequest request) {
        VehicleType newVehicleType = VehicleType
                .builder()
                .typeName(request.getTypeName())
                .description(request.getDescription())
                .build();
        VehicleType savedVehicleType = repository.save(newVehicleType);
        return vehicleTypeMapper.toResponse(savedVehicleType);
    }

    public VehicleTypeResponse findById(@NonNull Long id) {
        VehicleType vehicleType = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("VehicleType not found with id: " + id));
        return vehicleTypeMapper.toResponse(vehicleType);
    }

    public List<VehicleTypeResponse> findAll() {
        List<VehicleType> vehicleTypes = repository.findAll();
        return vehicleTypeMapper.toListResponses(vehicleTypes);
    }

    public VehicleTypeResponse updateVehicle(Long id, VehicleTypeRequest request) {
        VehicleType targetVehicle = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("VehicleType not found with id: " + id));

        vehicleTypeMapper.updateVehicleTypeFromRequest(request, targetVehicle);
        VehicleType savedVehicleType = repository.save(targetVehicle);
        return vehicleTypeMapper.toResponse(savedVehicleType);
    }

    public VehicleTypeResponse deleteById(Long id) {
        VehicleType targetVehicle = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("VehicleType not found with id: " + id));
        targetVehicle.setActive(false);
        VehicleType savedVehicleType = repository.save(targetVehicle);
        return vehicleTypeMapper.toResponse(savedVehicleType);
    }

    public VehicleTypeResponse restoreById(Long id) {
        VehicleType targetVehicle = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("VehicleType not found with id: " + id));
        targetVehicle.setActive(true);
        VehicleType savedVehicleType = repository.save(targetVehicle);
        return vehicleTypeMapper.toResponse(savedVehicleType);
    }

}
