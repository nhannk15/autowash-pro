package com.autowashpro.backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.BookingPromotionResponse;
import com.autowashpro.backend.model.dto.PromotionResponse;
import com.autowashpro.backend.model.entity.Promotion;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PromotionMapper {

    @Mapping(target = "id", ignore = true)
    void updatePromotionFromRequest(Promotion source, @MappingTarget Promotion target);

    @Mapping(source = "service.serviceName", target = "serviceName")
    @Mapping(source = "membershipTier.tierName", target = "minTierName")
    @Mapping(source = "staff.fullName", target = "createdByStaff")
    PromotionResponse toPromotionResponse(Promotion promotion);

    List<PromotionResponse> toPromotionResponses(List<Promotion> promotions);

    BookingPromotionResponse toBookingPromotionResponse(Promotion promotion);
}
