package com.autowashpro.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.autowashpro.backend.model.entity.WashBay;
import com.autowashpro.backend.model.enums.BayStatus;


public interface WashBayRepository extends JpaRepository<WashBay, Long> {
    List<WashBay> findByStatus(BayStatus status);
}
