package com.autowashpro.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.autowashpro.backend.model.entity.WashBay;

@Repository
public interface WashBayRepository extends JpaRepository<WashBay, Long> {
    
}
