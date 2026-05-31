package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.entity.WashSession;
import com.autowashpro.backend.repository.WashSessionRepository;

@Service
public class WashSessionService {

    private WashSessionRepository repository;

    public WashSessionService() {
    }

    @Autowired
    public WashSessionService(WashSessionRepository repository) {
        this.repository = repository;
    }

    public WashSession createNew(@NonNull WashSession washSession) {
        return repository.save(washSession);
    }

    public WashSession findById(@NonNull Long id) {
        return repository.findById(id).get();
    }

    public List<WashSession> findAll() {
        return repository.findAll();
    }

    public WashSession update(@NonNull WashSession washSession) {
        return repository.save(washSession);
    }

    @SuppressWarnings("null")
    public void delete(@NonNull Long id) {
        WashSession session = findById(id);
        repository.delete(session);
    }

}
