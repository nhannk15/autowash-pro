package com.autowashpro.backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.WashBayResponse;
import com.autowashpro.backend.model.entity.WashBay;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface WashBayMapper {
    void updateWashBayFromRequest(WashBay source, @MappingTarget WashBay target);

    @Mapping(target = "currentSession", ignore = true)
    WashBayResponse toWashBayResponse(WashBay washBay);

    List<WashBayResponse> toWashBayResponses(List<WashBay> washBays);
}
