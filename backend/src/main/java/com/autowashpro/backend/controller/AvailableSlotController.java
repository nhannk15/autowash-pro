package com.autowashpro.backend.controller;

import java.time.LocalDate;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.service.AvailableSlotService;

@RestController
public class AvailableSlotController {
    
    public final AvailableSlotService availableSlotService;

    public AvailableSlotController(AvailableSlotService availableSlotService) {
        this.availableSlotService = availableSlotService;
    }

    @GetMapping("/api/customer/available-slots/check-consecutive-vehicle")
    public ResponseEntity<String> checkVehicleConflictSlot(@RequestParam("timeSlotId") Long timeSlotId, @RequestParam("vehicleId") Long vehicleId, @RequestParam("bookingDate") LocalDate bookingDate) {
        availableSlotService.checkVehicleConflictSlots(timeSlotId, vehicleId, bookingDate);
        return ResponseEntity.status(HttpStatus.OK).body("Lịch trống, thoải mái");
    }

}
