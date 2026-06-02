package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.entity.WashBay;
import com.autowashpro.backend.repository.WashBayRepository;

@Service
public class WashBayService {
    
    private WashBayRepository repository;

    public WashBayService() {
    }

    @org.springframework.beans.factory.annotation.Autowired
    public WashBayService(WashBayRepository repository) {
        this.repository = repository;
    }

    public WashBay createNew(WashBay washBay) {
        return repository.save(washBay);
    }

    public WashBay findById(Long id) {
        return repository.findById(id).get();
    }

    public List<WashBay> findAll() {
        return repository.findAll();
    }

    public WashBay update(WashBay washBay) {
        return repository.save(washBay);
    }

    public void delete(Long id) {
        WashBay washBay = findById(id);
        repository.delete(washBay);
    }

}
