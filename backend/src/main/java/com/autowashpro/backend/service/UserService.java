package com.autowashpro.backend.service;

import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.controller.UserController.ChangePasswordRequest;
import com.autowashpro.backend.controller.UserController.CheckPasswordEqualRequest;
import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.exception.WrongPasswordException;
import com.autowashpro.backend.mapper.UserMapper;
import com.autowashpro.backend.model.dto.UserResponse;
import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.repository.UserRepository;

@Service
public class UserService {
    
    private final UserRepository repository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository repository, UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
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

    public HashMap<String, Boolean> checkPasswordEqual(String email, CheckPasswordEqualRequest request) {
        String password = request.password().trim();
        String confirm = request.confirm().trim();
        if (!password.equals(confirm)) {
            throw new WrongPasswordException("Xác nhận mật khẩu không khớp");
        }

        User user = repository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng!"));
        
        String userPassword = user.getPassword();
        if (userPassword == null) {
            throw new RuntimeException("Tài khoản chưa được cập nhật mật khẩu, vui lòng cập nhật mật khẩu.");
        }

        if (!passwordEncoder.matches(password, userPassword)) {
            throw new WrongPasswordException("Mật khẩu không chính xác");
        }

        HashMap<String, Boolean> result = new HashMap<>();
        result.put("valid", true);
        return result;
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        String newPassword = request.newPassword();
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Người dùng không tồn tại"));

        String passwordEncoded = passwordEncoder.encode(newPassword);
        user.setPassword(passwordEncoded);
        repository.save(user);
    }
}
