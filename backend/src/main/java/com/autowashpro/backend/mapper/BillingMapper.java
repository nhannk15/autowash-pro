package com.autowashpro.backend.mapper;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.BillingResponse;
import com.autowashpro.backend.model.dto.BookingBillingResponse;
import com.autowashpro.backend.model.dto.RecentTransactionItem;
import com.autowashpro.backend.model.dto.RevenueDataResponse;
import com.autowashpro.backend.model.entity.Billing;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, uses = {
        VoucherMapper.class, BookingMapper.class, PromotionMapper.class })
public interface BillingMapper {
    void updateBillingFromRequest(Billing source, @MappingTarget Billing target);

    @Mapping(target = "billingId", source = "id")
    @Mapping(target = "billingVoucherResponse", source = "voucher")
    @Mapping(target = "pointsChange", ignore = true)
    @Mapping(target = "bookingPromotionResponse", source = "booking.promotion")
    BillingResponse toBillingResponse(Billing billing);

    List<BillingResponse> toBillingResponses(List<Billing> billings);

    @Mapping(target = "customer", source = "booking.customer.fullName")
    @Mapping(target = "totalAmount", source = "finalAmount")
    RecentTransactionItem toRecentTransactionItem(Billing billing);

    List<RecentTransactionItem> toRecentTransactionItems(List<Billing> billings);

    @Mapping(target = "day", source = "paidAt", qualifiedByName = "toDate")
    @Mapping(target = "revenue", source = "finalAmount")
    @Mapping(target = "totalOrders", ignore = true)
    RevenueDataResponse toRevenueDataResponse(Billing billing);

    List<RevenueDataResponse> toRevenueDataResponses(List<Billing> billings);

    BookingBillingResponse toBookingBillingResponse(Billing billing);

    @Named("toDate")
    default LocalDate toDate(LocalDateTime paidAt) {
        return paidAt.toLocalDate();
    }

}
