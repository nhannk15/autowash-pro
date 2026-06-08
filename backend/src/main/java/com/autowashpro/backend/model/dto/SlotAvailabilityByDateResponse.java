package com.autowashpro.backend.model.dto;

import java.time.LocalDate;
import java.util.List;

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
public class SlotAvailabilityByDateResponse {

    private LocalDate date;
    private List<TimeSlotAvailabilityResponse> timeSlotAvailabilityResponses;
    
}
