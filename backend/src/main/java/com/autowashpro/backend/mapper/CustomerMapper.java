package com.autowashpro.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.CustomerTierResponse;
import com.autowashpro.backend.model.dto.WashBayCustomerResponse;
import com.autowashpro.backend.model.entity.Customer;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, uses = MembershipTierMapper.class)
public interface CustomerMapper {
    void updateCustomerFromRequest(Customer source, @MappingTarget Customer target);

    WashBayCustomerResponse toWashBayCustomerResponse(Customer customer);

    @Mapping(target = "customerId", source = "id")
    @Mapping(target = "customerCurrentPoints", source = "currentPoints")
    @Mapping(target = "membershipTierSummaryResponse", source = "tier")
    CustomerTierResponse toCustomerTierResponse(Customer customer);
}
