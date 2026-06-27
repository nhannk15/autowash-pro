package com.autowashpro.backend.schedule;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.autowashpro.backend.model.entity.AvailableSlot;
import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.model.entity.BookingDetail;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.Service;
import com.autowashpro.backend.model.entity.ServicePrice;
import com.autowashpro.backend.model.entity.TimeSlot;
import com.autowashpro.backend.model.entity.Vehicle;
import com.autowashpro.backend.model.entity.VehicleType;
import com.autowashpro.backend.model.entity.WashBay;
import com.autowashpro.backend.model.enums.BookingStatus;
import com.autowashpro.backend.repository.BookingRepository;
import com.autowashpro.backend.service.EmailService;

@ExtendWith(MockitoExtension.class)
class BookingReminderSchedulerTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private BookingReminderScheduler scheduler;

    private Booking booking1;
    private Booking booking2;
    private Customer customer1;
    private Customer customer2;
    private List<Booking> bookings;

    @BeforeEach
    void setUp() {
        // Customer 1
        customer1 = new Customer();
        customer1.setId(1L);
        customer1.setEmail("customer1@test.com");
        customer1.setFullName("Nguyễn Văn A");

        // Customer 2
        customer2 = new Customer();
        customer2.setId(2L);
        customer2.setEmail("customer2@test.com");
        customer2.setFullName("Trần Thị B");

        // Vehicle Type
        VehicleType vehicleType = new VehicleType();
        vehicleType.setId(1L);
        vehicleType.setTypeName("Sedan");

        // Vehicle 1
        Vehicle vehicle1 = new Vehicle();
        vehicle1.setId(1L);
        vehicle1.setLicensePlate("51A-12345");
        vehicle1.setVehicleType(vehicleType);

        // Vehicle 2
        Vehicle vehicle2 = new Vehicle();
        vehicle2.setId(2L);
        vehicle2.setLicensePlate("51B-67890");
        vehicle2.setVehicleType(vehicleType);

        // Time Slot
        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setId(1L);
        timeSlot.setStartTime(LocalTime.of(8, 0));
        timeSlot.setEndTime(LocalTime.of(9, 0));

        // Wash Bay
        WashBay washBay = new WashBay();
        washBay.setId(1L);
        washBay.setName("Khoang A");

        // Service
        Service service = new Service();
        service.setId(1L);
        service.setServiceName("Rửa xe ngoại thất");

        // Service Price
        ServicePrice servicePrice = new ServicePrice();
        servicePrice.setId(1L);
        servicePrice.setService(service);

        // Available Slot 1
        AvailableSlot availableSlot1 = new AvailableSlot();
        availableSlot1.setId(1L);
        availableSlot1.setSlotDate(LocalDate.now().plusDays(1));
        availableSlot1.setTimeSlot(timeSlot);
        availableSlot1.setWashBay(washBay);

        // Available Slot 2
        AvailableSlot availableSlot2 = new AvailableSlot();
        availableSlot2.setId(2L);
        availableSlot2.setSlotDate(LocalDate.now().plusDays(1));
        availableSlot2.setTimeSlot(timeSlot);
        availableSlot2.setWashBay(washBay);

        // Booking Detail 1
        BookingDetail bookingDetail1 = new BookingDetail();
        bookingDetail1.setId(1L);
        bookingDetail1.setServicePrice(servicePrice);

        // Booking Detail 2
        BookingDetail bookingDetail2 = new BookingDetail();
        bookingDetail2.setId(2L);
        bookingDetail2.setServicePrice(servicePrice);

        // Booking 1
        booking1 = new Booking();
        booking1.setId(1L);
        booking1.setBookingCode("BK001");
        booking1.setCustomer(customer1);
        booking1.setVehicle(vehicle1);
        booking1.setStatus(BookingStatus.CONFIRMED);
        booking1.setReminderSent(false);
        booking1.setAvailableSlots(new ArrayList<>(List.of(availableSlot1)));
        booking1.setBookingDetails(new ArrayList<>(List.of(bookingDetail1)));
        availableSlot1.setBooking(booking1);
        bookingDetail1.setBooking(booking1);

        // Booking 2
        booking2 = new Booking();
        booking2.setId(2L);
        booking2.setBookingCode("BK002");
        booking2.setCustomer(customer2);
        booking2.setVehicle(vehicle2);
        booking2.setStatus(BookingStatus.CONFIRMED);
        booking2.setReminderSent(false);
        booking2.setAvailableSlots(new ArrayList<>(List.of(availableSlot2)));
        booking2.setBookingDetails(new ArrayList<>(List.of(bookingDetail2)));
        availableSlot2.setBooking(booking2);
        bookingDetail2.setBooking(booking2);

        bookings = List.of(booking1, booking2);
    }

    @Test
    void shouldSendRemindersForAllBookingsSuccessfully() {
        // Arrange
        when(bookingRepository.findBookingsForReminder(any(LocalDate.class), eq(BookingStatus.CONFIRMED)))
                .thenReturn(bookings);

        // Act
        scheduler.sendBookingReminders();

        // Assert
        verify(emailService, times(2)).sendBookingReminderEmail(any(Booking.class));
        verify(bookingRepository, times(2)).save(any(Booking.class));
        assertTrue(booking1.isReminderSent());
        assertTrue(booking2.isReminderSent());
    }

    @Test
    void shouldHandleNoBookingsGracefully() {
        // Arrange
        when(bookingRepository.findBookingsForReminder(any(LocalDate.class), eq(BookingStatus.CONFIRMED)))
                .thenReturn(List.of());

        // Act
        scheduler.sendBookingReminders();

        // Assert
        verify(emailService, never()).sendBookingReminderEmail(any(Booking.class));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void shouldContinueToNextBookingWhenFirstEmailFails() {
        // Arrange
        when(bookingRepository.findBookingsForReminder(any(LocalDate.class), eq(BookingStatus.CONFIRMED)))
                .thenReturn(bookings);

        doThrow(new RuntimeException("Email sending failed"))
                .when(emailService).sendBookingReminderEmail(booking1);

        // Act
        scheduler.sendBookingReminders();

        // Assert
        // Booking 1: email failed → reminderSent remains false
        assertFalse(booking1.isReminderSent());
        // Booking 2: email sent successfully → reminderSent becomes true
        assertTrue(booking2.isReminderSent());
        verify(bookingRepository, times(1)).save(booking2);
        verify(bookingRepository, never()).save(booking1);
    }

    @Test
    void shouldNotResendReminderForAlreadyRemindedBookings() {
        // Arrange
        // Simulate that the repository query already filters by reminderSent=false
        // If a booking has reminderSent=true, it won't be returned by the query
        when(bookingRepository.findBookingsForReminder(any(LocalDate.class), eq(BookingStatus.CONFIRMED)))
                .thenReturn(List.of());

        // Act
        scheduler.sendBookingReminders();

        // Assert
        verify(emailService, never()).sendBookingReminderEmail(any(Booking.class));
        verify(bookingRepository, never()).save(any(Booking.class));
    }
}
