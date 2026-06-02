package com.autowashpro.backend.service;

import org.springframework.stereotype.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import com.autowashpro.backend.model.entity.PromotionUsage;
import com.autowashpro.backend.repository.PromotionUsageRepository;

@Service
public class PromotionUsageService {
    
    private PromotionUsageRepository repository;

    public PromotionUsageService() {
    }

    @Autowired
    public PromotionUsageService(PromotionUsageRepository repository) {
        this.repository = repository;
    }

    public PromotionUsage createNew(PromotionUsage promotionUsage) {
        return repository.save(promotionUsage);
    }

    public PromotionUsage findById(Long id) {
        return repository.findById(id).get();
    }

    public List<PromotionUsage> findAll() {
        return repository.findAll();
    }

    public PromotionUsage update(PromotionUsage promotionUsage) {
        return repository.save(promotionUsage);
    }

    public void delete(Long id) {
        PromotionUsage promotionUsage = findById(id);
        repository.delete(promotionUsage);
    }

}
