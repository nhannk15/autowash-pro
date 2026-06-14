package com.autowashpro.backend.seeder;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final List<Seeder> seeders;

    @Autowired
    public DataSeeder(List<Seeder> seeders) {
        this.seeders = seeders;
    }

    @Override
    public void run(String... args) throws Exception {
        for (Seeder seeder : seeders) {
            seeder.seed();
        }
    }

}

/**
 * This is the order of the Seeder Bean:
 * 1. VehicleTypeSeeder.
 * 2. ServiceSeeder.
 * 3. ServicePriceSeeder.
 * 4. StepAndHighlightSeeder.
 * 5. MembershipTierSeeder.
 * 6. TierRuleSeeder.
 * 7. StaffSeeder.
 * 8. CustomerSeeder.
 * 9. WashBaySeeder.
 * 10. VehicleSeeder.
 * 11. PromotionSeeder.
 * 12. RewardSeeder.
 * 13. TimeSlotSeeder.
 * 14. AvailableSlotSeeder.
 * 15. BookingSeeder.
 */
