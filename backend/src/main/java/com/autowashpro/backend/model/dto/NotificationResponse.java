package com.autowashpro.backend.model.dto;

import java.time.LocalDateTime;

import com.autowashpro.backend.model.enums.NotificationType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class NotificationResponse {
    private Long id;
    private NotificationType notificationType;
    private String title;
    private String body;
    private Long refId;
    private String refType;
    private boolean isRead;
    private LocalDateTime createdAt;
}
