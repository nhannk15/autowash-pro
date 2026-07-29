package com.autowashpro.backend.mapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.BillingHistoryDTO;
import com.autowashpro.backend.model.dto.BillingResponse;
import com.autowashpro.backend.model.dto.BookingBillingResponse;
import com.autowashpro.backend.model.dto.RecentTransactionItem;
import com.autowashpro.backend.model.dto.RevenueDataResponse;
import com.autowashpro.backend.model.entity.Billing;
import com.autowashpro.backend.model.enums.DepositStatus;
import com.autowashpro.backend.model.enums.PaymentStatus;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, uses = {
        VoucherMapper.class, BookingMapper.class, PromotionMapper.class, CustomerMapper.class })
public interface BillingMapper {

    final String DEPOSIT_PAID = "Thanh toán cọc";
    final String THE_REST_PAID = "Thanh toán nốt";
    final String UNPAID = "Chưa thanh toán cọc";

    void updateBillingFromRequest(Billing source, @MappingTarget Billing target);

    @Mapping(target = "billingId", source = "id")
    @Mapping(target = "billingVoucherResponse", source = "voucher")
    @Mapping(target = "pointsChange", ignore = true)
    @Mapping(target = "bookingPromotionResponse", source = "booking.promotion")
    @Mapping(target = "finalAmount", expression = "java(calculateFinalAmount(billing))")
    BillingResponse toBillingResponse(Billing billing);

    List<BillingResponse> toBillingResponses(List<Billing> billings);

    @Mapping(target = "customer", source = "booking.customer.fullName")
    @Mapping(target = "totalAmount", source = "finalAmount")
    RecentTransactionItem toRecentTransactionItem(Billing billing);


    List<RecentTransactionItem> toRecentTransactionItems(List<Billing> billings);

    @Mapping(target = "day", expression = "java(toDate(billing))")
    @Mapping(target = "revenue", expression = "java(calculateTotalAmount(billing))")
    @Mapping(target = "totalOrders", ignore = true)
    RevenueDataResponse toRevenueDataResponse(Billing billing);

    List<RevenueDataResponse> toRevenueDataResponses(List<Billing> billings);

    
    default BigDecimal calculateTotalAmount(Billing billing) {
        
        PaymentStatus paymentStatus = billing.getPaymentStatus();
        DepositStatus depositStatus = billing.getDepositStatus();
        
        if (paymentStatus.equals(PaymentStatus.PAID)) {
            return billing.getDepositAmount().add(billing.getFinalAmount());
        } else if (paymentStatus.equals(PaymentStatus.PENDING) && depositStatus.equals(DepositStatus.PAID)) {
            return billing.getDepositAmount();
        } else {
            return BigDecimal.ZERO;
        }
    }

    BookingBillingResponse toBookingBillingResponse(Billing billing);

    default LocalDate toDate(Billing billing) {
        LocalDateTime paidAt = billing.getPaidAt();
        LocalDateTime depositPaidAt = billing.getDepositPaidAt();
        if (paidAt != null) {
            return paidAt.toLocalDate();
        } else if (depositPaidAt != null) {
            return depositPaidAt.toLocalDate();
        } else {
            return null;
        }
    }

    default BigDecimal calculateFinalAmount(Billing billing) {
        return billing.getFinalAmount();
    }

    @Mapping(target = "bookingCode", source = "booking.bookingCode")
    @Mapping(target = "customerVehicleDTO", source = "booking.customer")
    @Mapping(target = "transactionType", expression = "java(filterTransactionType(billing))")
    @Mapping(target = "revenue", expression = "java(calculateRevenue(billing))")
    BillingHistoryDTO toBillingHistoryDTO(Billing billing);
    List<BillingHistoryDTO> toBillingHistoryDTOs(List<Billing> billings);

    default String filterTransactionType(Billing billing) {
        DepositStatus depositStatus = billing.getDepositStatus();
        PaymentStatus paymentStatus = billing.getPaymentStatus();
        if (depositStatus.equals(DepositStatus.PENDING)) {
            return UNPAID;
        } else if (depositStatus.equals(DepositStatus.PAID) && paymentStatus.equals(PaymentStatus.PENDING)) {
            return DEPOSIT_PAID;
        } else if (depositStatus.equals(DepositStatus.PAID) && paymentStatus.equals(PaymentStatus.PAID)) {
            return THE_REST_PAID;
        } else {
            return UNPAID;
        }
    }

    default BigDecimal calculateRevenue(Billing billing) {
        DepositStatus depositStatus = billing.getDepositStatus();
        PaymentStatus paymentStatus = billing.getPaymentStatus();
        if (depositStatus.equals(DepositStatus.PENDING)) {
            return BigDecimal.ZERO;
        } else if (depositStatus.equals(DepositStatus.PAID) && paymentStatus.equals(PaymentStatus.PENDING)) {
            return billing.getDepositAmount();
        } else if (depositStatus.equals(DepositStatus.PAID) && paymentStatus.equals(PaymentStatus.PAID)) {
            return billing.getDepositAmount().add(billing.getFinalAmount());
        } else {
            return BigDecimal.ZERO;
        }
    }

}
