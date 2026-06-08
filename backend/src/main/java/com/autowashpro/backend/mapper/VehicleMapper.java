package com.autowashpro.backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.VehicleResponse;
import com.autowashpro.backend.model.entity.Vehicle;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface VehicleMapper {
    void updateVehicleFromRequest(Vehicle source, @MappingTarget Vehicle target);

    @Mapping(source = "vehicle.id", target = "vehicleId")
    @Mapping(source = "vehicleType.typeName", target = "typeName")
    VehicleResponse toVehicleResponse(Vehicle vehicle);

    List<VehicleResponse> toVehicleResponseList(List<Vehicle> vehicles);
}
