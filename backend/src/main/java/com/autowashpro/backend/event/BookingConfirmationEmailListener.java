package com.autowashpro.backend.event;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.repository.BookingRepository;
import com.autowashpro.backend.service.EmailService;
import com.autowashpro.backend.utils.QrCodeGenerator;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class BookingConfirmationEmailListener {

    @Value("${email.sendbooking}")
    private boolean useEmailService;

    private final BookingRepository bookingRepository;
    private final QrCodeGenerator qrCodeGenerator;
    private final EmailService emailService;

    public BookingConfirmationEmailListener(BookingRepository bookingRepository,
            QrCodeGenerator qrCodeGenerator, EmailService emailService) {
        this.bookingRepository = bookingRepository;
        this.qrCodeGenerator = qrCodeGenerator;
        this.emailService = emailService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW, readOnly = true)
    public void sendBookingConfirmationEmail(BookingConfirmationEmailRequestedEvent event) {
        if (!useEmailService) {
            return;
        }

        try {
            Booking booking = bookingRepository.findByIdWithDetails(event.bookingId())
                    .orElseThrow(() -> new IllegalStateException(
                            "Không tìm thấy booking để gửi email xác nhận: " + event.bookingId()));
            byte[] qrCodeBytes = qrCodeGenerator.generateQrCode(booking.getBookingCode());
            emailService.sendBookingSuccessToEmail(booking, qrCodeBytes);
        } catch (Exception exception) {
            log.error("Không thể gửi email xác nhận cho bookingId={}", event.bookingId(), exception);
        }
    }
}
