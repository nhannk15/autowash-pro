package com.autowashpro.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.autowashpro.backend.model.entity.BookingDetail;

public interface BookingDetailRepository extends JpaRepository<BookingDetail, Long> {
}
