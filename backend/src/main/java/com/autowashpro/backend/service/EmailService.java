package com.autowashpro.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Gửi email chứa mã OTP cho khách hàng quên mật khẩu.
     */
    public void sendOtpEmail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("autowashpro.noreply@gmail.com", "AutoWash Pro");
            helper.setTo(toEmail);
            helper.setSubject("Mã OTP đặt lại mật khẩu - AutoWash Pro");

            String htmlContent = buildOtpEmailTemplate(otp);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", toEmail, e);
            throw new RuntimeException("Không thể gửi email. Vui lòng thử lại sau!");
        }
    }

    /**
     * Template HTML cho email OTP.
     */
    private String buildOtpEmailTemplate(String otp) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                </head>
                <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
                    <div style="max-width:600px; margin:30px auto; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">

                        <!-- Header -->
                        <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); padding:30px; text-align:center;">
                            <h1 style="color:#ffffff; margin:0; font-size:24px;">🚗 AutoWash Pro</h1>
                            <p style="color:#e8e8ff; margin:8px 0 0; font-size:14px;">Đặt lại mật khẩu</p>
                        </div>

                        <!-- Body -->
                        <div style="padding:30px;">
                            <p style="color:#333; font-size:16px;">Xin chào,</p>
                            <p style="color:#555; font-size:14px; line-height:1.6;">
                                Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                                Vui lòng sử dụng mã OTP bên dưới để tiếp tục:
                            </p>

                            <!-- OTP Code -->
                            <div style="text-align:center; margin:30px 0;">
                                <div style="display:inline-block; background:#f0f0ff; border:2px dashed #667eea; border-radius:10px; padding:20px 40px;">
                                    <span style="font-size:36px; font-weight:bold; color:#667eea; letter-spacing:8px;">%s</span>
                                </div>
                            </div>

                            <p style="color:#555; font-size:14px; line-height:1.6;">
                                ⏰ Mã OTP này có hiệu lực trong <strong>10 phút</strong>.<br>
                                ⚠️ Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
                            </p>
                        </div>

                        <!-- Footer -->
                        <div style="background:#f9f9f9; padding:20px; text-align:center; border-top:1px solid #eee;">
                            <p style="color:#999; font-size:12px; margin:0;">
                                © 2025 AutoWash Pro. All rights reserved.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(otp);
    }
}
