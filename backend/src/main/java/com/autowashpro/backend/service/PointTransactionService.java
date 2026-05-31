package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.entity.PointTransaction;
import com.autowashpro.backend.repository.PointTransactionRepository;

@Service
public class PointTransactionService {
    
    private PointTransactionRepository repository;

    public PointTransactionService() {
    }

    @Autowired
    public PointTransactionService(PointTransactionRepository repository) {
        this.repository = repository;
    }

    public PointTransaction createNew(PointTransaction pointTransaction) {
        return repository.save(pointTransaction);
    }

    public PointTransaction findById(Long id) {
        return repository.findById(id).get();
    }

    public List<PointTransaction> findAll() {
        return repository.findAll();
    }

    public PointTransaction update(PointTransaction pointTransaction) {
        return repository.save(pointTransaction);
    }

    public void delete(Long id) {
        PointTransaction pointTransaction = findById(id);
        repository.delete(pointTransaction);
    }

}
