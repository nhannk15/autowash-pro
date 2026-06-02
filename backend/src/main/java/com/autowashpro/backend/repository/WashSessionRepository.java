package com.autowashpro.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.autowashpro.backend.model.entity.WashSession;

@Repository
public interface WashSessionRepository extends JpaRepository<WashSession, Long> {
    
}
