package com.autowashpro.backend.model.dto;

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
public class DashboardSummaryResponse {
    
    private Long totalRevenue;;
    private Long previousRevenue;
    private int totalBookings;
    private int completedBookings;
    private int cancelledBookings;
    private int newCustomers;
    private int activeBays;
    private int totalBays;

}
