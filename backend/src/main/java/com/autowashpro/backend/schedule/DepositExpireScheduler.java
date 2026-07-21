package com.autowashpro.backend.schedule;

import com.autowashpro.backend.service.BillingService;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.autowashpro.backend.model.dto.CancelBookingRequest;
import com.autowashpro.backend.model.entity.Billing;
import com.autowashpro.backend.repository.BillingRepository;
import com.autowashpro.backend.service.BookingService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class DepositExpireScheduler {

    private final BillingService billingService;
    private final BillingRepository billingRepository;
    private final BookingService bookingService;

    public DepositExpireScheduler(BillingRepository billingRepository, BookingService bookingService,
            BillingService billingService) {
        this.billingRepository = billingRepository;
        this.bookingService = bookingService;
        this.billingService = billingService;
    }

    @Scheduled(cron = "* * * * * *")
    @Transactional
    public void killDepositUnpaidBillings() {
        List<Billing> depositUnpaidBillings = billingRepository.findDepositUnpaidBillings();

        for (Billing depositUnpaidBilling : depositUnpaidBillings) {
            LocalDateTime depositExpiry = depositUnpaidBilling.getDepositExpiry();

            if (depositExpiry == null || depositExpiry.isBefore(LocalDateTime.now())) {
                String bookingCode = depositUnpaidBilling.getBooking().getBookingCode();
                String message = String.format("Mã đặt lịch %s đã quá thời hạn đặt cọc.", bookingCode);
                log.info("killDepositUnpaidBillings() - canceling deposit unpaid booking {}", bookingCode);
                CancelBookingRequest request = new CancelBookingRequest(bookingCode, message);
                bookingService.cancelCustomerBooking(request);
            }
        }
    }

}
