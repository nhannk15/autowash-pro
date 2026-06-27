package com.autowashpro.backend.mapper;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.BookingResponse;
import com.autowashpro.backend.model.dto.PendingBookingResponse;
import com.autowashpro.backend.model.dto.UpcomingBookingResponse;
import com.autowashpro.backend.model.entity.AvailableSlot;
import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.model.entity.WashSession;
import com.autowashpro.backend.model.enums.WashSessionStatus;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, uses = {
        VehicleMapper.class, CustomerMapper.class, BookingDetailMapper.class, PromotionMapper.class,
        VoucherMapper.class })
public interface BookingMapper {
    void updateBookingFromRequest(Booking source, @MappingTarget Booking target);

    @Mapping(target = "slotDate", source = "availableSlots", qualifiedByName = "toSlotDate")
    @Mapping(target = "startTime", source = "availableSlots", qualifiedByName = "toStartTime")
    @Mapping(target = "endTime", source = "availableSlots", qualifiedByName = "toEndTime")
    UpcomingBookingResponse toUpcomingBookingResponse(Booking booking);

    @Named("toSlotDate")
    default LocalDate toSlotDate(List<AvailableSlot> availableSlots) {
        if (availableSlots == null || availableSlots.isEmpty()) {
            return null;
        }
        return availableSlots.getFirst().getSlotDate();
    }

    @Named("toStartTime")
    default LocalTime toStartTime(List<AvailableSlot> availableSlots) {
        if (availableSlots == null || availableSlots.isEmpty()) {
            return null;
        }
        return availableSlots.getFirst().getTimeSlot().getStartTime();
    }

    @Named("toEndTime")
    default LocalTime toEndDate(List<AvailableSlot> availableSlots) {
        if (availableSlots == null || availableSlots.isEmpty()) {
            return null;
        }
        return availableSlots.getLast().getTimeSlot().getEndTime();
    }

    List<UpcomingBookingResponse> toUpcomingBookingResponses(List<Booking> bookings);

    @Mapping(target = "slotDate", source = "availableSlots", qualifiedByName = "toSlotDate")
    @Mapping(target = "startTime", source = "availableSlots", qualifiedByName = "toStartTime")
    @Mapping(target = "endTime", source = "availableSlots", qualifiedByName = "toEndTime")
    @Mapping(target = "washBay", source = "washSessions", qualifiedByName = "toWashBayName")
    @Mapping(target = "washSessionStatus", source = "washSessions", qualifiedByName = "toWashSessionStatus")
    BookingResponse toBookingResponse(Booking booking);

    @Named("toWashBayName")
    default String toWashBayName(List<WashSession> washSessions) {
        if (washSessions == null || washSessions.isEmpty()) {
            return null;
        }
        return washSessions.getFirst().getBay().getName().toString();
    }

    @Named("toWashSessionStatus")
    default WashSessionStatus toWashSessionStatus(List<WashSession> washSessions) {
        if (washSessions == null || washSessions.isEmpty()) {
            return null;
        }
        return washSessions.getFirst().getStatus();
    }

    List<BookingResponse> toBookingResponses(List<Booking> bookings);

    @Mapping(target = "slotDate", source = "availableSlots", qualifiedByName = "toSlotDate")
    @Mapping(target = "startTime", source = "availableSlots", qualifiedByName = "toStartTime")
    @Mapping(target = "endTime", source = "availableSlots", qualifiedByName = "toEndTime")
    @Mapping(target = "billingId", source = "billing.id")
    PendingBookingResponse toPendingBookingResponse(Booking booking);
    List<PendingBookingResponse> toPendingBookingResponses(List<Booking> bookings);
}
