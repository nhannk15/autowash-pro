package com.autowashpro.backend.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.autowashpro.backend.model.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByPhoneNumber(String phoneNumber);

    boolean existsByPhoneNumber(String phoneNumber);

    @Query("""
            SELECT c FROM Customer c
            WHERE (:search IS NULL OR :search = ''
                   OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR c.phoneNumber LIKE CONCAT('%', :search, '%'))
            AND (:tierId IS NULL OR c.tier.id = :tierId)
            """)
    Page<Customer> searchCustomers(@Param("search") String search,
            @Param("tierId") Long tierId,
            Pageable pageable);

    default Long countByCreatedAtDate(LocalDate date) {
        return countByCreatedAtRange(date.atStartOfDay(), date.plusDays(1).atStartOfDay());
    }

    @Query("""
            SELECT COUNT(customer) FROM Customer customer
            WHERE customer.createdAt >= :startOfDay
            AND customer.createdAt < :nextDay
            """)
    Long countByCreatedAtRange(@Param("startOfDay") LocalDateTime startOfDay,
            @Param("nextDay") LocalDateTime nextDay);

    @Query("""
            SELECT COUNT(customer)
            FROM Customer customer
            WHERE customer.createdAt >= :startTime
            AND customer.createdAt <= :endTime
            """)
    int countNewCustomersBetween(@Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
}
