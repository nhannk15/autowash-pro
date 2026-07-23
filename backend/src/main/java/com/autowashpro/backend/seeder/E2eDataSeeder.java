package com.autowashpro.backend.seeder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.MembershipTier;
import com.autowashpro.backend.model.entity.Promotion;
import com.autowashpro.backend.model.entity.Staff;
import com.autowashpro.backend.model.entity.Vehicle;
import com.autowashpro.backend.model.entity.VehicleType;
import com.autowashpro.backend.model.enums.PromotionDiscountType;
import com.autowashpro.backend.model.enums.Role;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.MembershipTierRepository;
import com.autowashpro.backend.repository.PromotionRepository;
import com.autowashpro.backend.repository.StaffRepository;
import com.autowashpro.backend.repository.VehicleRepository;
import com.autowashpro.backend.repository.VehicleTypeRepository;

@Component
@Profile("e2e")
public class E2eDataSeeder implements CommandLineRunner {

    private final VehicleTypeSeeder vehicleTypeSeeder;
    private final ServiceSeeder serviceSeeder;
    private final ServicePriceSeeder servicePriceSeeder;
    private final MembershipTierSeeder membershipTierSeeder;
    private final WashBaySeeder washBaySeeder;
    private final TimeSlotSeeder timeSlotSeeder;
    private final AvailableSlotSeeder availableSlotSeeder;
    private final RewardSeeder rewardSeeder;
    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final MembershipTierRepository membershipTierRepository;
    private final PromotionRepository promotionRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${e2e.seed.customer-email:e2e.customer@gmail.com}")
    private String customerEmail;

    @Value("${e2e.seed.customer-password:e2e-password-123}")
    private String customerPassword;

    @Value("${e2e.seed.staff-email:e2e.staff@gmail.com}")
    private String staffEmail;

    @Value("${e2e.seed.staff-password:e2e-password-123}")
    private String staffPassword;

    @Value("${e2e.seed.admin-email:e2e.admin@gmail.com}")
    private String adminEmail;

    @Value("${e2e.seed.admin-password:e2e-password-123}")
    private String adminPassword;

    @Value("${e2e.seed.inactive-email:e2e.inactive@gmail.com}")
    private String inactiveEmail;

