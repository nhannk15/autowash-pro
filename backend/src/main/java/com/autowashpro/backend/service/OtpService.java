package com.autowashpro.backend.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.model.dto.ForgotPasswordRequest;
import com.autowashpro.backend.model.dto.ResetPasswordRequest;
import com.autowashpro.backend.model.dto.VerifyOtpRequest;
import com.autowashpro.backend.model.entity.OtpToken;
import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.repository.OtpTokenRepository;
import com.autowashpro.backend.repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Slf4j
public class OtpService {

    private static final int OTP_EXPIRY_MINUTES = 10;

    private final OtpTokenRepository otpTokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public OtpService(OtpTokenRepository otpTokenRepository, UserRepository userRepository, EmailService emailService,
            PasswordEncoder passwordEncoder) {
        this.otpTokenRepository = otpTokenRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Xử lý yêu cầu quên mật khẩu:
     * - Nếu OTP cũ còn hạn và chưa dùng → gửi lại OTP cũ
     * - Nếu không có hoặc đã hết hạn → tạo OTP mới
     */
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail();

        // Kiểm tra email tồn tại trong hệ thống
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Email không tồn tại trong hệ thống!"));

        // Kiểm tra user có password không (tài khoản OAuth2 thuần không cần reset)
        if (user.getPassword() == null) {
            throw new IllegalArgumentException(
                    "Tài khoản này đăng nhập bằng Google. Vui lòng đăng nhập bằng Google!");
        }

        // Kiểm tra OTP cũ còn hạn và chưa dùng
        Optional<OtpToken> existingOtp = otpTokenRepository
                .findByEmailAndUsedFalseAndExpiredAtAfter(email, LocalDateTime.now());

        if (existingOtp.isPresent()) {
            // OTP cũ còn hạn → gửi lại OTP cũ
            OtpToken otpToken = existingOtp.get();
            emailService.sendOtpEmail(email, otpToken.getOtp());
            log.info("Resent existing OTP to: {}", email);
        } else {
            // Xóa OTP cũ (đã hết hạn hoặc đã dùng) và tạo OTP mới
            otpTokenRepository.deleteByEmail(email);

            String otp = generateOtp();
            OtpToken otpToken = new OtpToken();
            otpToken.setEmail(email);
            otpToken.setOtp(otp);
            otpToken.setExpiredAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
            otpTokenRepository.save(otpToken);

            emailService.sendOtpEmail(email, otp);
            log.info("Created and sent new OTP to: {}", email);
        }
    }

    /**
     * Xác minh mã OTP (dùng cho bước trung gian nếu frontend cần kiểm tra trước khi
     * cho nhập mật khẩu mới).
     */
    public void verifyOtp(VerifyOtpRequest request) {
        otpTokenRepository
                .findByEmailAndOtpAndUsedFalseAndExpiredAtAfter(
                        request.getEmail(), request.getOtp(), LocalDateTime.now())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Mã OTP không hợp lệ hoặc đã hết hạn!"));
    }

    /**
     * Đặt lại mật khẩu:
     * - Xác minh OTP lần cuối
     * - Kiểm tra mật khẩu mới khớp
     * - Cập nhật mật khẩu
     * - Đánh dấu OTP đã dùng và xóa khỏi DB
     */
    public void resetPassword(ResetPasswordRequest request) {
        // Kiểm tra mật khẩu mới khớp
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu xác nhận không khớp!");
        }

        // Xác minh OTP
        OtpToken otpToken = otpTokenRepository
                .findByEmailAndOtpAndUsedFalseAndExpiredAtAfter(
                        request.getEmail(), request.getOtp(), LocalDateTime.now())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Mã OTP không hợp lệ hoặc đã hết hạn!"));

        // Cập nhật mật khẩu mới
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Email không tồn tại!"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Đánh dấu OTP đã dùng và xóa khỏi DB
        otpToken.setUsed(true);
        otpTokenRepository.save(otpToken);
        otpTokenRepository.deleteByEmail(request.getEmail());

        log.info("Password reset successfully for: {}", request.getEmail());
    }

    /**
     * Tạo mã OTP ngẫu nhiên 6 chữ số.
     */
    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000); // Từ 100000 đến 999999
        return String.valueOf(otp);
    }
}
