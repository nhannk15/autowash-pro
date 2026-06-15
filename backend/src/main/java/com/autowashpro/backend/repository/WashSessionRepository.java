package com.autowashpro.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.autowashpro.backend.model.entity.WashSession;

public interface WashSessionRepository extends JpaRepository<WashSession, Long> {
    
    List<WashSession> findByBookingId(Long id);

}
