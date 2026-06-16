package com.autowashpro.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.exception.BookingNotFoundException;
import com.autowashpro.backend.model.entity.Billing;
import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.model.entity.BookingDetail;
import com.autowashpro.backend.model.entity.Voucher;
import com.autowashpro.backend.model.enums.PaymentMethod;
import com.autowashpro.backend.model.enums.PaymentStatus;
import com.autowashpro.backend.repository.BillingRepository;
import com.autowashpro.backend.repository.BookingRepository;

@Service
public class BillingService {

    private final BillingRepository billingRepository;
    private final BookingRepository bookingRepository;

    @Autowired
    public BillingService(BillingRepository billingRepository, BookingRepository bookingRepository) {
        this.billingRepository = billingRepository;
        this.bookingRepository = bookingRepository;
    }

    public Billing createPendingBilling(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Không tìm thấy lịch hẹn với id: " + bookingId));

        Voucher voucher = null;

        BigDecimal originalAmount = booking.getBookingDetails()
                .stream()
                .map(BookingDetail::getPriceAtBooking)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discountAmount = booking.getBookingDetails()
                .stream()
                .map(BookingDetail::getDiscountAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal finalAmount = booking.getBookingDetails()
                .stream()
                .map(BookingDetail::getFinalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        PaymentMethod paymentMethod = PaymentMethod.BANK_TRANSFER;

        PaymentStatus paymentStatus = PaymentStatus.PENDING;

        LocalDateTime paidAt = null;

        Billing newBilling = Billing
                .builder()
                .booking(booking)
                .voucher(voucher)
                .originalAmount(originalAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .paymentMethod(paymentMethod)
                .paymentStatus(paymentStatus)
                .paidAt(paidAt)
                .build();

        Billing savedBilling = billingRepository.save(newBilling);
        return savedBilling;
    }

}
