package com.autowashpro.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.autowashpro.backend.model.entity.Voucher;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    
    Optional<Voucher> findByVoucherCode(String voucherCode);


    @Query("""
            SELECT voucher FROM Voucher voucher
            JOIN voucher.customer customer
            WHERE customer.email = :email
            ORDER BY voucher.status ASC, voucher.issuedAt ASC
            """)
    List<Voucher> findCustomerActiveVouchers(@Param("email") String email);

    @Query("""
            SELECT voucher FROM Voucher voucher
            WHERE voucher.expiresAt < :now
            AND voucher.status = com.autowashpro.backend.model.enums.VoucherStatus.ACTIVE
            """)
    List<Voucher> findAllExpiredVoucher(@Param("now") LocalDateTime nowDateTime);
    
}
