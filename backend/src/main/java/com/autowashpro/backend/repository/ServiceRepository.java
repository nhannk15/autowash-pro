package com.autowashpro.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.autowashpro.backend.model.entity.Service;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
}
