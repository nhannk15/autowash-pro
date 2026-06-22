package com.autowashpro.backend.seeder;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.dto.CreateBookingRequest;
import com.autowashpro.backend.model.entity.Vehicle;
import com.autowashpro.backend.repository.VehicleRepository;
import com.autowashpro.backend.service.BookingService;

@Component
@Order(15)
public class BookingSeeder implements Seeder {

    private final BookingService bookingService;
    private final VehicleRepository vehicleRepository;

    private static final List<Long> CUSTOMER_IDS = List.of(3L, 4L, 5L, 6L, 7L, 8L, 9L, 10L);
    private static final List<Long> SERVICE_PRICE_IDS = List.of(1L, 2L, 3L, 4L, 5L, 6L, 7L, 8L, 9L, 10L, 11L, 12L, 13L,
            14L);
    private static final List<Long> TIME_SLOT_IDS = List.of(1L, 2L, 3L, 4L, 5L, 6L, 7L, 8L, 9L, 10L);

    private final Random random = new Random();

    @Autowired
    public BookingSeeder(BookingService bookingService, VehicleRepository vehicleRepository) {
        this.bookingService = bookingService;
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    public void seed() {

        LocalDate tomorrow = LocalDate.now().plusDays(1L);
        int created = 0;
        int attempts = 0;

        while (created < 60 && attempts < 300) {
            attempts++;

            Long customerId = CUSTOMER_IDS.get(random.nextInt(CUSTOMER_IDS.size()));

            List<Vehicle> vehicles = vehicleRepository.findByCustomerId(customerId);
            if (vehicles.isEmpty()) {
                continue;
            }
            Vehicle vehicle = vehicles.get(random.nextInt(vehicles.size()));

            Long servicePriceId = SERVICE_PRICE_IDS.get(random.nextInt(SERVICE_PRICE_IDS.size()));
            Long timeSlotId = TIME_SLOT_IDS.get(random.nextInt(TIME_SLOT_IDS.size()));

            CreateBookingRequest request = CreateBookingRequest
                    .builder()
                    .customerId(customerId)
                    .vehicleId(vehicle.getId())
                    .timeSlotId(timeSlotId)
                    .bookingDate(tomorrow)
                    .servicePriceIds(List.of(servicePriceId))
                    .notes("Seed booking #" + (created + 1))
                    .build();

            try {
                bookingService.createBooking(request);
                created++;
            } catch (RuntimeException ex) {
                // Slot đã đầy hoặc lỗi khác -> thử lại với tổ hợp khác
                continue;
            }
        }

    }

}
