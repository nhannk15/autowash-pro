package com.autowashpro.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.config.jwt.JwtService;
import com.autowashpro.backend.model.dto.LoginRequest;
import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.repository.UserRepository;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.KeyLengthException;
import com.nimbusds.oauth2.sdk.ParseException;

@RestController
public class AuthenticationController {
    @Autowired
    private UserRepository repository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest loginRequest) throws KeyLengthException, JOSEException, ParseException {
        User user = repository.findByEmail(loginRequest.getEmail()).orElseThrow(() -> new RuntimeException("Email not found"));

        boolean matched = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        
        if (!matched) {
            throw new RuntimeException("Wrong password");
        }

        String token = jwtService.generateToken(user);

        HashMap<String, String> result = new HashMap<>();

        result.put("accessToken", token);

        return ResponseEntity.ok().body(result);
    }
}
