package com.autowashpro.backend.model.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class StartWashSessionRequest {
    @NotNull(message = "ID lịch đặt không được là null")
    @Min(value = 1, message = "ID lịch đặt phải lớn hơn 0")
    private Long bookingId;
}
