package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.entity.Billing;
import com.autowashpro.backend.repository.BillingRepository;

@Service
public class BillingService {
    
    private BillingRepository repository;

    public BillingService() {
    }

    @Autowired
    public BillingService(BillingRepository repository) {
        this.repository = repository;
    }

    public Billing createNew(@NonNull Billing billing) {
        return repository.save(billing);
    }

    public Billing findById(@NonNull Long id) {
        return repository.findById(id).get();
    }

    public List<Billing> findAll() {
        return repository.findAll();
    }

    public Billing update(@NonNull Billing billing) {
        return repository.save(billing);
    }

    @SuppressWarnings("null")
    public void delete(Long id) {
        Billing billing = findById(id);
        repository.delete(billing);
    }
}
