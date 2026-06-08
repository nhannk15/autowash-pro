package com.autowashpro.backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.StepResponse;
import com.autowashpro.backend.model.entity.Step;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface StepMapper {
    
    StepResponse toStepResponse(Step step);

    List<StepResponse> toStepResponseList(List<Step> steps);

}
