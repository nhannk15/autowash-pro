package com.autowashpro.backend.seeder;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.MembershipTier;
import com.autowashpro.backend.model.enums.Role;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.MembershipTierRepository;

@Component
public class CustomerSeeder {
    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private MembershipTierRepository membershipTierRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void seed() {
        if (customerRepository.count() > 0)
            return;

        MembershipTier bronze = membershipTierRepository.findByTierName("Bronze").orElseThrow();

        Customer c = new Customer();
        c.setEmail("lethuyavhs@gmail.com");
        c.setFullName("Lê Thị Thúy");
        c.setPhoneNumber("0844884762");
        c.setPassword(passwordEncoder.encode("12345678"));
        c.setRole(Role.CUSTOMER);
        c.setActive(true);
        c.setDateOfBirth(LocalDate.of(1995, 8, 20));
        c.setTier(bronze);
        c.setCurrentPoints(0L);
        c.setLifetimePoints(0L);
        c.setTierStartDate(LocalDate.now());
        c.setTierEndDate(LocalDate.now().plusYears(1));
        c.setNextReviewDate(LocalDate.now().plusMonths(6));
        customerRepository.save(c);

        Customer d = new Customer();
        d.setEmail("nhannk2101@gmail.com");
        d.setFullName("Nguyễn Khắc Lê Nhân");
        d.setPhoneNumber("0912176662");
        d.setPassword(passwordEncoder.encode("12345678"));
        d.setRole(Role.CUSTOMER);
        d.setActive(true);
        d.setDateOfBirth(LocalDate.of(2006, 1, 21));
        d.setTier(bronze);
        d.setCurrentPoints(0L);
        d.setLifetimePoints(0L);
        d.setTierStartDate(LocalDate.now());
        d.setTierEndDate(LocalDate.now().plusYears(1));
        d.setNextReviewDate(LocalDate.now().plusMonths(6));
        customerRepository.save(d);
    }
}
