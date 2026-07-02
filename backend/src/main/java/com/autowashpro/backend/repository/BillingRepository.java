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
            SELECT SUM(billing.finalAmount + billing.depositAmount) FROM Billing billing
            WHERE
                (billing.paymentStatus = com.autowashpro.backend.model.enums.PaymentStatus.PAID
                    AND billing.paidAt >= :startOfDay
                    AND billing.paidAt < :nextDay)
            OR (billing.depositStatus = com.autowashpro.backend.model.enums.DepositStatus.PAID
                AND billing.depositPaidAt >= :startTime AND billing.depositPaidAt <= :endTime)
            """)
    BigDecimal sumRevenueByPaidDateRange(@Param("startOfDay") LocalDateTime startOfDay,
            @Param("nextDay") LocalDateTime nextDay);

    @Query("""
            SELECT SUM(billing.finalAmount + billing.depositAmount) FROM Billing billing
            WHERE
                billing.paymentStatus = com.autowashpro.backend.model.enums.PaymentStatus.PAID
            OR billing.depositStatus = com.autowashpro.backend.model.enums.DepositStatus.PAID
            """)
    BigDecimal sumRevenue();

    @Query("""
            SELECT billing FROM Billing billing
            WHERE
                billing.paymentStatus = com.autowashpro.backend.model.enums.PaymentStatus.PAID
            OR billing.depositStatus = com.autowashpro.backend.model.enums.DepositStatus.PAID
            ORDER BY billing.paidAt
            """)
    List<Billing> getRecentTransactions();

    @Query("""
            SELECT billing FROM Billing billing
            WHERE
                (billing.paymentStatus = com.autowashpro.backend.model.enums.PaymentStatus.PAID
                    AND billing.paidAt >= :startTime AND billing.paidAt <= :endTime)
            OR (billing.paymentStatus != com.autowashpro.backend.model.enums.PaymentStatus.PAID
                AND billing.depositStatus = com.autowashpro.backend.model.enums.DepositStatus.PAID
                AND billing.depositPaidAt >= :startTime AND billing.depositPaidAt <= :endTime)
            """)
    List<Billing> findBillingsByStartDateAndEndDate(@Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    @Query("""
            SELECT billing FROM Billing billing
            WHERE
                billing.paymentStatus = com.autowashpro.backend.model.enums.PaymentStatus.PAID
            OR billing.depositStatus = com.autowashpro.backend.model.enums.DepositStatus.PAID
            """)
    List<Billing> findAllPaidBillings();

    @Query("""
            SELECT billing FROM Billing billing
            WHERE
                billing.paymentStatus = com.autowashpro.backend.model.enums.PaymentStatus.PAID
            OR billing.depositStatus = com.autowashpro.backend.model.enums.DepositStatus.PAID
            """)
    List<Billing> findByOneDateOnly(LocalDateTime startTime, LocalDateTime endTime);

    @Query("""
            SELECT billing FROM Billing billing
            WHERE
                billing.paymentStatus = com.autowashpro.backend.model.enums.PaymentStatus.PENDING
            AND billing.depositStatus = com.autowashpro.backend.model.enums.DepositStatus.PENDING
            """)
    List<Billing> findDepositUnpaidBillings();

    @Query(value = """
            SELECT * FROM billings b
            WHERE b.payment_status = 'PENDING'
            AND b.deposit_status = 'PENDING'
            ORDER BY COALESCE(b.paid_at, b.deposit_paid_at)
            LIMIT 1
            """, nativeQuery = true)
    Optional<Billing> findMinBilling();

}
