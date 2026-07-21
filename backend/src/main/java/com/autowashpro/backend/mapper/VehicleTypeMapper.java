package com.autowashpro.backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.VehicleTypeRequest;
import com.autowashpro.backend.model.dto.VehicleTypeResponse;
import com.autowashpro.backend.model.entity.VehicleType;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface VehicleTypeMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "vehicles", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "servicePrices", ignore = true)
    void updateVehicleTypeFromRequest(VehicleTypeRequest source, @MappingTarget VehicleType target);



    VehicleTypeResponse toResponse(VehicleType vehicleType);

    List<VehicleTypeResponse> toListResponses(List<VehicleType> vehicleTypes);
}
