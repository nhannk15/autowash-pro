package com.autowashpro.backend.schedule;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.dto.CancelBookingRequest;
import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.model.enums.BookingStatus;
import com.autowashpro.backend.repository.BookingRepository;
import com.autowashpro.backend.service.BookingService;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class BookingExpiredScheduler {

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;

    @Autowired
    public BookingExpiredScheduler(BookingRepository bookingRepository, BookingService bookingService) {
        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
    }

    private LocalDate lastCheckDate = null;

    @Scheduled(cron = "1 0 0 * * *")
    public void checkBookingExpire() {
        log.info("BookingExpiredScheduler - check booking");
        List<Booking> bookings = bookingRepository.findAll().stream()
                .filter(booking -> booking.getStatus() != BookingStatus.COMPLETED).toList();
        for (Booking booking : bookings) {
            if (booking.getAvailableSlots().getFirst().getSlotDate().isBefore(LocalDate.now())) {
                CancelBookingRequest request = new CancelBookingRequest(booking.getBookingCode(),
                        "Mã đặt lịch đã hết hạn vào ngày " + LocalDate.now().toString());
                bookingService.cancelCustomerBooking(request);
            }
        }
    }
}
