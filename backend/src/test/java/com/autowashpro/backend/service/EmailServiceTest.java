package com.autowashpro.backend.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import com.autowashpro.backend.model.entity.AvailableSlot;
import com.autowashpro.backend.model.entity.Billing;
import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.model.entity.BookingDetail;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.Service;
import com.autowashpro.backend.model.entity.ServicePrice;
import com.autowashpro.backend.model.entity.TimeSlot;
import com.autowashpro.backend.model.entity.Vehicle;
import com.autowashpro.backend.model.entity.VehicleType;
import com.autowashpro.backend.model.entity.WashBay;

@Tag("unit")
class EmailServiceTest {

    @Test
    void bookingEmailSubtractsVoucherAndDepositFromFinalAmount() {
        EmailService emailService = new EmailService(null);

        Customer customer = new Customer();
        customer.setEmail("customer@example.com");
        customer.setFullName("Khách hàng");

        VehicleType vehicleType = new VehicleType();
        vehicleType.setTypeName("SEDAN");
        Vehicle vehicle = new Vehicle();
        vehicle.setLicensePlate("51A-12345");
        vehicle.setVehicleType(vehicleType);

        Service service = new Service();
        service.setServiceName("Rửa xe");
        ServicePrice servicePrice = new ServicePrice();
        servicePrice.setService(service);
        BookingDetail bookingDetail = new BookingDetail();
        bookingDetail.setServicePrice(servicePrice);

        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setStartTime(LocalTime.of(8, 0));
        timeSlot.setEndTime(LocalTime.of(9, 0));
        WashBay washBay = new WashBay();
        washBay.setName("Khoang 1");
        AvailableSlot availableSlot = new AvailableSlot();
        availableSlot.setSlotDate(LocalDate.of(2026, 7, 30));
        availableSlot.setTimeSlot(timeSlot);
        availableSlot.setWashBay(washBay);

        Booking booking = Booking.builder()
                .id(11L)
                .bookingCode("BOOK11")
                .customer(customer)
                .vehicle(vehicle)
                .bookingDetails(List.of(bookingDetail))
                .availableSlots(List.of(availableSlot))
                .build();
        Billing billing = Billing.builder()
                .booking(booking)
                .originalAmount(new BigDecimal("500000"))
                .discountAmount(new BigDecimal("150000"))
                .depositAmount(new BigDecimal("135000"))
                .finalAmount(new BigDecimal("215000"))
                .build();
        booking.setBilling(billing);

        String html = emailService.buildBookingSuccessHtml(booking);

        assertTrue(html.contains("500.000đ"));
        assertTrue(html.contains("150.000đ"));
        assertTrue(html.contains("135.000đ"));
        assertTrue(html.contains("215.000đ"));
        assertFalse(html.contains("350.000đ"));
        assertTrue(html.contains("Tổng giảm (khuyến mãi/voucher)"));
        assertTrue(html.contains("Tiền đặt cọc"));
        assertTrue(html.indexOf("Tổng giảm (khuyến mãi/voucher)") < html.indexOf("Tiền đặt cọc"));
        assertTrue(html.indexOf("Tiền đặt cọc") < html.indexOf("Thành tiền"));
    }
}
