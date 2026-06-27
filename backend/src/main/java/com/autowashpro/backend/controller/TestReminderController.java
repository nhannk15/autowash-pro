package com.autowashpro.backend.controller;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
import com.autowashpro.backend.service.EmailService;
import com.autowashpro.backend.utils.QrCodeGenerator;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/test")
@Slf4j
public class TestReminderController {

    private final EmailService emailService;
    private final QrCodeGenerator qrCodeGenerator;

    @Autowired
    public TestReminderController(EmailService emailService, QrCodeGenerator qrCodeGenerator) {
        this.emailService = emailService;
        this.qrCodeGenerator = qrCodeGenerator;
    }

    @PostMapping("/send-reminder-email")
    public ResponseEntity<String> sendTestReminderEmail(
            @RequestParam(defaultValue = "tranvuongquan2707@gmail.com") String email) {
        try {
            // Build mock Booking
            Booking booking = buildMockBooking();

            // Override customer email
            booking.getCustomer().setEmail(email);

            // Generate QR code
            byte[] qrCode = qrCodeGenerator.generateQrCode(booking.getBookingCode());

            // Send reminder email with QR
            emailService.sendBookingReminderEmail(booking, qrCode);

            log.info("Test reminder email sent to: {}", email);
            return ResponseEntity.ok("Reminder email sent to " + email);
        } catch (Exception e) {
            log.error("Failed to send test reminder email", e);
            return ResponseEntity.internalServerError()
                    .body("Failed: " + e.getMessage());
        }
    }

    private Booking buildMockBooking() {
        // Customer
        Customer customer = new Customer();
        customer.setId(1L);
        customer.setEmail("tranvuongquan2707@gmail.com");
        customer.setFullName("Vương Quân");
        customer.setPhoneNumber("0945692584");

        // Vehicle Type
        VehicleType vehicleType = new VehicleType();
        vehicleType.setId(1L);
        vehicleType.setTypeName("Sedan");

        // Vehicle
        Vehicle vehicle = new Vehicle();
        vehicle.setId(1L);
        vehicle.setLicensePlate("51A-99999");
        vehicle.setVehicleType(vehicleType);

        // Time Slot
        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setId(1L);
        timeSlot.setStartTime(LocalTime.of(9, 0));
        timeSlot.setEndTime(LocalTime.of(10, 0));

        // Wash Bay
        WashBay washBay = new WashBay();
        washBay.setId(1L);
        washBay.setName("Khoang A - VIP");

        // Service
        Service service1 = new Service();
        service1.setId(1L);
        service1.setServiceName("Rửa xe ngoại thất");

        Service service2 = new Service();
        service2.setId(2L);
        service2.setServiceName("Vệ sinh nội thất");

        // Service Prices
        ServicePrice sp1 = new ServicePrice();
        sp1.setId(1L);
        sp1.setService(service1);

        ServicePrice sp2 = new ServicePrice();
        sp2.setId(2L);
        sp2.setService(service2);

        // Available Slot
        AvailableSlot slot = new AvailableSlot();
        slot.setId(1L);
        slot.setSlotDate(LocalDate.now().plusDays(1));
        slot.setTimeSlot(timeSlot);
        slot.setWashBay(washBay);

        // Booking Details
        BookingDetail detail1 = new BookingDetail();
        detail1.setId(1L);
        detail1.setServicePrice(sp1);

        BookingDetail detail2 = new BookingDetail();
        detail2.setId(2L);
        detail2.setServicePrice(sp2);

        // Booking
        Booking booking = new Booking();
        booking.setId(1L);
        booking.setBookingCode("TEST-XKVJAB");
        booking.setCustomer(customer);
        booking.setVehicle(vehicle);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setReminderSent(false);

        List<AvailableSlot> slots = new ArrayList<>();
        slots.add(slot);
        booking.setAvailableSlots(slots);
        slot.setBooking(booking);

        List<BookingDetail> details = new ArrayList<>();
        details.add(detail1);
        details.add(detail2);
        booking.setBookingDetails(details);
        detail1.setBooking(booking);
        detail2.setBooking(booking);

        return booking;
    }
}
