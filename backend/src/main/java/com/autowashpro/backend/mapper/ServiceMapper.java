package com.autowashpro.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.ServiceAdminResponse;
import com.autowashpro.backend.model.entity.Service;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, uses = ServicePriceMapper.class)
public interface ServiceMapper {
    void updateServiceFromRequest(Service source, @MappingTarget Service target);

    @Mapping(target = "servicePriceItemResponses", source = "servicePrices")
    ServiceAdminResponse toServiceAdminResponse(Service service);
}
