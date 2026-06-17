package com.autowashpro.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.exception.BillingNotFoundException;
import com.autowashpro.backend.exception.BookingNotFoundException;
import com.autowashpro.backend.mapper.BillingMapper;
import com.autowashpro.backend.model.dto.BillingResponse;
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
    private final BillingMapper billingMapper;

    @Autowired
    public BillingService(BillingRepository billingRepository, BookingRepository bookingRepository,
            BillingMapper billingMapper) {
        this.billingRepository = billingRepository;
        this.bookingRepository = bookingRepository;
        this.billingMapper = billingMapper;
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

        PaymentMethod paymentMethod = PaymentMethod.CASH;

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

    public List<BillingResponse> getAllBillingAccordingToListOfBookingIds(List<Long> bookingIds) {
        List<Billing> billings = new ArrayList<>();
        for (Long bookingId : bookingIds) {
            Billing billing = billingRepository.findByBookingId(bookingId).orElseThrow(
                    () -> new BillingNotFoundException("Không tìm thấy hóa đơn với id lịch đặt là: " + bookingId));
            billings.add(billing);
        }
        return billingMapper.toBillingResponses(billings);
    }

}
