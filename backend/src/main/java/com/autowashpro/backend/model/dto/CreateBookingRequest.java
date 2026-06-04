package com.autowashpro.backend.model.dto;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {

    @NotNull
    private Long vehicleId;

    @NotNull
    private LocalDateTime scheduledDateTime;

    @NotNull
    @Size(min = 1)
    private List<Long> servicePriceIds;

    private String notes;

}
