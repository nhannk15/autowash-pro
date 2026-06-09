package com.autowashpro.backend.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.exception.ExceedBookingWindowException;
import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.model.dto.BookingDetailResponse;
import com.autowashpro.backend.model.dto.CreateBookingRequest;
import com.autowashpro.backend.model.dto.CreateBookingResponse;
import com.autowashpro.backend.model.dto.SlotAvailabilityByDateResponse;
import com.autowashpro.backend.model.dto.TimeSlotAvailabilityResponse;
import com.autowashpro.backend.model.entity.AvailableSlot;
import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.model.entity.BookingDetail;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.MembershipTier;
import com.autowashpro.backend.model.entity.Promotion;
import com.autowashpro.backend.model.entity.ServicePrice;
import com.autowashpro.backend.model.entity.TimeSlot;
import com.autowashpro.backend.model.entity.Vehicle;
import com.autowashpro.backend.model.entity.WashBay;
import com.autowashpro.backend.model.enums.BookingStatus;
import com.autowashpro.backend.model.enums.PromotionDiscountType;
import com.autowashpro.backend.repository.AvailableSlotRepository;
import com.autowashpro.backend.repository.BookingDetailRepository;
import com.autowashpro.backend.repository.BookingRepository;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.PromotionRepository;
import com.autowashpro.backend.repository.ServicePriceRepository;
import com.autowashpro.backend.repository.TimeSlotRepository;
import com.autowashpro.backend.repository.VehicleRepository;

@Service
public class BookingService {

        private static final int SLOT_DURATION = 60;

        @Autowired
        private CustomerRepository customerRepository;

        @Autowired
        private ServicePriceRepository servicePriceRepository;

        @Autowired
        private AvailableSlotRepository availableSlotRepository;

        @Autowired
        private TimeSlotRepository timeSlotRepository;

        @Autowired
        private VehicleRepository vehicleRepository;

        @Autowired
        private PromotionRepository promotionRepository;

        @Autowired
        private BookingRepository bookingRepository;

        @Autowired
        private BookingDetailRepository bookingDetailRepository;

        public SlotAvailabilityByDateResponse getAvailableTimeSlots(LocalDate date) {
                List<TimeSlotAvailabilityResponse> timeSlots = getAvailableTimeSlot(date);
                return SlotAvailabilityByDateResponse
                                .builder()
                                .date(date)
                                .timeSlotAvailabilityResponses(timeSlots)
                                .build();
        }

        public List<TimeSlotAvailabilityResponse> getAvailableTimeSlot(LocalDate date) {
                return availableSlotRepository.findTimeSlotAvailability(date)
                                .stream()
                                .map(row -> TimeSlotAvailabilityResponse
                                                .builder()
                                                .timeSlotId((Long) row[0])
                                                .startTime((LocalTime) row[1])
                                                .endTime((LocalTime) row[2])
                                                .totalBayCount(((Number) row[3]).intValue())
                                                .availableBayCount(((Number) row[4]).intValue())
                                                .isAvailable(((Number) row[4]).intValue() > 0)
                                                .build())
                                .toList();
        }

