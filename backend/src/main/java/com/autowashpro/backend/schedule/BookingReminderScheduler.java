package com.autowashpro.backend.schedule;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.model.enums.BookingStatus;
import com.autowashpro.backend.repository.BookingRepository;
import com.autowashpro.backend.service.EmailService;
import com.autowashpro.backend.utils.QrCodeGenerator;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class BookingReminderScheduler {

    private final BookingRepository bookingRepository;
    private final EmailService emailService;
    private final QrCodeGenerator qrCodeGenerator;

    @Autowired
    public BookingReminderScheduler(BookingRepository bookingRepository,
                                     EmailService emailService,
                                     QrCodeGenerator qrCodeGenerator) {
        this.bookingRepository = bookingRepository;
        this.emailService = emailService;
        this.qrCodeGenerator = qrCodeGenerator;
    }

    @Scheduled(cron = "0 0 8 * * *") // 8:00 AM mỗi ngày
    @Transactional
    public void sendBookingReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Booking> bookings = bookingRepository
                .findBookingsForReminder(tomorrow, BookingStatus.CONFIRMED);

        log.info("BookingReminderScheduler - Found {} bookings for {}", bookings.size(), tomorrow);

        for (Booking booking : bookings) {
            try {
                byte[] qrCode = qrCodeGenerator.generateQrCode(booking.getBookingCode());
                emailService.sendBookingReminderEmail(booking, qrCode);
                booking.setReminderSent(true);
                bookingRepository.save(booking);
                log.info("Reminder sent for bookingId={}, email={}",
                        booking.getId(), booking.getCustomer().getEmail());
            } catch (Exception e) {
                log.error("Failed to send reminder for bookingId={}, email={}",
                        booking.getId(), booking.getCustomer().getEmail(), e);
            }
        }
    }
}
