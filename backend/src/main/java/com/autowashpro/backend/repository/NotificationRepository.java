package com.autowashpro.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.autowashpro.backend.model.entity.Notification;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

     @Query("""
            SELECT 
                notification 
            FROM Notification notification
            WHERE
                notification.customer.id = :customerId
            ORDER BY notification.createdAt DESC
            """)
    List<Notification> findCustomerAllNotifications(@Param("customerId") Long customerId);

    @Query("""
            SELECT 
                notification 
            FROM Notification notification
            WHERE
                notification.customer.id = :customerId
            AND notification.isRead = FALSE
            ORDER BY notification.createdAt DESC
            """)
    List<Notification> findCustomerUnreadNotifications(@Param("customerId") Long customerId);

}