    public E2eDataSeeder(VehicleTypeSeeder vehicleTypeSeeder, ServiceSeeder serviceSeeder,
            ServicePriceSeeder servicePriceSeeder, MembershipTierSeeder membershipTierSeeder,
            WashBaySeeder washBaySeeder, TimeSlotSeeder timeSlotSeeder,
            AvailableSlotSeeder availableSlotSeeder, RewardSeeder rewardSeeder,
            CustomerRepository customerRepository, StaffRepository staffRepository,
            VehicleRepository vehicleRepository, VehicleTypeRepository vehicleTypeRepository,
            MembershipTierRepository membershipTierRepository, PromotionRepository promotionRepository,
            PasswordEncoder passwordEncoder) {
        this.vehicleTypeSeeder = vehicleTypeSeeder;
        this.serviceSeeder = serviceSeeder;
        this.servicePriceSeeder = servicePriceSeeder;
        this.membershipTierSeeder = membershipTierSeeder;
        this.washBaySeeder = washBaySeeder;
        this.timeSlotSeeder = timeSlotSeeder;
        this.availableSlotSeeder = availableSlotSeeder;
        this.rewardSeeder = rewardSeeder;
        this.customerRepository = customerRepository;
        this.staffRepository = staffRepository;
        this.vehicleRepository = vehicleRepository;
        this.vehicleTypeRepository = vehicleTypeRepository;
        this.membershipTierRepository = membershipTierRepository;
        this.promotionRepository = promotionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (customerRepository.count() > 0) return;

        vehicleTypeSeeder.seed();
        serviceSeeder.seed();
        servicePriceSeeder.seed();
        membershipTierSeeder.seed();
        washBaySeeder.seed();
        timeSlotSeeder.seed();
        rewardSeeder.seed();

        MembershipTier bronze = membershipTierRepository.findByTierName("Bronze").orElseThrow();
        Customer customer = createCustomer(customerEmail, customerPassword, "E2E Customer", true, bronze, 1_500L);
        createCustomer("e2e.no-car@gmail.com", customerPassword, "E2E Customer No Car", true, bronze, 0L);
        Customer otherCustomer = createCustomer("e2e.other@gmail.com", customerPassword,
                "E2E Other Customer", true, bronze, 0L);
        createCustomer(inactiveEmail, customerPassword, "E2E Inactive Customer", false, bronze, 0L);

        Staff staff = createStaff(staffEmail, staffPassword, "E2E Staff", Role.STAFF);
        Staff admin = createStaff(adminEmail, adminPassword, "E2E Admin", Role.ADMIN);

        VehicleType sedan = vehicleTypeRepository.findByTypeName("SEDAN").orElseThrow();
        Vehicle vehicle = new Vehicle();
        vehicle.setCustomer(customer);
        vehicle.setVehicleType(sedan);
        vehicle.setLicensePlate("E2E-00001");
        vehicle.setBrand("Toyota");
        vehicle.setModel("Camry E2E");
        vehicle.setColor("White");
        vehicleRepository.save(vehicle);

        Vehicle otherVehicle = new Vehicle();
        otherVehicle.setCustomer(otherCustomer);
        otherVehicle.setVehicleType(sedan);
        otherVehicle.setLicensePlate("E2E-00002");
        otherVehicle.setBrand("Honda");
        otherVehicle.setModel("Civic E2E");
        otherVehicle.setColor("Black");
        vehicleRepository.save(otherVehicle);

        createPromotion(admin, "E2E Active Promotion", LocalDateTime.now().minusDays(1),
                LocalDateTime.now().plusDays(30), true);
        createPromotion(admin, "E2E Future Promotion", LocalDateTime.now().plusDays(10),
                LocalDateTime.now().plusDays(20), true);
        createPromotion(admin, "E2E Expired Promotion", LocalDateTime.now().minusDays(20),
                LocalDateTime.now().minusDays(10), false);

        availableSlotSeeder.seed();
    }

    private Customer createCustomer(String email, String password, String fullName, boolean active,
            MembershipTier tier, long points) {
        Customer customer = new Customer();
        customer.setEmail(email);
        customer.setPassword(passwordEncoder.encode(password));
        customer.setFullName(fullName);
        customer.setPhoneNumber("090000000" + customerRepository.count());
        customer.setBirthday(LocalDate.of(1995, 1, 1));
        customer.setDateOfBirth(LocalDate.of(1995, 1, 1));
        customer.setRole(Role.CUSTOMER);
        customer.setActive(active);
        customer.setTier(tier);
        customer.setCurrentPoints(points);
        customer.setLifetimePoints(points);
        customer.setTierStartDate(LocalDate.now());
        return customerRepository.save(customer);
    }

    private Staff createStaff(String email, String password, String fullName, Role role) {
        Staff staff = new Staff();
        staff.setEmail(email);
        staff.setPassword(passwordEncoder.encode(password));
        staff.setFullName(fullName);
        staff.setPhoneNumber(role == Role.ADMIN ? "0911111111" : "0922222222");
        staff.setBirthday(LocalDate.of(1990, 1, 1));
        staff.setRole(role);
        staff.setActive(true);
        staff.setHiredDate(LocalDate.now().minusYears(1));
        return staffRepository.save(staff);
    }

    private void createPromotion(Staff admin, String name, LocalDateTime start, LocalDateTime end,
            boolean active) {
        Promotion promotion = new Promotion();
        promotion.setPromotionName(name);
        promotion.setDescription("Deterministic E2E promotion");
        promotion.setStartDate(start);
        promotion.setEndDate(end);
        promotion.setDiscountType(PromotionDiscountType.PERCENTAGE);
        promotion.setDiscountValue(new BigDecimal("10"));
        promotion.setMaxUsesTotal(1_000L);
        promotion.setMaxUsesPerCustomer(10L);
        promotion.setUsageCount(0L);
        promotion.setActive(active);
        promotion.setStaff(admin);
        promotionRepository.saveAndFlush(promotion);
        promotion.setActive(active);
        promotionRepository.save(promotion);
    }
}
