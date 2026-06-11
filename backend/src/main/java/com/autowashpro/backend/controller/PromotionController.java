package com.autowashpro.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.model.dto.CreatePromotionRequest;
import com.autowashpro.backend.model.dto.PromotionResponse;
import com.autowashpro.backend.service.PromotionService;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    private final PromotionService promotionService;

    @Autowired
    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping
    public ResponseEntity<List<PromotionResponse>> findAllPromotions() {
        return ResponseEntity.status(HttpStatus.OK).body(promotionService.findAll());
    }

    @PostMapping
    public ResponseEntity<PromotionResponse> createPromotion(@RequestBody CreatePromotionRequest request) {
        Long staffId = 2L;
        return ResponseEntity.status(HttpStatus.CREATED).body(promotionService.createPromotion(request, staffId));
    }

    @PutMapping("/{promotionId}")
    public ResponseEntity<PromotionResponse> updatePromotion(@RequestBody CreatePromotionRequest request,
            @PathVariable Long promotionId) {
        Long staffId = 2L;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(promotionService.updatePromotion(request, staffId, promotionId));
    }
    
    @DeleteMapping("/{promotionId}")
    public ResponseEntity<PromotionResponse> deletePromotion(@PathVariable Long promotionId) {
        return ResponseEntity.status(HttpStatus.OK).body(promotionService.deletePromotion(promotionId));
    }
}
