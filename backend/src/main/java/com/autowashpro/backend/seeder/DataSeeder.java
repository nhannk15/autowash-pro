package com.autowashpro.backend.seeder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final VehicleTypeSeeder vehicleTypeSeeder;
    private final ServiceSeeder serviceSeeder;
    private final ServicePriceSeeder servicePriceSeeder;
    private final MembershipTierSeeder membershipTierSeeder;
    private final TierRuleSeeder tierRuleSeeder;
    private final StaffSeeder staffSeeder;
    private final CustomerSeeder customerSeeder;
    private final WashBaySeeder washBaySeeder;
    private final VehicleSeeder vehicleSeeder;
    private final PromotionSeeder promotionSeeder;
    private final RewardSeeder rewardSeeder;
    private final StepAndHighlightSeeder stepAndHighlightSeeder;
    private final TimeSlotSeeder timeSlotSeeder;
    private final AvailableSlotSeeder availableSlotSeeder;
    private final BookingSeeder bookingSeeder;

    @Autowired
    public DataSeeder(VehicleTypeSeeder vehicleTypeSeeder, ServiceSeeder serviceSeeder,
            ServicePriceSeeder servicePriceSeeder, MembershipTierSeeder membershipTierSeeder,
            TierRuleSeeder tierRuleSeeder, StaffSeeder staffSeeder, CustomerSeeder customerSeeder,
            WashBaySeeder washBaySeeder, VehicleSeeder vehicleSeeder, PromotionSeeder promotionSeeder,
            RewardSeeder rewardSeeder, StepAndHighlightSeeder stepAndHighlightSeeder, TimeSlotSeeder timeSlotSeeder,
            AvailableSlotSeeder availableSlotSeeder, BookingSeeder bookingSeeder) {
        this.vehicleTypeSeeder = vehicleTypeSeeder;
        this.serviceSeeder = serviceSeeder;
        this.servicePriceSeeder = servicePriceSeeder;
        this.membershipTierSeeder = membershipTierSeeder;
        this.tierRuleSeeder = tierRuleSeeder;
        this.staffSeeder = staffSeeder;
        this.customerSeeder = customerSeeder;
        this.washBaySeeder = washBaySeeder;
        this.vehicleSeeder = vehicleSeeder;
        this.promotionSeeder = promotionSeeder;
        this.rewardSeeder = rewardSeeder;
        this.stepAndHighlightSeeder = stepAndHighlightSeeder;
        this.timeSlotSeeder = timeSlotSeeder;
        this.availableSlotSeeder = availableSlotSeeder;
        this.bookingSeeder = bookingSeeder;
    }

    @Override
    public void run(String... args) throws Exception {
        vehicleTypeSeeder.seed();
        serviceSeeder.seed();
        servicePriceSeeder.seed();
        stepAndHighlightSeeder.seed();
        membershipTierSeeder.seed();
        tierRuleSeeder.seed();
        staffSeeder.seed();
        customerSeeder.seed();
        washBaySeeder.seed();
        vehicleSeeder.seed();
        promotionSeeder.seed();
        rewardSeeder.seed();
        timeSlotSeeder.seed();
        availableSlotSeeder.seed();
        bookingSeeder.seed();
    }

}