        public CreateBookingResponse createBooking(CreateBookingRequest createBookingRequest) {
                Customer customer = customerRepository.findById(createBookingRequest.getCustomerId())
                                .orElseThrow(() -> new UserNotFoundException("Customer not found!"));
                /**
                 * Step 1. Check booking windows day.
                 */
                MembershipTier customerMembership = customer.getTier();
                int bookingWindowDays = customerMembership.getBookingWindowDays();
                LocalDate now = LocalDate.now();
                LocalDate bookingDay = createBookingRequest.getBookingDate();
                long dayBeetween = ChronoUnit.DAYS.between(now, bookingDay);
                if (bookingWindowDays < dayBeetween) {
                        throw new ExceedBookingWindowException("Your tier " +
                                        customerMembership.getTierName() +
                                        " can't book over " + customerMembership.getBookingWindowDays() +
                                        " days");
                }

                /**
                 * Step 2. Calculate the sum of all the services and the total slots needed.
                 */
                List<ServicePrice> servicePrices = servicePriceRepository
                                .findAllById(createBookingRequest.getServicePriceIds());
                int totalDuration = servicePrices.stream()
                                .mapToInt(sp -> sp.getService().getDurationMinutes())
                                .sum();
                int slotsNeeded = (int) Math.ceil((double) totalDuration / SLOT_DURATION);

                /**
                 * Step 3. Get all the succcessive slots start from the selected slot.
                 */
                TimeSlot startTimeSlot = timeSlotRepository.findById(createBookingRequest.getTimeSlotId())
                                .orElseThrow(() -> new RuntimeException("Time slot not found"));

                List<AvailableSlot> consecutiveSlots = availableSlotRepository.findConsecutiveSlotsFromDate(bookingDay,
                                startTimeSlot.getId(), slotsNeeded);
                if (consecutiveSlots.size() < slotsNeeded) {
                        throw new RuntimeException("Not enough consecutive slots avalable");
                }

                /**
                 * Step 4. Check if the consecutive slots are available.
                 */
                boolean anyBooked = consecutiveSlots
                                .stream()
                                .anyMatch(slot -> slot.getBooking() != null);
                if (anyBooked) {
                        throw new RuntimeException("One or more executive slots have been booked");
                }

                /**
                 * Step 5. Find applicable promotions.
                 */
                List<Promotion> applicablePromotions = promotionRepository.findApplicablePromotions(
                                bookingDay.atStartOfDay(),
                                customerMembership.getId());
                Promotion promotion = applicablePromotions.size() == 0 ? null : applicablePromotions.get(0);

                /**
                 * Step 6. Find the first available WashBay to assign.
                 */
                WashBay washBay = consecutiveSlots.get(0).getWashBay();

                /**
                 * Step 7. Create Booking.
                 */
                Vehicle vehicle = vehicleRepository.findById(createBookingRequest.getVehicleId())
                                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
                Booking booking = Booking
                                .builder()
                                .customer(customer)
                                .vehicle(vehicle)
                                .status(BookingStatus.CONFIRMED)
                                .notes(createBookingRequest.getNotes())
                                .promotion(promotion)
                                .build();
                Booking savedBooking = bookingRepository.save(booking);

                /**
                 * Step 8. Create Booking Detail for each Service.
                 */
                List<BookingDetail> savedDetails = new ArrayList<>();
                for (ServicePrice servicePrice : servicePrices) {
                        BigDecimal priceAtBooking = servicePrice.getPrice();
                        BigDecimal discountAmount = BigDecimal.ZERO;
                        BigDecimal finalPrice = priceAtBooking;

                        if (promotion != null) {
                                if (promotion.getDiscountType() == PromotionDiscountType.PERCENTAGE) {
                                        discountAmount = priceAtBooking
                                                        .multiply(promotion.getDiscountValue())
                                                        .divide(new BigDecimal("100"));
                                } else if (promotion.getDiscountType() == PromotionDiscountType.FIXED_AMOUNT) {
                                        discountAmount = promotion.getDiscountValue();
                                }
                                finalPrice = priceAtBooking.subtract(discountAmount).max(BigDecimal.ZERO);
                        }

                        BookingDetail detail = new BookingDetail();
                        detail.setBooking(savedBooking);
                        detail.setServicePrice(servicePrice);
                        detail.setPriceAtBooking(priceAtBooking);
                        detail.setDiscountAmount(discountAmount);
                        detail.setFinalPrice(finalPrice);
                        detail.setPromotion(promotion);
                        savedDetails.add(bookingDetailRepository.save(detail));
                }

                /**
                 * Step 9. Lock all the consecutive slots and attach booking to it.
                 */
                for (AvailableSlot slot : consecutiveSlots) {
                        slot.setBooking(savedBooking);
                        availableSlotRepository.save(slot);
                }

                /**
                 * Step 10. Build and return response.
                 */
                BigDecimal totalOriginalPrice = savedDetails.stream()
                                .map(BookingDetail::getPriceAtBooking)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal totalDiscount = savedDetails.stream()
                                .map(BookingDetail::getDiscountAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                BigDecimal totalFinalPrice = savedDetails.stream()
                                .map(BookingDetail::getFinalPrice)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                List<BookingDetailResponse> bookingDetailResponses = savedDetails.stream()
                                .map(detail -> BookingDetailResponse.builder()
                                                .servicePriceId(detail.getServicePrice().getId())
                                                .serviceName(detail.getServicePrice().getService().getServiceName())
                                                .vehicleTypeName(
                                                                detail.getServicePrice().getVehicleType().getTypeName())
                                                .priceAtBooking(detail.getPriceAtBooking())
                                                .discountAmount(detail.getDiscountAmount())
                                                .finalPrice(detail.getFinalPrice())
                                                .promotionName(detail.getPromotion() != null
                                                                ? detail.getPromotion().getPromotionName()
                                                                : null)
                                                .build())
                                .toList();

                return CreateBookingResponse.builder()
                                .id(savedBooking.getId())
                                .customerName(customer.getFullName())
                                .vehicleLicensePlate(vehicle.getLicensePlate())
                                .vehicleTypeName(vehicle.getVehicleType().getTypeName())
                                .bayName(washBay.getName())
                                .status(savedBooking.getStatus())
                                .notes(savedBooking.getNotes())
                                .promotionName(promotion != null ? promotion.getPromotionName() : null)
                                .totalOriginalPrice(totalOriginalPrice)
                                .totalDiscount(totalDiscount)
                                .totalFinalPrice(totalFinalPrice)
                                .bookingDetails(bookingDetailResponses)
                                .createdAt(savedBooking.getCreatedAt())
                                .build();
        }

}
