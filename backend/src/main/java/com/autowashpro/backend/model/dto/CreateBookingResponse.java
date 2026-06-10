package com.autowashpro.backend.model.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;

import com.autowashpro.backend.model.enums.BookingStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreateBookingResponse {

    private Long id;
    private String customerName;
    private String vehicleLicensePlate;
    private String vehicleTypeName;
    private String bayName;
    private BookingStatus status;
    private String notes;

    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalDate endDate;      
    private LocalTime endTime;
    private int totalDurationMinutes;
    private int slotsOccupied;

    private String promotionName;
    private BigDecimal totalOriginalPrice;
    private BigDecimal totalDiscount;
    private BigDecimal totalFinalPrice;
    private List<BookingDetailResponse> bookingDetails;
    private LocalDateTime createdAt;
}
