package com.autowashpro.backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.BookingDetailResponse;
import com.autowashpro.backend.model.entity.BookingDetail;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface BookingDetailMapper {
    void updateBookingDetailFromRequest(BookingDetail source, @MappingTarget BookingDetail target);

    @Mapping(target = "servicePriceId", source = "servicePrice.id")
    @Mapping(target = "serviceName", source = "servicePrice.service.serviceName")
    @Mapping(target = "vehicleTypeName", source = "servicePrice.vehicleType.typeName")
    @Mapping(target = "promotionName", source = "promotion.promotionName")
    BookingDetailResponse toBookingDetailResponse(BookingDetail bookingDetail);

    List<BookingDetailResponse> tBookingDetailResponses(List<BookingDetail> bookingDetails);
}
