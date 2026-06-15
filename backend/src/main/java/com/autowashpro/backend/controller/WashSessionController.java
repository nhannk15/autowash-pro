package com.autowashpro.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.mapper.WashSessionMapper;
import com.autowashpro.backend.model.dto.StartWashSessionRequest;
import com.autowashpro.backend.model.dto.WashSessionResponse;
import com.autowashpro.backend.service.WashSessionService;

@RestController
public class WashSessionController {

    private final WashSessionService service;
    private final WashSessionMapper mapper;

    @Autowired
    public WashSessionController(WashSessionService service, WashSessionMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping("/api/staff/wash-sessions/start")
    public ResponseEntity<List<WashSessionResponse>> startWashSession(@AuthenticationPrincipal String email, @RequestBody StartWashSessionRequest request) {
        return ResponseEntity.status(HttpStatus.OK).body(service.startWashSession(request.getBookingId(), email));
    }

    @PostMapping("/api/staff/wash-sessions/complete")
    public ResponseEntity<List<WashSessionResponse>> completeWashSession(@AuthenticationPrincipal String email, @RequestBody StartWashSessionRequest request) {
        return ResponseEntity.status(HttpStatus.OK).body(service.completeWashSession(request.getBookingId(), email));
    }

    @PostMapping("/api/staff/wash-sessions/cancel")
    public ResponseEntity<List<WashSessionResponse>> cancelWashSession(@AuthenticationPrincipal String email, @RequestBody StartWashSessionRequest request) {
        return ResponseEntity.status(HttpStatus.OK).body(service.cancleWashSession(request.getBookingId(), email));
    }
}
