package com.autowashpro.backend.controller;

import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.mapper.NotificationMapper;
import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.dto.NotificationResponse;
import com.autowashpro.backend.model.entity.Notification;
import com.autowashpro.backend.service.NotificationService;

@RestController
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationMapper notificationMapper;

    @Autowired    
    public NotificationController(NotificationService notificationService, NotificationMapper notificationMapper) {
        this.notificationService = notificationService;
        this.notificationMapper = notificationMapper;
    }

    @PostMapping("/api/notifications")
    public ResponseEntity<ApiResponse<Notification>> create(@RequestBody Notification notification) {
        return ResponseEntity.ok(ApiResponse.created(notificationService.createNew(notification)));
    }

    //---

    @GetMapping("/api/notifications")
    public ResponseEntity<List<NotificationResponse>> getNotifications(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok().body(notificationService.getCustomerAllNotifications(email));
    }

    @GetMapping("/api/notifications/unread-count")
    public ResponseEntity<HashMap<String, Integer>> getUnreadNotificationsCount(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok().body(notificationService.getCustomerUnreadNotificationsCount(email));
    }

    @GetMapping("/api/notifications/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok().body(notificationService.getCustomerUnreadNotifications(email));
    }


    @PutMapping("/api/notifications/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markNotificationAsRead(@PathVariable Long notificationId) {
        return ResponseEntity.ok().body(notificationService.markAsRead(notificationId));
    }

    @PutMapping("/api/notifications/read-all")
    public ResponseEntity<List<NotificationResponse>> markAllNotificationsAsRead(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok().body(notificationService.markAllAsRead(email));
    }

}
