package com.autowashpro.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.autowashpro.backend.model.entity.TierRule;

public interface TierRuleRepository extends JpaRepository<TierRule, Long> {
}
