package com.autowashpro.backend.event;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.scheduling.annotation.Async;

import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.repository.BookingRepository;
import com.autowashpro.backend.service.EmailService;
import com.autowashpro.backend.utils.QrCodeGenerator;

@ExtendWith(MockitoExtension.class)
@Tag("unit")
class BookingConfirmationEmailListenerTest {

    @InjectMocks
    private BookingConfirmationEmailListener listener;

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private QrCodeGenerator qrCodeGenerator;
    @Mock
    private EmailService emailService;

    @Test
    void confirmationEmailIsConfiguredToRunAsynchronously() throws NoSuchMethodException {
        Async async = BookingConfirmationEmailListener.class
                .getMethod("sendBookingConfirmationEmail", BookingConfirmationEmailRequestedEvent.class)
                .getAnnotation(Async.class);

        org.junit.jupiter.api.Assertions.assertNotNull(async);
        org.junit.jupiter.api.Assertions.assertEquals("bookingEmailExecutor", async.value());
    }

    @Test
    void committedRequestLoadsBookingAndSendsEmail() {
        ReflectionTestUtils.setField(listener, "useEmailService", true);
        Booking booking = Booking.builder()
                .id(11L)
                .bookingCode("BOOK11")
                .build();
        byte[] qrCode = { 1, 2, 3 };
        when(bookingRepository.findByIdWithDetails(11L)).thenReturn(Optional.of(booking));
        when(qrCodeGenerator.generateQrCode("BOOK11")).thenReturn(qrCode);

        listener.sendBookingConfirmationEmail(new BookingConfirmationEmailRequestedEvent(11L));

        verify(emailService).sendBookingSuccessToEmail(booking, qrCode);
    }
}
