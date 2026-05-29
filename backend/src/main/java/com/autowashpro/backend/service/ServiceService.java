package com.autowashpro.backend.service;

import java.util.List;

import com.autowashpro.backend.model.entity.Service;
import com.autowashpro.backend.repository.ServiceRepository;

@org.springframework.stereotype.Service
public class ServiceService {
    
    private ServiceRepository repository;

    public ServiceService() {
    }

    public ServiceService(ServiceRepository repository) {
        this.repository = repository;
    }

    public Service createNew(Service service) {
        return repository.save(service);
    }

    public Service findById(Long id) {
        return repository.findById(id).get();
    }

    public List<Service> findAll() {
        return repository.findAll();
    }

    public Service update(Service service) {
        return repository.save(service);
    }

    public void delete(Long id) {
        Service service = findById(id);
        repository.delete(service);
    }

}
