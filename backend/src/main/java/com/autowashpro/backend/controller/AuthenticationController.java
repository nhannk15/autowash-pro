package com.autowashpro.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.config.jwt.JwtService;
import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.exception.WrongPasswordException;
import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.dto.ForgotPasswordRequest;
import com.autowashpro.backend.model.dto.LoginRequest;
import com.autowashpro.backend.model.dto.LoginResponse;
import com.autowashpro.backend.model.dto.RegistrationRequest;
import com.autowashpro.backend.model.dto.ResetPasswordRequest;
import com.autowashpro.backend.model.dto.VerifyOtpRequest;
import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.repository.UserRepository;
import com.autowashpro.backend.service.CustomerService;
import com.autowashpro.backend.service.OtpService;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.KeyLengthException;
import com.nimbusds.oauth2.sdk.ParseException;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
public class AuthenticationController {
    @Autowired
    private UserRepository repository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private OtpService otpService;

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response)
            throws KeyLengthException, JOSEException, ParseException {
        User user = repository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Email not found"));

        boolean matched = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());

        if (!matched) {
            throw new WrongPasswordException("Wrong password");
        }
        String token = jwtService.generateToken(user);

        Cookie cookie = new Cookie("access_token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60);
        response.addCookie(cookie);
        return ResponseEntity.ok(new LoginResponse(token, "Bearer", 3600));
    }

    @PostMapping("/auth/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegistrationRequest request) {
        customerService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(201, "Registration successful"));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("access_token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/auth/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        otpService.forgotPassword(request);
        return ResponseEntity.ok(new ApiResponse<>(200, "Mã OTP đã được gửi đến email của bạn!"));
    }

    @PostMapping("/auth/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        otpService.verifyOtp(request);
        return ResponseEntity.ok(new ApiResponse<>(200, "Mã OTP hợp lệ!"));
    }

    @PostMapping("/auth/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        otpService.resetPassword(request);
        return ResponseEntity.ok(new ApiResponse<>(200, "Đặt lại mật khẩu thành công!"));
    }
}
