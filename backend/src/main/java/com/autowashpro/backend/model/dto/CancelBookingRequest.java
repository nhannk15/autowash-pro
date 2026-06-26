package com.autowashpro.backend.model.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CancelBookingRequest {
    
    @NotNull(message = "Mã đặt lịch không được để trống")
    @NotEmpty(message = "Mã đặt lịch không được để trống")
    private String bookingCode;

    @NotNull(message = "Lí do hủy không được để trống")
    @NotEmpty(message = "Lí do hủy không được để trống")
    private String cancelReason;

}
