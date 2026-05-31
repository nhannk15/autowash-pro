package com.autowashpro.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.entity.VehicleType;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface VehicleTypeMapper {
    void updateVehicleTypeFromRequest(VehicleType source, @MappingTarget VehicleType target);
}
