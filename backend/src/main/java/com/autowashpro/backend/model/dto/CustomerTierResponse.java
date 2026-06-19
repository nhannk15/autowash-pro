package com.autowashpro.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CustomerTierResponse {
    
    /**
     * Customer info
     */
    private Long customerId;
    private Long customerCurrentPoints;
    private Long lifetimePoints;
    private Long deltaPoints;

    /**
     * Membership info
     */
    private MembershipTierSummaryResponse membershipTierSummaryResponse;

}
