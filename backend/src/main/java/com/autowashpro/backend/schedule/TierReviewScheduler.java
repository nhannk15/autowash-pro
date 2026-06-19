package com.autowashpro.backend.schedule;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.MembershipTier;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.MembershipTierRepository;
import com.autowashpro.backend.service.PointTransactionService;

@Component
public class TierReviewScheduler implements TaskScheduler {

    private final CustomerRepository customerRepository;
    private final PointTransactionService pointTransactionService;
    private final MembershipTierRepository membershipTierRepository;

    @Autowired
    public TierReviewScheduler(CustomerRepository customerRepository, PointTransactionService pointTransactionService,
            MembershipTierRepository membershipTierRepository) {
        this.customerRepository = customerRepository;
        this.pointTransactionService = pointTransactionService;
        this.membershipTierRepository = membershipTierRepository;
    }

    @Scheduled(cron = "0 0 0 1 1,4,7,10 *")
    @Override
    public void doScheduleTask() {
        List<Customer> customers = customerRepository.findAll();
        if (customers.isEmpty()) {
            return;
        }

        for (Customer customer : customers) {
            MembershipTier customerMembershipTier = customer.getTier();
            Long totalPointsEarned = pointTransactionService.calculateTotalPointsEarnForCustomer(customer.getId());
            if (totalPointsEarned == null) {
                totalPointsEarned = 0L;
            }
            if (totalPointsEarned >= customerMembershipTier.getMinPointsForNextTier()) {
                if (customerMembershipTier.getTierLevel() == 4) {
                    // --- Do nothing.
                } else {
                    MembershipTier nextTier = membershipTierRepository
                            .findByTierLevel(customerMembershipTier.getTierLevel() + 1).get();
                    customer.setTier(nextTier);
                    customerRepository.save(customer);
                }
            } else if (totalPointsEarned >= customerMembershipTier.getMinPointsToMaintain()) {
                //--- Do nothing
            } else {
                if (customerMembershipTier.getTierLevel() == 1) {
                    // --- Do nothing.
                } else {
                    MembershipTier nextTier = membershipTierRepository
                            .findByTierLevel(customerMembershipTier.getTierLevel() - 1).get();
                    customer.setTier(nextTier);
                    customer.setLastReviewDate(LocalDate.now());
                    customerRepository.save(customer);
                }
            }
        }
    }

}
