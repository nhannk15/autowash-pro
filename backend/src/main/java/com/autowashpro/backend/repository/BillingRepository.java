package com.autowashpro.backend.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.autowashpro.backend.model.entity.Billing;

public interface BillingRepository extends JpaRepository<Billing, Long> {

    Optional<Billing> findByBookingId(Long bookingId);

    default BigDecimal sumRevenueByDate(LocalDate date) {
        return sumRevenueByPaidDateRange(date.atStartOfDay(), date.plusDays(1).atStartOfDay());
    }

    @Query("""
            SELECT SUM(billing.finalAmount) FROM Billing billing
            WHERE billing.paymentStatus = com.autowashpro.backend.model.enums.PaymentStatus.PAID
            AND billing.paidAt >= :startOfDay
            AND billing.paidAt < :nextDay
            """)
    BigDecimal sumRevenueByPaidDateRange(@Param("startOfDay") LocalDateTime startOfDay,
            @Param("nextDay") LocalDateTime nextDay);

    @Query("""
            SELECT SUM(billing.finalAmount) FROM Billing billing
            WHERE billing.paymentStatus = com.autowashpro.backend.model.enums.PaymentStatus.PAID
            """)
    BigDecimal sumRevenue();

    @Query("""
            SELECT billing FROM Billing billing
            WHERE billing.paymentStatus = com.autowashpro.backend.model.enums.PaymentStatus.PAID
            ORDER BY billing.paidAt
            """)
    List<Billing> getRecentTransactions();
    
}
