package com.autowashpro.backend.seeder;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final List<Seeder> seeders;
    private final AvailableSlotSeeder availableSlotSeeder;

    @Autowired
    public DataSeeder(List<Seeder> seeders, AvailableSlotSeeder availableSlotSeeder) {
        this.seeders = seeders;
        this.availableSlotSeeder = availableSlotSeeder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Uncomment this for one time.
        // for (Seeder seeder : seeders) {
        //     seeder.seed();
        // }
        availableSlotSeeder.seedNewSlots();
        availableSlotSeeder.deleteUnusedSlotsInThePast();
        // 2. Uncomment this for everyday's creating new bookings.
        // bookingSeeder.seed();
    }

}

/**
 * This is the order of the Seeder Bean:
 * 1.  VehicleTypeSeeder.
 * 2.  ServiceSeeder.
 * 3.  ServicePriceSeeder.
 * 4.  StepAndHighlightSeeder.
 * 5.  MembershipTierSeeder.
 * 6.  TierRuleSeeder.
 * 7.  StaffSeeder.
 * 8.  CustomerSeeder.
 * 9.  WashBaySeeder.
 * 10. VehicleSeeder.
 * 11. PromotionSeeder.
 * 12. RewardSeeder.
 * 13. TimeSlotSeeder.
 * 14. AvailableSlotSeeder.
 * 15. BookingSeeder.
 * 16. PointTransactionSeeder.
 */
