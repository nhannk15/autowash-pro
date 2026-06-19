package com.autowashpro.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.autowashpro.backend.model.entity.Reward;

@Repository
public interface RewardRepository extends JpaRepository<Reward, Long> {

    List<Reward> findByActiveTrue();
}
