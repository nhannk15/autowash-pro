package com.autowashpro.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.autowashpro.backend.model.entity.Service;
import com.autowashpro.backend.model.entity.ServicePrice;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    Optional<Service> findByServiceName(String serviceName);

    @Query("""
            SELECT sp FROM ServicePrice sp 
            WHERE sp.id IN :ids 
            AND sp.vehicleType.id = :vehicleTypeId 
            AND sp.isActive = true
            """)
    List<ServicePrice> findActiveByIdsAndVehicleTypeId(
        @Param("ids") List<Long> ids, 
        @Param("vehicleTypeId") Long vehicleTypeId);

}
