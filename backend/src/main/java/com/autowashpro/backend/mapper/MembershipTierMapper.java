package com.autowashpro.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.MembershipTierSummaryResponse;
import com.autowashpro.backend.model.entity.MembershipTier;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface MembershipTierMapper {
    void updateMembershipTierFromRequest(MembershipTier source, @MappingTarget MembershipTier target);

    @Mapping(target = "membershipTierId", source = "id")
    @Mapping(target = "currentTierName", source = "tierName")
    @Mapping(target = "nextTierName", ignore = true)
    MembershipTierSummaryResponse toMembershipTierSummaryResponse(MembershipTier membershipTier);

}
