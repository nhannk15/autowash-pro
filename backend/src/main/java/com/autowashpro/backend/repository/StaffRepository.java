package com.autowashpro.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.autowashpro.backend.model.entity.Staff;

public interface StaffRepository extends JpaRepository<Staff, Long> {

    Optional<Staff> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    @Query("""
            SELECT s FROM Staff s
            WHERE (:search IS NULL OR :search = ''
                   OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                   OR s.phoneNumber LIKE CONCAT('%', :search, '%'))
            """)
    Page<Staff> searchStaffs(@Param("search") String search, Pageable pageable);

    @Query("""
            SELECT staff FROM Staff staff
            WHERE staff.id NOT IN (
                SELECT staff2.id FROM Booking booking
                JOIN booking.availableSlots availableSlot
                JOIN booking.washSessions washSession
                JOIN washSession.staff staff2
                WHERE availableSlot.timeSlot.id = :timeSlotId AND
                    availableSlot.slotDate = :bookingDate
            )
            AND staff.role IN (com.autowashpro.backend.model.enums.Role.STAFF,
                               com.autowashpro.backend.model.enums.Role.WASH_STAFF)

            """)
    List<Staff> findAvailableStaff(Long timeSlotId, LocalDate bookingDate);
}
