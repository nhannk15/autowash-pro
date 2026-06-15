package com.autowashpro.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.WashBayCustomerResponse;
import com.autowashpro.backend.model.entity.Customer;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface CustomerMapper {
    void updateCustomerFromRequest(Customer source, @MappingTarget Customer target);

    WashBayCustomerResponse toWashBayCustomerResponse(Customer customer);
}
