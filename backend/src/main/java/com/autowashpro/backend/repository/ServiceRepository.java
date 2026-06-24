package com.autowashpro.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.autowashpro.backend.model.dto.ServiceUsageStats;
import com.autowashpro.backend.model.entity.Service;
import com.autowashpro.backend.model.entity.ServicePrice;

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

    @Query("""
            SELECT 
                service.serviceName AS serviceName, 
                COUNT(service) AS totalUsages
            FROM Service service 
            JOIN service.servicePrices servicePrice 
            JOIN servicePrice.washSessions washSession
            WHERE washSession.status = com.autowashpro.backend.model.enums.WashSessionStatus.PAID
            GROUP BY service.id
            """)
    List<ServiceUsageStats> getServiceUsages();
}
