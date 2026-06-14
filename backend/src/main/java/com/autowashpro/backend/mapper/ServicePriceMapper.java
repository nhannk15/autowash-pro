package com.autowashpro.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.ServicePriceItemResponse;
import com.autowashpro.backend.model.entity.ServicePrice;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ServicePriceMapper {
    void updateServicePriceFromRequest(ServicePrice source, @MappingTarget ServicePrice target);

    @Mapping(source = "id", target = "servicePriceId")
    ServicePriceItemResponse toServicePriceItemResponse(ServicePrice servicePrice);
}
