package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.entity.Notification;
import com.autowashpro.backend.repository.NotificationRepository;

@Service
public class NotificationService {
    
    private NotificationRepository repository;

    public NotificationService() {
    }

    @org.springframework.beans.factory.annotation.Autowired
    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    public Notification createNew(Notification notification) {
        return repository.save(notification);
    }

    public Notification findById(Long id) {
        return repository.findById(id).get();
    }

    public List<Notification> findAll() {
        return repository.findAll();
    }

    public Notification update(Notification notification) {
        return repository.save(notification);
    }

    public void delete(Long id) {
        Notification notification = findById(id);
        repository.delete(notification);
    }

}
