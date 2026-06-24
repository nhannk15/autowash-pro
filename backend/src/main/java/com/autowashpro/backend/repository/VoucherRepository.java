package com.autowashpro.backend.repository;

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
            WHERE voucher.status = com.autowashpro.backend.model.enums.VoucherStatus.ACTIVE
            AND customer.email = :email
            """)
    List<Voucher> findCustomerActiveVouchers(@Param("email") String email);
    
}
