package com.autowashpro.backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.WashSessionResponse;
import com.autowashpro.backend.model.entity.WashSession;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, uses = VehicleMapper.class)
public interface WashSessionMapper {
    void updateWashSessionFromRequest(WashSession source, @MappingTarget WashSession target);

    @Mapping(target = "bookingId", source = "booking.id")
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerFullName", source = "customer.fullName")
    @Mapping(target = "vehicleResponse", source = "vehicle")
    @Mapping(target = "servicePriceId", source = "servicePrice.id")
    @Mapping(target = "serviceName", source = "servicePrice.service.serviceName")
    @Mapping(target = "staffId", source = "staff.id")
    @Mapping(target = "createdByStaff", source = "staff.fullName")
    @Mapping(target = "washSessionStatus", source = "status")
    @Mapping(target = "washBay", source = "bay.name")
    WashSessionResponse toRepsonse(WashSession washSession);

    List<WashSessionResponse> toResponseList(List<WashSession> washSessions);
}
