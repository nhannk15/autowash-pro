package com.autowashpro.backend.model.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.autowashpro.backend.model.enums.WashSessionStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class WashSessionResponse {
    private Long id;
    private Long bookingId;
    private Long customerId;
    private String customerFullName;
    private VehicleResponse vehicleResponse;
    private String servicePriceId;
    private String serviceName;
    private Long staffId;
    private String createdByStaff;
    private LocalDate scheduledDate;
    private LocalTime scheduledStartTime;
    private LocalTime scheduledEndTime;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private WashSessionStatus washSessionStatus;
    private String washBay;
    private LocalDateTime createdAt;
}
