package com.autowashpro.backend.service;

import java.text.NumberFormat;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.dto.BookingDetailResponse;
import com.autowashpro.backend.model.dto.CreateBookingResponse;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Autowired
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

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
                        <div style="background: #0d1b4b; padding:30px; text-align:center;">
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
                                <div style="display:inline-block; background:#f0f2f8; border:2px dashed #0d1b4b; border-radius:10px; padding:20px 40px;">
                                    <span style="font-size:36px; font-weight:bold; color:#0d1b4b; letter-spacing:8px;">%s</span>
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
                """
                .formatted(otp);
    }

    public void sendBookingSuccessToEmail(String toEmail, String bookingCode, CreateBookingResponse bookingResponse, byte[] qrCodeImage) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("autowashpro.noreply@gmail.com", "AutoWash Pro");
            helper.setTo(toEmail);
            helper.setSubject("Đặt lịch thành công - AutoWash Pro");

            // Set HTML content TRƯỚC khi addInline
            String htmlContent = buildBookingSuccessHtml(bookingResponse, bookingCode);
            helper.setText(htmlContent, true);

            // Nhúng QR Code inline vào email (phải gọi SAU setText)
            helper.addInline("qrcode", new ByteArrayResource(qrCodeImage), "image/png");

            mailSender.send(message);
            log.info("Booking success email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send booking success email to: {}", toEmail, e);
            throw new RuntimeException("Không thể gửi email. Vui lòng thử lại sau!");
        }
    }

    private String buildBookingSuccessHtml(CreateBookingResponse bookingResponse, String bookingCode) {

        StringBuilder services = new StringBuilder("");
        for (BookingDetailResponse bookingDetailResponse : bookingResponse.getBookingDetails()) {
            if (!services.isEmpty()) {
                services.append(" + ");
            }
            services.append(bookingDetailResponse.getServiceName());
        }

        // Tạo formatter với locale Vietnam - Cách 1 (Java 19+)
        NumberFormat formatter = NumberFormat.getNumberInstance(Locale.of("vi", "VN"));
        formatter.setMaximumFractionDigits(0);
        formatter.setMinimumFractionDigits(0);

        String formattedOriginal = formatter.format(bookingResponse.getTotalOriginalPrice());
        String formattedDiscount = formatter.format(bookingResponse.getTotalDiscount());
        String formattedFinal = formatter.format(bookingResponse.getTotalFinalPrice());

        return """
                <!DOCTYPE html>
                <html>

                <head>
                    <meta charset="UTF-8">
                </head>

                <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
                    <div
                        style="max-width:600px; margin:30px auto; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">

                        <!-- Header -->
                        <div style="background: #0d1b4b; padding:30px; text-align:center;">
                            <h1 style="color:#ffffff; margin:0; font-size:24px;">AutowashPro</h1>
                            <p style="color:#e8e8ff; margin:8px 0 0; font-size:14px;">Xác nhận đặt lịch rửa xe</p>
                        </div>

                        <!-- Body -->
                        <div style="padding:30px;">
                            <p style="color:#333; font-size:16px;">Chúc mừng <strong>{customerName}</strong> đã đặt lịch thành
                                công! 🎉</p>

                            <!-- Booking Info -->
                            <div style="background:#f0f2f8; border-radius:10px; padding:20px; margin:20px 0;">
                                <h3 style="color:#0d1b4b; margin:0 0 15px;">📋 Thông tin đặt lịch</h3>
                                <table style="width:100%; border-collapse:collapse;">
                                    <tr>
                                        <td style="color:#555; font-size:14px; padding:6px 0; width:40%;">Mã booking</td>
                                        <td style="color:#0d1b4b; font-size:14px; font-weight:bold;">#{bookingCode}</td>
                                    </tr>
                                    <tr>
                                        <td style="color:#555; font-size:14px; padding:6px 0;">Ngày rửa</td>
                                        <td style="color:#333; font-size:14px;">{bookingDate}</td>
                                    </tr>
                                    <tr>
                                        <td style="color:#555; font-size:14px; padding:6px 0;">Giờ bắt đầu</td>
                                        <td style="color:#333; font-size:14px;">{startTime} - {endTime}</td>
                                    </tr>
                                    <tr>
                                        <td style="color:#555; font-size:14px; padding:6px 0;">Khoang rửa</td>
                                        <td style="color:#333; font-size:14px;">{bayName}</td>
                                    </tr>
                                    <tr>
                                        <td style="color:#555; font-size:14px; padding:6px 0;">Biển số xe</td>
                                        <td style="color:#333; font-size:14px;">{licensePlate}</td>
                                    </tr>
                                    <tr>
                                        <td style="color:#555; font-size:14px; padding:6px 0;">Dòng xe</td>
                                        <td style="color:#333; font-size:14px;">{vehicleType}</td>
                                    </tr>
                                    <tr>
                                        <td style="color:#555; font-size:14px; padding:6px 0;">Dịch vụ</td>
                                        <td style="color:#333; font-size:14px;">{services}</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Price Info -->
                            <div style="background:#fff8e1; border-radius:10px; padding:20px; margin:20px 0;">
                                <h3 style="color:#0d1b4b; margin:0 0 15px;">💰 Chi phí</h3>
                                <table style="width:100%; border-collapse:collapse;">
                                    <tr>
                                        <td style="color:#555; font-size:14px; padding:6px 0;">Tổng tiền gốc</td>
                                        <td style="color:#333; font-size:14px; text-align:right;">{totalOriginal}đ</td>
                                    </tr>
                                    <tr>
                                        <td style="color:#555; font-size:14px; padding:6px 0;">Khuyến mãi</td>
                                        <td style="color:#e53935; font-size:14px; text-align:right;">- {totalDiscount}đ</td>
                                    </tr>
                                    <tr style="border-top:1px solid #eee;">
                                        <td style="color:#0d1b4b; font-size:16px; font-weight:bold; padding:10px 0 0;">Thành tiền</td>
                                        <td
                                            style="color:#0d1b4b; font-size:16px; font-weight:bold; text-align:right; padding:10px 0 0;">
                                            {totalFinal}đ</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Note -->
                            <div style="border-left:4px solid #0d1b4b; padding:10px 15px; margin:20px 0; background:#f9f9ff;">
                                <p style="color:#555; font-size:14px; margin:0; line-height:1.8;">
                                    📌 Vui lòng có mặt trước <strong>10 phút</strong>.<br>
                                    ❌ Hủy lịch trước <strong>2 tiếng</strong> để không bị tính phí.
                                </p>
                            </div>

                            <!-- QR Code -->
                            <div style="text-align:center; margin:30px 0; padding:20px; background:#f9faff; border-radius:10px; border:1px solid #e0e4f0;">
                                <h3 style="color:#0d1b4b; margin:0 0 10px;">Mã QR Check-in</h3>
                                <p style="color:#555; font-size:14px; margin:0 0 15px;">Đưa mã QR này cho nhân viên khi đến cửa hàng</p>
                                <img src="cid:qrcode" alt="QR Code" style="width:200px; height:200px; border:4px solid #fff; border-radius:8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
                                <p style="color:#999; font-size:12px; margin:12px 0 0;">Mã booking: <strong style="color:#0d1b4b;">#{bookingCode}</strong></p>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div style="background:#f9f9f9; padding:20px; text-align:center; border-top:1px solid #eee;">
                            <p style="color:#999; font-size:12px; margin:0;">
                                © 2025 AutoWash Pro. Hotline: 0945692584.
                            </p>
                        </div>
                    </div>
                </body>

                </html>
                """
                .replace("{customerName}", bookingResponse.getCustomerName())
                .replace("{bookingCode}", bookingCode)
                .replace("{bookingDate}", bookingResponse.getBookingDate().toString())
                .replace("{startTime}", bookingResponse.getStartTime().toString())
                .replace("{endTime}", bookingResponse.getEndTime().toString())
                .replace("{bayName}", bookingResponse.getBayName())
                .replace("{licensePlate}", bookingResponse.getVehicleLicensePlate())
                .replace("{vehicleType}", bookingResponse.getVehicleTypeName())
                .replace("{services}", services.toString())
                .replace("{totalOriginal}", formattedOriginal)
                .replace("{totalDiscount}", formattedDiscount)
                .replace("{totalFinal}", formattedFinal);
    }
}
