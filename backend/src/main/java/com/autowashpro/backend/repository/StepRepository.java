package com.autowashpro.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.autowashpro.backend.model.entity.Step;

@Repository
public interface StepRepository extends JpaRepository<Step, Long> {
    
    List<Step> findByServiceId(Long id);

}
