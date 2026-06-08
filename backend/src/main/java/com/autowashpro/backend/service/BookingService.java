package com.autowashpro.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.exception.CreateBookingException;
import com.autowashpro.backend.model.dto.BookingDetailResponse;
import com.autowashpro.backend.model.dto.BookingResponse;
import com.autowashpro.backend.model.dto.CreateBookingRequest;
import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.model.entity.BookingDetail;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.MembershipTier;
import com.autowashpro.backend.model.entity.Promotion;
import com.autowashpro.backend.model.entity.ServicePrice;
import com.autowashpro.backend.model.entity.Vehicle;
import com.autowashpro.backend.model.entity.WashBay;
import com.autowashpro.backend.model.enums.BookingStatus;
import com.autowashpro.backend.repository.BookingDetailRepository;
import com.autowashpro.backend.repository.BookingRepository;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.PromotionRepository;
import com.autowashpro.backend.repository.ServicePriceRepository;
import com.autowashpro.backend.repository.VehicleRepository;
import com.autowashpro.backend.repository.WashBayRepository;

import jakarta.transaction.Transactional;

@Service
public class BookingService {

        @Autowired
        private BookingRepository bookingRepository;

        @Autowired
        private PromotionRepository promotionRepository;

        @Autowired
        private WashBayRepository washBayRepository;

        @Autowired
        private BookingDetailRepository bookingDetailRepository;

        @Autowired
        private CustomerRepository customerRepository;

        @Autowired
        private VehicleRepository vehicleRepository;

        @Autowired
        private ServicePriceRepository servicePriceRepository;

        @Transactional
        public BookingResponse createBooking(String email, CreateBookingRequest request) {

                System.out.println("=====================================================");
                System.out.println("request: " + request);
                System.out.println("scheduledDateTime: " + request.getScheduledDateTime());
                System.out.println("=====================================================");
                

                // 1. Load customer + tier
                Customer customer = customerRepository.findByEmail(email)
                                .orElseThrow(() -> new CreateBookingException("Không tìm thấy khách hàng"));
                Long customerId = customer.getId();
                MembershipTier tier = customer.getTier();

                // 2. Validate booking window theo tier
                validateBookingWindows(tier, request.getScheduledDateTime());

                // 3. Validate vehicle thuộc customer và đang active
                Vehicle vehicle = vehicleRepository
                                .findByIdAndCustomerIdAndIsActiveTrue(request.getVehicleId(), customerId)
                                .orElseThrow(() -> new CreateBookingException(
                                                "Xe không tồn tại, đã bị vô hiệu hóa, hoặc không thuộc về bạn"));

                // 4. Load ServicePrices — phải active và đúng vehicleType của xe
                List<ServicePrice> servicePrices = servicePriceRepository
                                .findActiveByIdsAndVehicleTypeId(
                                                request.getServicePriceIds(),
                                                vehicle.getVehicleType().getId());

                if (servicePrices.size() != request.getServicePriceIds().size()) {
                        throw new CreateBookingException(
                                        "Một hoặc nhiều dịch vụ không hợp lệ, không còn hoạt động, hoặc không phù hợp với loại xe");
                }

                // 5. Tính estimatedEndTime
                int totalDurationMinutes = servicePrices.stream()
                                .mapToInt(sp -> sp.getService().getDurationMinutes())
                                .sum();
                LocalDateTime estimatedEndTime = request.getScheduledDateTime()
                                .plusMinutes(totalDurationMinutes);

                // 6. Tìm WashBay trống
                WashBay availableBay = washBayRepository
                                .findAvailableWashBays(request.getScheduledDateTime(), estimatedEndTime)
                                .stream()
                                .findFirst()
                                .orElseThrow(() -> new CreateBookingException(
                                                "Không có bay trống cho khung giờ này. Vui lòng chọn giờ khác"));

                // 7. Tìm promotion tốt nhất
                List<Long> serviceIds = servicePrices.stream()
                                .map(sp -> sp.getService().getId())
                                .toList();
                Promotion bestPromotion = findTheBestPromotion(customer, tier, serviceIds);

                // 8. Tính giá
                BigDecimal totalOriginalPrice = servicePrices.stream()
                                .map(ServicePrice::getPrice)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal totalDiscount = calculateDiscount(bestPromotion, totalOriginalPrice);
                BigDecimal totalFinalPrice = totalOriginalPrice.subtract(totalDiscount);

                // 9. Lưu Booking
                Booking booking = new Booking();
                booking.setCustomer(customer);
                booking.setVehicle(vehicle);
                booking.setScheduledDateTime(request.getScheduledDateTime());
                booking.setEstimatedEndTime(estimatedEndTime);
                booking.setStatus(BookingStatus.CONFIRMED);
                booking.setNotes(request.getNotes());
                booking.setBay(availableBay);
                booking.setPromotion(bestPromotion);
                bookingRepository.save(booking);

                // 10. Lưu BookingDetails
                List<BookingDetail> details = buildBookngDetails(
                                booking, servicePrices, totalOriginalPrice, totalDiscount, bestPromotion);
                bookingDetailRepository.saveAll(details);
                booking.setBookingDetails(details);

                return mapToResponse(booking, totalOriginalPrice, totalDiscount, totalFinalPrice);
        }

