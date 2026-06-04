package com.autowashpro.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.autowashpro.backend.model.entity.Vehicle;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    
    Optional<Vehicle> findByIdAndCustomerIdAndIsActiveTrue(Long vehicleId, Long customerId);

}
