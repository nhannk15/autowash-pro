package com.autowashpro.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.autowashpro.backend.model.entity.Billing;

public interface BillingRepository extends JpaRepository<Billing, Long> {
    
}
