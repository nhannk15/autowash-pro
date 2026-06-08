package com.autowashpro.backend.repository;

import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.autowashpro.backend.model.entity.AvailableSlot;

@Repository
public interface AvailableSlotRepository extends JpaRepository<AvailableSlot, Long> {
    boolean existsBySlotDate(LocalDate slotDate);
}
