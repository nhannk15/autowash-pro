package com.autowashpro.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.autowashpro.backend.model.entity.Vehicle;
import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    
    Optional<Vehicle> findByIdAndCustomerIdAndIsActiveTrue(Long vehicleId, Long customerId);

    List<Vehicle> findByCustomerId(Long id);

    boolean existsByLicensePlate(String licensePlate);

}
