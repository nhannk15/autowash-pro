package com.autowashpro.backend.model.entity;

import java.time.LocalDateTime;

public class Booking {
    private Long id;
    private Long customerId;
    private Long vehicleId;
    private Long serviceId;
    private LocalDateTime scheduledDateTime;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime cancelledAt;
    private String cancelReason;
}
