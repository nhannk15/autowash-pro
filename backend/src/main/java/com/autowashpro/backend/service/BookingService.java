package com.autowashpro.backend.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.model.dto.CreateBookingRequest;
import com.autowashpro.backend.model.dto.CreateBookingResponse;
import com.autowashpro.backend.model.dto.SlotAvailabilityByDateResponse;
import com.autowashpro.backend.model.dto.TimeSlotAvailabilityResponse;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.repository.AvailableSlotRepository;
import com.autowashpro.backend.repository.CustomerRepository;

@Service
public class BookingService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AvailableSlotRepository availableSlotRepository;

    public SlotAvailabilityByDateResponse getAvailableTimeSlots(LocalDate date) {
        List<TimeSlotAvailabilityResponse> timeSlots = getAvailableTimeSlot(date);
        return SlotAvailabilityByDateResponse
                .builder()
                .date(date)
                .timeSlotAvailabilityResponses(timeSlots)
                .build();
    }

    public List<TimeSlotAvailabilityResponse> getAvailableTimeSlot(LocalDate date) {
        return availableSlotRepository.findTimeSlotAvailability(date)
                .stream()
                .map(row -> TimeSlotAvailabilityResponse
                        .builder()
                        .timeSlotId((Long) row[0])
                        .startTime((LocalTime) row[1])
                        .endTime((LocalTime) row[2])
                        .totalBayCount(((Number) row[3]).intValue())
                        .availableBayCount(((Number) row[4]).intValue())
                        .isAvailable(((Number) row[4]).intValue() > 0)
                        .build())
                .toList();
    }

    private CreateBookingResponse createBooking(CreateBookingRequest createBookingRequest) {
        Customer customer = customerRepository.findById(createBookingRequest.getCustomerId())
                .orElseThrow(() -> new UserNotFoundException("Customer not found!"));

        int bookingWindowDays = customer.getTier().getBookingWindowDays();
        LocalDate now = LocalDate.now();
        return null;
    }

}
