package com.autowashpro.backend.seeder;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.dto.CreateBookingRequest;
import com.autowashpro.backend.service.BookingService;

@Component
@Order(15)
public class BookingSeeder implements Seeder {

    private final BookingService bookingService;

    @Autowired
    public BookingSeeder(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @Override
    public void seed() {

        LocalDate tomorrow = LocalDate.now().plusDays(1L);

        CreateBookingRequest bookingRequest_1 = CreateBookingRequest
                .builder()
                .customerId(3L)
                .vehicleId(1L)
                .timeSlotId(4L)
                .bookingDate(tomorrow)
                .servicePriceIds(List.of(13L))
                .notes("Booking của Lê Thị Thúy: SEDAN Hyundai CREATA")
                .build();

        CreateBookingRequest bookingRequest_2 = CreateBookingRequest
                .builder()
                .customerId(3L)
                .vehicleId(2L)
                .timeSlotId(4L)
                .bookingDate(tomorrow)
                .servicePriceIds(List.of(13L))
                .notes("Booking của Lê Thị Thúy: SEDAN Toyota CAMRY")
                .build();

        CreateBookingRequest bookingRequest_3 = CreateBookingRequest
                .builder()
                .customerId(4L)
                .vehicleId(3L)
                .timeSlotId(4L)
                .bookingDate(tomorrow)
                .servicePriceIds(List.of(14L))
                .notes("Booking của Nguyễn Khắc Lê Nhân: SUV Honda CR-V")
                .build();

        CreateBookingRequest bookingRequest_4 = CreateBookingRequest
                .builder()
                .customerId(4L)
                .vehicleId(4L)
                .timeSlotId(4L)
                .bookingDate(tomorrow)
                .servicePriceIds(List.of(13L))
                .notes("Booking của Nguyễn Khắc Lê Nhân: SEDAN Mazda 3")
                .build();

        CreateBookingRequest bookingRequest_5 = CreateBookingRequest
                .builder()
                .customerId(5L)
                .vehicleId(5L)
                .timeSlotId(4L)
                .bookingDate(tomorrow)
                .servicePriceIds(List.of(14L))
                .notes("Booking của Trần Bùi Phương Trinh - SUV Ford Everest")
                .build();

        /**
         * Now, all the bays in Slot 4 (10:00 - 11:00) tomorrow are booked.
         */
        CreateBookingRequest bookingRequest_6 = CreateBookingRequest
                .builder()
                .customerId(6L)
                .vehicleId(6L)
                .timeSlotId(5L)
                .bookingDate(tomorrow)
                .servicePriceIds(List.of(5L))
                .notes("Booking của Đặng Nhất Thiên Bảo - SEDAN Kia CERATO")
                .build();

        CreateBookingRequest bookingRequest_7 = CreateBookingRequest
                .builder()
                .customerId(7L)
                .vehicleId(7L)
                .timeSlotId(5L)
                .bookingDate(tomorrow)
                .servicePriceIds(List.of(6L))
                .notes("Booking của Hồ Dương Nhật Quang - SUV Mitsubishi XPANDER")
                .build();

        CreateBookingRequest bookingRequest_8 = CreateBookingRequest
                .builder()
                .customerId(8L)
                .vehicleId(8L)
                .timeSlotId(5L)
                .bookingDate(tomorrow)
                .servicePriceIds(List.of(5L))
                .notes("Booking của Trần Vương Quân - SEDAN Nissan Altima")
                .build();

        CreateBookingRequest bookingRequest_9 = CreateBookingRequest
                .builder()
                .customerId(9L)
                .vehicleId(9L)
                .timeSlotId(5L)
                .bookingDate(tomorrow)
                .servicePriceIds(List.of(6L))
                .notes("Booking của Phan Nguyễn Anh Thư - SUV Suzuki Ertiga")
                .build();

        CreateBookingRequest bookingRequest_10 = CreateBookingRequest
                .builder()
                .customerId(11L)
                .vehicleId(10L)
                .timeSlotId(5L)
                .bookingDate(tomorrow)
                .servicePriceIds(List.of(5L))
                .notes("Booking của Phan Ngọc Quyết - SEDAN Tesla Model3")
                .build();

        bookingService.createBooking(bookingRequest_1);
        bookingService.createBooking(bookingRequest_2);
        bookingService.createBooking(bookingRequest_3);
        bookingService.createBooking(bookingRequest_4);
        bookingService.createBooking(bookingRequest_5);
        bookingService.createBooking(bookingRequest_6);
        bookingService.createBooking(bookingRequest_7);
        bookingService.createBooking(bookingRequest_8);
        bookingService.createBooking(bookingRequest_9);
        bookingService.createBooking(bookingRequest_10);
    }

}
