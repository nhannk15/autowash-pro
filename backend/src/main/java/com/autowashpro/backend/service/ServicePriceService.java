package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.entity.ServicePrice;
import com.autowashpro.backend.repository.ServicePriceRepository;

@Service
public class ServicePriceService {

    private ServicePriceRepository repository;

    public ServicePriceService() {
    }

    @Autowired
    public ServicePriceService(ServicePriceRepository repository) {
        this.repository = repository;
    }

    public ServicePrice createNew(@NonNull ServicePrice servicePrice) {
        return repository.save(servicePrice);
    }

    public ServicePrice findById(@NonNull Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("ServicePrice not found with id: " + id));
    }

    public List<ServicePrice> findAll() {
        return repository.findAll();
    }

    public ServicePrice update(@NonNull ServicePrice servicePrice) {
        return repository.save(servicePrice);
    }

    public void delete(@NonNull Long id) {
        ServicePrice servicePrice = findById(id);
        repository.delete(servicePrice);
    }
}
