package com.autowashpro.backend.controller;

import java.util.HashMap;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HomeController {
    
    @GetMapping("/access-token")
    public ResponseEntity<?> generateToken(@RequestParam String token) {
        return ResponseEntity.ok().body(token);
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        HashMap<String, String> test = new HashMap<>();
        test.put("message", "Hello World!");
        return ResponseEntity.ok().body(test);
    }

}
