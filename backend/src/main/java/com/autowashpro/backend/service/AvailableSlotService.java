package com.autowashpro.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autowashpro.backend.exception.VehicleInSlotConflictException;
import com.autowashpro.backend.model.entity.AvailableSlot;
import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.model.entity.Vehicle;
import com.autowashpro.backend.repository.AvailableSlotRepository;
import com.autowashpro.backend.repository.TimeSlotRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AvailableSlotService {

    public final AvailableSlotRepository availableSlotRepository;
    public final TimeSlotRepository timeSlotRepository;

    public AvailableSlotService(AvailableSlotRepository availableSlotRepository,
            TimeSlotRepository timeSlotRepository) {
        this.availableSlotRepository = availableSlotRepository;
        this.timeSlotRepository = timeSlotRepository;
    }

    @Transactional
    public void checkVehicleConflictSlots(Long timeSlotId, Long vehicleId, LocalDate bookingDate) {
        List<AvailableSlot> availableSlots = availableSlotRepository.findByIdAndBookingdate(timeSlotId, bookingDate);
        for (AvailableSlot availableSlot : availableSlots) {
            if (availableSlot.getBooking() != null) {
                Booking booking = availableSlot.getBooking();
                Vehicle vehicle = booking.getVehicle();
                if (vehicle.getId().equals(vehicleId)) {
                    throw new VehicleInSlotConflictException(String.format("Xe %s đã trùng lịch ở %sh, ngày %s",
                                    vehicle.getLicensePlate(), availableSlot.getTimeSlot().getStartTime().getHour(),
                                    availableSlot.getSlotDate().toString()));
                }
            }
        }
    }

}
