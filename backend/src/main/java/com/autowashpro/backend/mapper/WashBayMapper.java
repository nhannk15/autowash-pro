package com.autowashpro.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.entity.WashBay;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface WashBayMapper {
    void updateWashBayFromRequest(WashBay source, @MappingTarget WashBay target);
}