        /**
         * Helper methods
         */
        private void validateBookingWindows(MembershipTier tier, LocalDateTime scheduledDateTime) {
                LocalDateTime now = LocalDateTime.now();
                if (scheduledDateTime.isBefore(now)) {
                        throw new CreateBookingException("Lịch hẹn phải ở trước tương lai!");
                }

                LocalDateTime maxAllowed = now.plusDays(tier.getBookingWindowDays());

                if (scheduledDateTime.isAfter(maxAllowed)) {
                        throw new CreateBookingException("Hạng " +
                                        tier.getTierName() +
                                        " " +
                                        "của bạn chỉ cho phép đặt trước " +
                                        tier.getBookingWindowDays() +
                                        " " +
                                        "ngày!");
                }
        }

        private Promotion findTheBestPromotion(Customer customer, MembershipTier tier, List<Long> serviceIds) {
                List<Promotion> eligible = promotionRepository.findEligiblePromotion(
                                LocalDateTime.now(),
                                tier.getTierLevel(),
                                serviceIds,
                                customer.getId());

                if (eligible.isEmpty()) {
                        return null;
                }

                BigDecimal dummy = new BigDecimal("100");
                return eligible.stream()
                                .max(Comparator.comparing(p -> calculateDiscount(p, dummy)))
                                .orElse(null);

        }

        private BigDecimal calculateDiscount(Promotion promotion, BigDecimal basePrice) {
                if (promotion == null) {
                        return BigDecimal.ZERO;
                }

                return switch (promotion.getDiscountType()) {
                        case PERCENTAGE -> basePrice
                                        .multiply(promotion.getDiscountValue())
                                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

                        case FIXED_AMOUNT -> promotion
                                        .getDiscountValue()
                                        .min(basePrice); // không discount vượt giá gốc

                        case FREE_SERVICE -> basePrice;
                };
        }

        private List<BookingDetail> buildBookngDetails(
                        Booking booking,
                        List<ServicePrice> servicePrices,
                        BigDecimal totalOriginalPrice,
                        BigDecimal totalDiscount,
                        Promotion promotion) {

                List<BookingDetail> details = new ArrayList<>();
                BigDecimal discountAllocated = BigDecimal.ZERO;

                for (int i = 0; i < servicePrices.size(); i++) {
                        ServicePrice servicePrice = servicePrices.get(i);
                        boolean isLast = (i == servicePrices.size() - 1);

                        BigDecimal itemDiscount;
                        if (totalOriginalPrice.compareTo(BigDecimal.ZERO) == 0) {
                                itemDiscount = BigDecimal.ZERO;
                        } else if (isLast) {
                                itemDiscount = totalDiscount.subtract(discountAllocated);
                        } else {
                                itemDiscount = totalDiscount
                                                .multiply(servicePrice.getPrice())
                                                .divide(totalOriginalPrice, 2, RoundingMode.HALF_UP);
                        }

                        discountAllocated = discountAllocated.add(itemDiscount);

                        BookingDetail detail = new BookingDetail();
                        detail.setBooking(booking);
                        detail.setServicePrice(servicePrice);
                        detail.setPriceAtBooking(servicePrice.getPrice());
                        detail.setDiscountAmount(itemDiscount);
                        detail.setFinalPrice(servicePrice.getPrice().subtract(itemDiscount));
                        detail.setPromotion(promotion);
                        details.add(detail);
                }
                return details;
        }

        private BookingResponse mapToResponse(Booking booking,
                        BigDecimal totalOriginalPrice,
                        BigDecimal totalDiscount,
                        BigDecimal totalFinalPrice) {
                Promotion promo = booking.getPromotion();
                return BookingResponse.builder()
                                .id(booking.getId())
                                .customerName(booking.getCustomer().getFullName())
                                .vehicleLicensePlate(booking.getVehicle().getLicensePlate())
                                .vehicleTypeName(booking.getVehicle().getVehicleType().getTypeName())
                                .scheduledDateTime(booking.getScheduledDateTime())
                                .estimatedEndTime(booking.getEstimatedEndTime())
                                .bayName(booking.getBay().getName())
                                .status(booking.getStatus())
                                .notes(booking.getNotes())
                                .promotionName(promo != null ? promo.getPromotionName() : null)
                                .totalOriginalPrice(totalOriginalPrice)
                                .totalDiscount(totalDiscount)
                                .totalFinalPrice(totalFinalPrice)
                                .bookingDetails(booking.getBookingDetails().stream()
                                                .map(this::mapDetailToResponse)
                                                .toList())
                                .createdAt(booking.getCreatedAt())
                                .build();
        }

        private BookingDetailResponse mapDetailToResponse(BookingDetail detail) {
                Promotion promo = detail.getPromotion();
                return BookingDetailResponse.builder()
                                .servicePriceId(detail.getServicePrice().getId())
                                .serviceName(detail.getServicePrice().getService().getServiceName())
                                .vehicleTypeName(detail.getServicePrice().getVehicleType().getTypeName())
                                .priceAtBooking(detail.getPriceAtBooking())
                                .discountAmount(detail.getDiscountAmount())
                                .finalPrice(detail.getFinalPrice())
                                .promotionName(promo != null ? promo.getPromotionName() : null)
                                .build();
        }

}
