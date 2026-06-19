package com.autowashpro.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.autowashpro.backend.model.entity.PromotionUsage;

public interface PromotionUsageRepository extends JpaRepository<PromotionUsage, Long> {
    
}
