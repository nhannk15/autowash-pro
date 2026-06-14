package com.autowashpro.backend.model.dto;

import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class TimeSlotAvailabilityResponse {

    private Long timeSlotId;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean isAvailable;
    private int availableBayCount;
    private int totalBayCount;

}
