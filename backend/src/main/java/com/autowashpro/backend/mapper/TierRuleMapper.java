package com.autowashpro.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.entity.TierRule;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface TierRuleMapper {
    void updateTierRuleFromRequest(TierRule source, @MappingTarget TierRule target);
}
