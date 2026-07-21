package com.autowashpro.backend.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.mapper.PromotionMapper;
import com.autowashpro.backend.model.dto.CreatePromotionRequest;
import com.autowashpro.backend.model.dto.PromotionResponse;
import com.autowashpro.backend.service.PromotionService;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    private final PromotionService promotionService;
    private final PromotionMapper promotionMapper;

    @Autowired
    public PromotionController(PromotionService promotionService, PromotionMapper promotionMapper) {
        this.promotionService = promotionService;
        this.promotionMapper = promotionMapper;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PromotionResponse>> findAllPromotions() {
        return ResponseEntity.status(HttpStatus.OK).body(promotionService.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionResponse> createPromotion(
            @AuthenticationPrincipal String email,
            @RequestBody CreatePromotionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(promotionService.createPromotion(request, email));
    }

    @PutMapping("/{promotionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionResponse> updatePromotion(
            @AuthenticationPrincipal String email,
            @RequestBody CreatePromotionRequest request,
            @PathVariable Long promotionId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(promotionService.updatePromotion(request, email, promotionId));
    }
    
    @DeleteMapping("/{promotionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromotionResponse> deletePromotion(@PathVariable Long promotionId) {
        return ResponseEntity.status(HttpStatus.OK).body(promotionService.deletePromotion(promotionId));
    }


    public record ApplicablePromotionRequest(LocalDateTime bookingDateTime){}
    @PostMapping("/applicable-promotions")
    public ResponseEntity<PromotionResponse> findApplicablePromotionForUser(@AuthenticationPrincipal String email, @RequestBody ApplicablePromotionRequest request) {
        return ResponseEntity.status(HttpStatus.OK).body(promotionMapper.toPromotionResponse(promotionService.autoFindApplicablePromotion(email, request.bookingDateTime())));
    }
}
