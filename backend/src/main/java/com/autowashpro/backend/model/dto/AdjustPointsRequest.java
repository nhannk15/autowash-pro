package com.autowashpro.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AdjustPointsRequest {

    @NotNull(message = "Số điểm thay đổi không được để trống")
    private Long pointsChange;

    @NotBlank(message = "Lý do điều chỉnh không được để trống")
    private String reason;
}
