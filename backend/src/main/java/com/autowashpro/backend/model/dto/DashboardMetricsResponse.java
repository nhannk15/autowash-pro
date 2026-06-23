package com.autowashpro.backend.model.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class DashboardMetricsResponse {

    private LocalDate date;
    private MetricSnapshot revenue;
    private MetricSnapshot sessionCount;
    private MetricSnapshot newCustomers;
    private MetricSnapshot pointsIssued;

}
