package com.autowashpro.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.model.dto.BookingResponse;
import com.autowashpro.backend.model.dto.CreateBookingRequest;
import com.autowashpro.backend.model.dto.CreateBookingResponse;
import com.autowashpro.backend.model.dto.SlotAvailabilityByDateResponse;
import com.autowashpro.backend.model.dto.UpcomingBookingResponse;
import com.autowashpro.backend.service.BookingService;

@RestController
public class BookingController {

    private final BookingService bookingService;

    @Autowired
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/api/bookings/available-slots")
    public ResponseEntity<SlotAvailabilityByDateResponse> getAvailableSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.status(HttpStatus.OK).body(bookingService.getAvailableTimeSlots(date));
    }

    @PostMapping("/api/bookings")
    public ResponseEntity<CreateBookingResponse> createBooking(@RequestBody CreateBookingRequest request) {
        System.out.println("Request: " + request);
        System.out.println("customerId: " + request.getCustomerId());
        CreateBookingResponse response = bookingService.createBooking(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/staff/upcoming-bookings")
    public ResponseEntity<List<UpcomingBookingResponse>> getUpcomingBookings() {
        return ResponseEntity.status(HttpStatus.OK).body(bookingService.getUpcomingBookings());
    }

    @GetMapping("/api/bookings/booking-code")
    public ResponseEntity<BookingResponse> findBookingByBookingCode(@RequestParam String bookingCode, @AuthenticationPrincipal String email) {
        return ResponseEntity.status(HttpStatus.OK).body(bookingService.getBookingByBookingCode(email, bookingCode));
    }

    @GetMapping("/api/staff/today-bookings")
    public ResponseEntity<List<BookingResponse>> getTodayBookings() {
        return ResponseEntity.status(HttpStatus.OK).body(bookingService.getTodayBookings());
    }

    @GetMapping("/api/customer/upcoming-bookings")
    public ResponseEntity<List<BookingResponse>> getCustomerUpcomingBookings(@AuthenticationPrincipal String email) {
        return ResponseEntity.status(HttpStatus.OK).body(bookingService.getCustomerUpcomingBookings(email));
    }

    @GetMapping("/api/customer/all-bookings")
    public ResponseEntity<List<BookingResponse>> getCustomerAllBookings(@AuthenticationPrincipal String email) {
        return ResponseEntity.status(HttpStatus.OK).body(bookingService.getCustomerAllBookings(email));
    }

}
