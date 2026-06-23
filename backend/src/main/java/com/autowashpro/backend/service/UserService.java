package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.mapper.UserMapper;
import com.autowashpro.backend.model.dto.UserResponse;
import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.repository.UserRepository;

@Service
public class UserService {
    
    private final UserRepository repository;
    private final UserMapper userMapper;

    @Autowired
    public UserService(UserRepository repository, UserMapper userMapper) {
        this.repository = repository;
        this.userMapper = userMapper;
    }

    public UserResponse getMyInfo(String email) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tim thấy người dùng với email: " + email));
        return userMapper.toUserResponse(user);
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

    public User findByEmail(String email) {
        return repository.findByEmail(email).orElse(null);
    }

    public User update(User user) {
        return repository.save(user);
    }

    public void delete(Long id) {
        User user = findById(id);
        repository.delete(user);
    }

}
