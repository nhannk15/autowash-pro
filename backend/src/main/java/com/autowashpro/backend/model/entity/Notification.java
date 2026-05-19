package com.autowashpro.backend.model.entity;

import java.time.LocalDateTime;

public class Notification {
    private Long id;
    private Long customerId;
    private String notificationType;
    private String title;
    private String body;
    private Long refId;
    private String refType;
    private boolean isRead;
    private LocalDateTime createdAt;
}
