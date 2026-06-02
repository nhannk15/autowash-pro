package com.autowashpro.backend.seeder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private VehicleTypeSeeder vehicleTypeSeeder;

    @Autowired
    private ServiceSeeder serviceSeeder;

    @Autowired
    private ServicePriceSeeder servicePriceSeeder;

    @Autowired
    private MembershipTierSeeder membershipTierSeeder;

    @Autowired
    private TierRuleSeeder tierRuleSeeder;

    @Autowired
    private StaffSeeder staffSeeder;

    @Autowired
    private CustomerSeeder customerSeeder;

    @Autowired
    private WashBaySeeder washBaySeeder;


    @Autowired
    private VehicleSeeder vehicleSeeder;

    @Autowired
    private PromotionSeeder promotionSeeder;

    @Autowired
    private RewardSeeder rewardSeeder;

    @Override
    public void run(String... args) throws Exception {
        vehicleTypeSeeder.seed();
        serviceSeeder.seed();
        servicePriceSeeder.seed();
        membershipTierSeeder.seed();
        tierRuleSeeder.seed();
        staffSeeder.seed();
        customerSeeder.seed();
        washBaySeeder.seed();
        vehicleSeeder.seed();
        promotionSeeder.seed();
        rewardSeeder.seed();
    }

}
