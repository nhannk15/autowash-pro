package com.autowashpro.backend.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.autowashpro.backend.model.entity.OtpToken;

public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {

    // Tìm OTP còn hạn và chưa sử dụng theo email
    Optional<OtpToken> findByEmailAndUsedFalseAndExpiredAtAfter(String email, LocalDateTime now);

    // Tìm OTP theo email và mã OTP (chưa dùng, còn hạn)
    Optional<OtpToken> findByEmailAndOtpAndUsedFalseAndExpiredAtAfter(String email, String otp, LocalDateTime now);

    // Xóa tất cả OTP đã hết hạn hoặc đã dùng theo email
    void deleteByEmail(String email);

    // Xóa tất cả OTP đã hết hạn
    void deleteByExpiredAtBefore(LocalDateTime now);
}
