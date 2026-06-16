package com.autowashpro.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.autowashpro.backend.model.entity.Voucher;

public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    
}
