package com.autowashpro.backend.model.dto;

import java.util.List;

import com.autowashpro.backend.model.entity.TimeSlot;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CreateBookingRequest {

    private Long customerId;

    private Long vehicleId;

    private TimeSlot timeSlotId;

    @Size(min = 1)
    private List<Long> servicePriceIds;

    private String notes;

}
