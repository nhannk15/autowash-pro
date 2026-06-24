package com.autowashpro.backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.BillingResponse;
import com.autowashpro.backend.model.dto.RecentTransactionItem;
import com.autowashpro.backend.model.entity.Billing;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, uses = {VoucherMapper.class, BookingMapper.class})
public interface BillingMapper {
    void updateBillingFromRequest(Billing source, @MappingTarget Billing target);

    @Mapping(target = "billingId", source = "id")
    @Mapping(target = "billingVoucherResponse", source = "voucher")
    @Mapping(target = "pointsChange", ignore = true)
    BillingResponse toBillingResponse(Billing billing);

    List<BillingResponse> toBillingResponses(List<Billing> billings);

    @Mapping(target = "customer", source = "booking.customer.fullName")
    @Mapping(target = "totalAmount", source = "finalAmount")
    RecentTransactionItem toRecentTransactionItem(Billing billing);
    List<RecentTransactionItem> toRecentTransactionItems(List<Billing> billings);

    
}
