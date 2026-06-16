package com.autowashpro.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.autowashpro.backend.model.entity.WashBay;

public interface WashBayRepository extends JpaRepository<WashBay, Long> {

}
