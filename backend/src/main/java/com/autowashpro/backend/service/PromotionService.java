package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.entity.Promotion;
import com.autowashpro.backend.repository.PromotionRepository;

@Service
public class PromotionService {
    
    private PromotionRepository repository;

    public PromotionService() {
    }

    @Autowired
    public PromotionService(PromotionRepository repository) {
        this.repository = repository;
    }

    public Promotion createNew(Promotion promotion) {
        return repository.save(promotion);
    }

    public Promotion findById(Long id) {
        return repository.findById(id).get();
    }

    public List<Promotion> findAll() {
        return repository.findAll();
    }

    public Promotion update(Promotion promotion) {
        return repository.save(promotion);
    }

    public void delete(Long id) {
        Promotion promotion = findById(id);
        repository.delete(promotion);
    }

}
