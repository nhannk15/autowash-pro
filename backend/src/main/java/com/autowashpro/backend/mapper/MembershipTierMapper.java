package com.autowashpro.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.entity.MembershipTier;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface MembershipTierMapper {
    void updateMembershipTierFromRequest(MembershipTier source, @MappingTarget MembershipTier target);
}
