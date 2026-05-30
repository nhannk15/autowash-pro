package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.entity.TierRule;
import com.autowashpro.backend.repository.TierRuleRepository;

@Service
public class TierRuleService {
    
    private TierRuleRepository repository;

    public TierRuleService() {
    }

    public TierRuleService(TierRuleRepository repository) {
        this.repository = repository;
    }

    public TierRule createNew(TierRule tierRule) {
        return repository.save(tierRule);
    }

    public TierRule findById(Long id) {
        return repository.findById(id).get();
    }

    public List<TierRule> findAll() {
        return repository.findAll();
    }

    public TierRule update(TierRule tierRule) {
        return repository.save(tierRule);
    }

    public void delete(Long id) {
        TierRule tierRule = findById(id);
        repository.delete(tierRule);
    }

}
