package com.autowashpro.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.autowashpro.backend.model.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
}
