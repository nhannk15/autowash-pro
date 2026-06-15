package com.autowashpro.backend.model.dto;

import com.autowashpro.backend.model.enums.BayStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class WashBayResponse {
    private Long id;
    private String name;
    private BayStatus status;
    private CurrentSessionResponse currentSession;
}
