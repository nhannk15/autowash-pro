package com.autowashpro.backend.model.entity;

import java.time.LocalDateTime;

public class WashSession {
    private Long id;
    private Long bookingId;
    private Long customerId;
    private Long serviceId;
    private Long staffId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    
}
