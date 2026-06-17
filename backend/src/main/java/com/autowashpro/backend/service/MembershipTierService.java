package com.autowashpro.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.mapper.CustomerMapper;
import com.autowashpro.backend.model.dto.CustomerTierResponse;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.MembershipTier;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.MembershipTierRepository;

@Service
public class MembershipTierService {

    private final MembershipTierRepository membershipTierRepository;
    private final CustomerMapper customerMapper;
    private final CustomerRepository customerRepository;

    @Autowired
    public MembershipTierService(MembershipTierRepository membershipTierRepository, CustomerMapper customerMapper,
            CustomerRepository customerRepository) {
        this.membershipTierRepository = membershipTierRepository;
        this.customerMapper = customerMapper;
        this.customerRepository = customerRepository;
    }

    public CustomerTierResponse getCustomerMembershipTier(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không thể tìm thấy khách hàng"));
        
        MembershipTier nextTier = membershipTierRepository.findByTierLevel(customer.getTier().getTierLevel() + 1)
                .orElse(null);
        String nextTierName = "";
        if (nextTier == null) {
            nextTierName = "Đã đạt mức rank cao nhất";
        } else {
            nextTierName = nextTier.getTierName();
        }
        CustomerTierResponse customerTierResponse = customerMapper.toCustomerTierResponse(customer);
        customerTierResponse.getMembershipTierSummaryResponse().setNextTierName(nextTierName);
        return customerTierResponse;
    }

}
