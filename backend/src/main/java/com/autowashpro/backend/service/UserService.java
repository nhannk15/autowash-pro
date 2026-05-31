package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.repository.UserRepository;

@Service
public class UserService {
    
    private UserRepository repository;

    public UserService() {
    }

    @org.springframework.beans.factory.annotation.Autowired
    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public User createNew(User user) {
        return repository.save(user);
    }

    public User findById(Long id) {
        return repository.findById(id).get();
    }

    public List<User> findAll() {
        return repository.findAll();
    }

    public User update(User user) {
        return repository.save(user);
    }

    public void delete(Long id) {
        User user = findById(id);
        repository.delete(user);
    }

}
