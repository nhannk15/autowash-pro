package com.autowashpro.backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.HighlightResponse;
import com.autowashpro.backend.model.entity.Highlight;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface HighlightMapper {
    
    HighlightResponse toHighlightResponse(Highlight highlight);

    List<HighlightResponse> toHighlightResponseList(List<Highlight> highlight);

}
