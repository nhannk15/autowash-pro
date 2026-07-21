package com.autowashpro.backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.PromotionUsageStats;
import com.autowashpro.backend.model.entity.PromotionUsage;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PromotionUsageMapper {
    void updatePromotionUsageFromRequest(PromotionUsage source, @MappingTarget PromotionUsage target);

    @Mapping(target = "promotionName", source = "promotion.promotionName")
    @Mapping(target = "billingId", source = "billing.id")
    @Mapping(target = "customerName", source = "billing.booking.customer.fullName")
    PromotionUsageStats toPromotionUsageStats(PromotionUsage promotionUsage);
    List<PromotionUsageStats> toPromotionUsageStatss(List<PromotionUsage> promotionUsages);
}
