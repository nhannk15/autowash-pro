package com.autowashpro.backend.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.autowashpro.backend.model.entity.PointTransaction;

public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {

    @Query("""
            SELECT pointTransaction FROM PointTransaction pointTransaction
            WHERE pointTransaction.transactionType IN (com.autowashpro.backend.model.enums.TransactionType.EARN, com.autowashpro.backend.model.enums.TransactionType.BONUS)
            AND pointTransaction.expiryDate <= :today
            """)
    List<PointTransaction> getExpiredAndEarnPointTransactions(@Param("today") LocalDate today);

    @Query("""
            SELECT SUM(pointTransaction.pointsChange) FROM PointTransaction pointTransaction
            JOIN pointTransaction.customer customer
            WHERE pointTransaction.transactionType IN (com.autowashpro.backend.model.enums.TransactionType.EARN, com.autowashpro.backend.model.enums.TransactionType.BONUS)
            AND customer.id = :customerId 
            AND pointTransaction.createdAt >= customer.lastReviewDate 
            GROUP BY customer.id
            """)
    Long calculateTotalPointsEarned(@Param("customerId") Long customerId);

    @Query("""
            SELECT SUM(pointTransaction.pointsChange) FROM PointTransaction pointTransaction
            WHERE pointTransaction.transactionType IN (com.autowashpro.backend.model.enums.TransactionType.EARN, com.autowashpro.backend.model.enums.TransactionType.BONUS)
            AND pointTransaction.createdAt = :date
            """)
    Long sumPointsIssuedByDate(@Param("date") LocalDateTime date);
    List<PointTransaction> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

}
