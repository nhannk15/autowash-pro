package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.entity.Reward;
import com.autowashpro.backend.repository.RewardRepository;

@Service
public class RewardService {
    
    private RewardRepository repository;

    public RewardService() {
    }

    @Autowired
    public RewardService(RewardRepository repository) {
        this.repository = repository;
    }

    public Reward createNew(@NonNull Reward reward) {
        return repository.save(reward);
    }

    public Reward findById(@NonNull Long id) {
        return repository.findById(id).get();
    }

    public List<Reward> findAll() {
        return repository.findAll();
    }

    public Reward update(@NonNull Reward reward) {
        return repository.save(reward);
    }

    @SuppressWarnings("null")
    public void delete(Long id) {
        Reward reward = findById(id);
        repository.delete(reward);
    }

}
