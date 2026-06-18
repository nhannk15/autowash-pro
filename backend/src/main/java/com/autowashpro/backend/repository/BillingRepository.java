package com.autowashpro.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.autowashpro.backend.model.entity.Billing;

public interface BillingRepository extends JpaRepository<Billing, Long> {

    Optional<Billing> findByBookingId(Long bookingId);

}
