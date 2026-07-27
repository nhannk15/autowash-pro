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
            AND staff.role = com.autowashpro.backend.model.enums.Role.WASH_STAFF
            AND staff.isActive = true
            """)
    List<Staff> findAvailableStaff(Long timeSlotId, LocalDate bookingDate);

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
            AND staff.role = com.autowashpro.backend.model.enums.Role.WASH_STAFF
            """)
    List<Staff> findUnOccupiedStaffInTheCurrent(Long timeSlotId, LocalDate bookingDate);

    @Query(value = """
            SELECT 
                staff.id,
                COUNT(availableSlot.id) AS total_slot
            FROM staff staff
            LEFT JOIN wash_sessions washSession ON staff.id = washSession.staff_id
            LEFT JOIN bookings booking ON washSession.booking_id = booking.id
            LEFT JOIN available_slot availableSlot ON
                booking.id = availableSlot.booking_id
                AND availableSlot.date = :bookingDate
            LEFT JOIN users user ON user.id = staff.id
            WHERE user.role = 'WASH_STAFF' AND staff.is_occupied = false
            GROUP BY staff.id
            HAVING total_slot = (
                SELECT 
                    COUNT(availableSlot.id) AS total_slot
                FROM staff
                LEFT JOIN wash_sessions washSession ON staff.id = washSession.staff_id
                LEFT JOIN bookings booking ON washSession.booking_id = booking.id
                LEFT JOIN available_slot availableSlot 
                    ON booking.id = availableSlot.booking_id
                    AND availableSlot.date = :bookingDate
                LEFT JOIN users user ON user.id = staff.id
                GROUP BY staff.id
                LIMIT 1
            )
            """, nativeQuery = true)
    List<Object[]> findLeastJobsStaff(@Param("bookingDate") LocalDate bookingDate);
}
