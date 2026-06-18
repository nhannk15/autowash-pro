package com.autowashpro.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.autowashpro.backend.model.entity.TimeSlot;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, Long> {

}
