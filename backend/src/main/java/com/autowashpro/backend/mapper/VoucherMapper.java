package com.autowashpro.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.BillingVoucherResponse;
import com.autowashpro.backend.model.dto.VoucherResponse;
import com.autowashpro.backend.model.entity.Voucher;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface VoucherMapper {
    void updateVoucherFromRequest(Voucher source, @MappingTarget Voucher target);

    BillingVoucherResponse toBillingVoucherResponse(Voucher voucher);

    @Mapping(target = "rewardName", source = "reward.rewardName")
    @Mapping(target = "customerName", source = "customer.fullName")
    VoucherResponse toVoucherResponse(Voucher voucher);
}
