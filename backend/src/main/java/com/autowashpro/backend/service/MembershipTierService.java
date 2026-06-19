package com.autowashpro.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import com.autowashpro.backend.exception.ResourceNotFoundException;
import com.autowashpro.backend.model.dto.MembershipTierRequest;
import com.autowashpro.backend.model.dto.MembershipTierResponse;
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
    private final PointTransactionService pointTransactionService;

    @Autowired
    public MembershipTierService(MembershipTierRepository membershipTierRepository, CustomerMapper customerMapper,
            CustomerRepository customerRepository, PointTransactionService pointTransactionService) {
        this.membershipTierRepository = membershipTierRepository;
        this.customerMapper = customerMapper;
        this.customerRepository = customerRepository;
        this.pointTransactionService = pointTransactionService;
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
        customerTierResponse.setDeltaPoints(pointTransactionService.calculateTotalPointsEarnForCustomer(customer.getId()));
        return customerTierResponse;
    }

    public List<MembershipTierResponse> getAllTiers() {
        return membershipTierRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public MembershipTierResponse getTierById(Long id) {
        MembershipTier tier = membershipTierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership tier not found with id: " + id));
        return mapToResponse(tier);
    }

    public MembershipTierResponse updateTier(Long id, MembershipTierRequest request) {
        MembershipTier tier = membershipTierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership tier not found with id: " + id));

        tier.setBookingWindowDays(request.getBookingWindowDays());
        tier.setPointEarnRate(request.getPointEarnRate());
        tier.setMinPointsToMaintain(request.getMinPointsToMaintain());
        tier.setPointExpirationMonths(request.getPointExpirationMonths());
        tier.setPerksDescription(request.getPerksDescription());

        tier = membershipTierRepository.save(tier);
        return mapToResponse(tier);
    }

    private MembershipTierResponse mapToResponse(MembershipTier tier) {
        MembershipTierResponse response = new MembershipTierResponse();
        response.setId(tier.getId());
        response.setTierName(tier.getTierName());
        response.setTierLevel(tier.getTierLevel());
        response.setBookingWindowDays(tier.getBookingWindowDays());
        response.setPointEarnRate(tier.getPointEarnRate());
        response.setMinPointsToMaintain(tier.getMinPointsToMaintain());
        response.setPointExpirationMonths(tier.getPointExpirationMonths());
        response.setPerksDescription(tier.getPerksDescription());
        response.setPriorityQueueOrder(tier.getPriorityQueueOrder());
        return response;
    }

}
