package com.autowashpro.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.autowashpro.backend.model.entity.Highlight;

public interface HightlightRepository extends JpaRepository<Highlight, Long> {
 
    List<Highlight> findByServiceId(Long id);

}
