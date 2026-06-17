package com.autowashpro.backend.mapper;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.CurrentSessionResponse;
import com.autowashpro.backend.model.dto.WashSessionResponse;
import com.autowashpro.backend.model.entity.AvailableSlot;
import com.autowashpro.backend.model.entity.BookingDetail;
import com.autowashpro.backend.model.entity.WashSession;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, uses = {
        VehicleMapper.class, CustomerMapper.class })
public interface WashSessionMapper {
    void updateWashSessionFromRequest(WashSession source, @MappingTarget WashSession target);

    @Mapping(target = "bookingId", source = "booking.id")
    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerFullName", source = "customer.fullName")
    @Mapping(target = "vehicleResponse", source = "vehicle")
    @Mapping(target = "servicePriceId", source = "servicePrice.id")
    @Mapping(target = "serviceName", source = "servicePrice.service.serviceName")
    @Mapping(target = "staffId", source = "staff.id")
    @Mapping(target = "createdByStaff", source = "staff.fullName")
    @Mapping(target = "washSessionStatus", source = "status")
    @Mapping(target = "washBay", source = "bay.name")
    @Mapping(target = "scheduledDate", source = "booking.availableSlots", qualifiedByName = "toScheduledDate")
    @Mapping(target = "scheduledStartTime", source = "booking.availableSlots", qualifiedByName = "toScheduledStartTime")
    @Mapping(target = "scheduledEndTime", source = "booking.availableSlots", qualifiedByName = "toScheduledEndTime")
    WashSessionResponse toRepsonse(WashSession washSession);

    List<WashSessionResponse> toResponseList(List<WashSession> washSessions);

    @Named("toScheduledDate")
    default LocalDate toScheduledDate(List<AvailableSlot> slots) {
        if (slots == null || slots.isEmpty()) {
            return null;
        }
        return slots.get(0).getSlotDate();
    }

    @Named("toScheduledStartTime")
    default LocalTime toScheduledStartTime(List<AvailableSlot> slots) {
        if (slots == null || slots.isEmpty()) {
            return null;
        }
        return slots.get(0).getTimeSlot().getStartTime();
    }

    @Named("toScheduledEndTime")
    default LocalTime toScheduledEndTime(List<AvailableSlot> slots) {
        if (slots == null || slots.isEmpty()) {
            return null;
        }
        return slots.getLast().getTimeSlot().getEndTime();
    }

    @Mapping(target = "services", source = "booking.bookingDetails", qualifiedByName = "toServiceNames")
    @Mapping(target = "bookingId", source = "booking.id")
    CurrentSessionResponse toCurrentSessionResponse(WashSession washSession);

    @Named("toServiceNames")
    default List<String> toServiceNames(List<BookingDetail> bookingDetails) {
        if (bookingDetails == null || bookingDetails.size() == 0) {
            return List.of();
        }
        return bookingDetails.stream()
                .map(bookingDetail -> bookingDetail.getServicePrice().getService().getServiceName()).toList();
    }
}
