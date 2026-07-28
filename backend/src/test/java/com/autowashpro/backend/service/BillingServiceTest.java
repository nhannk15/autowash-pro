package com.autowashpro.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import com.autowashpro.backend.event.BookingConfirmationEmailRequestedEvent;
import com.autowashpro.backend.mapper.BillingMapper;
import com.autowashpro.backend.mapper.VoucherMapper;
import com.autowashpro.backend.model.dto.BillingResponse;
import com.autowashpro.backend.model.entity.Billing;
import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.model.enums.BookingStatus;
import com.autowashpro.backend.model.enums.DepositStatus;
import com.autowashpro.backend.model.enums.PaymentStatus;
import com.autowashpro.backend.repository.BillingRepository;
import com.autowashpro.backend.repository.BookingRepository;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.PointTransactionRepository;
import com.autowashpro.backend.repository.VoucherRepository;
import com.autowashpro.backend.repository.WashSessionRepository;

@ExtendWith(MockitoExtension.class)
@Tag("unit")
class BillingServiceTest {

    @InjectMocks
    private BillingService billingService;

    @Mock
    private WashSessionRepository washSessionRepository;
    @Mock
    private BillingRepository billingRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private BillingMapper billingMapper;
    @Mock
    private VoucherRepository voucherRepository;
    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private VoucherMapper voucherMapper;
    @Mock
    private PointTransactionRepository pointTransactionRepository;
    @Mock
    private PromotionService promotionService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    private Booking booking;
    private Billing billing;
    private BillingResponse billingResponse;

    @BeforeEach
    void setUp() {
        booking = Booking.builder()
                .id(11L)
                .bookingCode("BOOK11")
                .status(BookingStatus.PENDING)
                .build();
        billing = Billing.builder()
                .id(22L)
                .booking(booking)
                .originalAmount(new BigDecimal("500000"))
                .discountAmount(new BigDecimal("150000"))
                .depositAmount(new BigDecimal("135000"))
                .finalAmount(new BigDecimal("215000"))
                .depositStatus(DepositStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .build();
        booking.setBilling(billing);
        billingResponse = new BillingResponse();
        billingResponse.setBillingId(billing.getId());
    }

    @Test
    void completeBankingPayment_paidDepositRequestsConfirmationEmail() {
        when(billingRepository.findById(22L)).thenReturn(Optional.of(billing));
        when(billingRepository.save(billing)).thenReturn(billing);
        when(bookingRepository.save(booking)).thenReturn(booking);
        when(billingMapper.toBillingResponse(billing)).thenReturn(billingResponse);

        BillingResponse response = billingService.completeBankingPayment(Map.of(
                "vnp_TransactionStatus", "00",
                "vnp_TxnRef", "22_DEPOSIT"));

        assertNotNull(response);
        assertEquals(DepositStatus.PAID, billing.getDepositStatus());
        assertEquals(BookingStatus.CONFIRMED, booking.getStatus());
        verify(eventPublisher).publishEvent(
                org.mockito.ArgumentMatchers.<Object>argThat(event ->
                        event instanceof BookingConfirmationEmailRequestedEvent emailEvent
                                && booking.getId().equals(emailEvent.bookingId())));
    }

    @Test
    void completeBankingPayment_failedDepositDoesNotRequestConfirmationEmail() {
        BillingResponse response = billingService.completeBankingPayment(Map.of(
                "vnp_TransactionStatus", "01",
                "vnp_TxnRef", "22_DEPOSIT"));

        assertNull(response);
        verify(eventPublisher, never()).publishEvent(any(Object.class));
    }

    @Test
    void fallbackDepositCompletionRequestsConfirmationEmail() {
        when(bookingRepository.findByBookingCodeForInvalidVNPay("BOOK11")).thenReturn(Optional.of(booking));
        when(billingRepository.findById(22L)).thenReturn(Optional.of(billing));
        when(billingRepository.save(billing)).thenReturn(billing);
        when(bookingRepository.save(booking)).thenReturn(booking);
        when(billingMapper.toBillingResponse(billing)).thenReturn(billingResponse);

        BillingResponse response =
                billingService.completeBankingPaymentWhenVNPayProviderIsInvalidUsingBookingCode("BOOK11");

        assertNotNull(response);
        verify(eventPublisher).publishEvent(
                org.mockito.ArgumentMatchers.<Object>argThat(event ->
                        event instanceof BookingConfirmationEmailRequestedEvent emailEvent
                                && booking.getId().equals(emailEvent.bookingId())));
    }
}
