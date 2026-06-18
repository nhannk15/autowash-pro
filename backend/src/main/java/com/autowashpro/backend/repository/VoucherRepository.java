package com.autowashpro.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.autowashpro.backend.model.entity.Voucher;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    
    Optional<Voucher> findByVoucherCode(String voucherCode);
    
}
