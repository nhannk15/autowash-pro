package com.autowashpro.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.exception.BookingNotFoundException;
import com.autowashpro.backend.exception.ExceedBookingWindowException;
import com.autowashpro.backend.exception.SlotInavailabilityException;
import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.exception.WashBayInavailableException;
import com.autowashpro.backend.mapper.BookingMapper;
import com.autowashpro.backend.model.dto.BookingDetailResponse;
import com.autowashpro.backend.model.dto.BookingResponse;
import com.autowashpro.backend.model.dto.CreateBookingRequest;
import com.autowashpro.backend.model.dto.CreateBookingResponse;
import com.autowashpro.backend.model.dto.SlotAvailabilityByDateResponse;
import com.autowashpro.backend.model.dto.TimeSlotAvailabilityResponse;
import com.autowashpro.backend.model.dto.UpcomingBookingResponse;
import com.autowashpro.backend.model.entity.AvailableSlot;
import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.model.entity.BookingDetail;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.MembershipTier;
import com.autowashpro.backend.model.entity.Promotion;
import com.autowashpro.backend.model.entity.ServicePrice;
import com.autowashpro.backend.model.entity.TimeSlot;
import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.model.entity.Vehicle;
import com.autowashpro.backend.model.entity.WashBay;
import com.autowashpro.backend.model.entity.WashSession;
import com.autowashpro.backend.model.enums.BayStatus;
import com.autowashpro.backend.model.enums.BookingStatus;
import com.autowashpro.backend.model.enums.PromotionDiscountType;
import com.autowashpro.backend.model.enums.Role;
import com.autowashpro.backend.model.enums.WashSessionStatus;
import com.autowashpro.backend.repository.AvailableSlotRepository;
import com.autowashpro.backend.repository.BookingDetailRepository;
import com.autowashpro.backend.repository.BookingRepository;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.PromotionRepository;
import com.autowashpro.backend.repository.ServicePriceRepository;
import com.autowashpro.backend.repository.TimeSlotRepository;
import com.autowashpro.backend.repository.UserRepository;
import com.autowashpro.backend.repository.VehicleRepository;
import com.autowashpro.backend.repository.WashSessionRepository;
import com.autowashpro.backend.utils.BookingCodeGenerator;
import com.autowashpro.backend.utils.QrCodeGenerator;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class BookingService {

    private static final int SLOT_DURATION = 60;

    @Value("${email.sendbooking}")
    private String useEmailService;

    private final CustomerRepository customerRepository;
    private final ServicePriceRepository servicePriceRepository;
    private final AvailableSlotRepository availableSlotRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final VehicleRepository vehicleRepository;
    private final PromotionRepository promotionRepository;
    private final BookingRepository bookingRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final WashSessionRepository washSessionRepository;
    private final BookingMapper bookingMapper;
    private final BookingCodeGenerator bookingCodeGenerator;
    private final QrCodeGenerator qrCodeGenerator;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @Autowired
    public BookingService(CustomerRepository customerRepository, ServicePriceRepository servicePriceRepository,
            AvailableSlotRepository availableSlotRepository, TimeSlotRepository timeSlotRepository,
            VehicleRepository vehicleRepository, PromotionRepository promotionRepository,
            BookingRepository bookingRepository, BookingDetailRepository bookingDetailRepository,
            WashSessionRepository washSessionRepository, BookingMapper bookingMapper,
            BookingCodeGenerator bookingCodeGenerator, QrCodeGenerator qrCodeGenerator, EmailService emailService,
            UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.servicePriceRepository = servicePriceRepository;
        this.availableSlotRepository = availableSlotRepository;
        this.timeSlotRepository = timeSlotRepository;
        this.vehicleRepository = vehicleRepository;
        this.promotionRepository = promotionRepository;
        this.bookingRepository = bookingRepository;
        this.bookingDetailRepository = bookingDetailRepository;
        this.washSessionRepository = washSessionRepository;
        this.bookingMapper = bookingMapper;
        this.bookingCodeGenerator = bookingCodeGenerator;
        this.qrCodeGenerator = qrCodeGenerator;
        this.emailService = emailService;
        this.userRepository = userRepository;
    }

    public SlotAvailabilityByDateResponse getAvailableTimeSlots(LocalDate date) {
        List<TimeSlotAvailabilityResponse> timeSlots = getAvailableTimeSlot(date);
        return SlotAvailabilityByDateResponse
                .builder()
                .date(date)
                .timeSlotAvailabilityResponses(timeSlots)
                .build();
    }

    public List<UpcomingBookingResponse> getUpcomingBookings() {
        LocalDate today = LocalDate.now();
        LocalTime rightThisTimeMinus15Minutes = LocalTime.now().minusMinutes(15);
        List<Booking> todayBookings = bookingRepository.getUpcomingBookingsTillNow(today,
                rightThisTimeMinus15Minutes);
        return bookingMapper.toUpcomingBookingResponses(todayBookings);
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
         * Step 1. Check booking day (booking windows, travel to the past).
         */
        MembershipTier customerMembership = customer.getTier();
        int bookingWindowDays = customerMembership.getBookingWindowDays();
        LocalDate now = LocalDate.now();
        LocalDate bookingDay = createBookingRequest.getBookingDate();

        /**
         * For easy test, we can comment these lines of code.
         */
        if (bookingDay.isBefore(now)) {
            throw new DateTimeException("Bạn không thể đặt lịch của ngày trước đó");
        }
        TimeSlot startTimeSlot = timeSlotRepository.findById(createBookingRequest.getTimeSlotId())
                .orElseThrow(() -> new SlotInavailabilityException("Không tìm thấy slot phù hợp"));

        if (bookingDay.equals(now)) {
            LocalTime minStartTime = LocalTime.now().plusMinutes(15L);
            if (startTimeSlot.getStartTime().isBefore(minStartTime)) {
                throw new SlotInavailabilityException("Giờ đặt lịch phải trước thời điểm hiện tại ít nhất 15 phút");
            }
        }
        long dayBeetween = ChronoUnit.DAYS.between(now, bookingDay);
        if (bookingWindowDays < dayBeetween) {
            throw new ExceedBookingWindowException("Your tier " +
                    customerMembership.getTierName() +
                    " can't book over " + customerMembership.getBookingWindowDays() +
                    " days");
        }
        /**
         * *****************************************************************************************
         */

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
         * Step 3. Get all the succcessive/consecutive slots start from the selected
         * slot.
         */
        List<AvailableSlot> consecutiveSlots = availableSlotRepository.findConsecutiveSlotsFromDate(
                bookingDay,
                startTimeSlot.getId(),
                slotsNeeded,
                PageRequest.of(0, slotsNeeded));
        if (consecutiveSlots.size() < slotsNeeded) {
            throw new SlotInavailabilityException("Không đủ slot để thực hiện các dịch vụ!");
        }

        /**
         * Step 4. Check if the consecutive slots are available.
         */
        boolean anyBooked = consecutiveSlots
                .stream()
                .anyMatch(slot -> slot.getBooking() != null);
        if (anyBooked) {
            throw new SlotInavailabilityException("Các slot trước đó đã được đặt.");
        }

        /**
         * Step 5. Find applicable promotions.
         */
        log.info("Customer date of birth: {}", customer.getDateOfBirth());
        log.info("Booking date: {}", bookingDay);
        boolean isBirthday = customer.getDateOfBirth() != null
                && customer.getDateOfBirth().getMonth() == bookingDay.getMonth()
                && customer.getDateOfBirth().getDayOfMonth() == bookingDay.getDayOfMonth();
        log.info("Is bookingdate customer's birthday: {}", isBirthday);
        BigDecimal totalOriginalPrice = servicePrices.stream()
                .map(ServicePrice::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        List<Promotion> applicablePromotions = promotionRepository.findApplicablePromotions(
                bookingDay.atStartOfDay(),
                customerMembership.getId());
        log.info("Promotions size: {}", applicablePromotions.size());
        Promotion promotion = applicablePromotions.stream()
                .filter(p -> {
                    if ("Ưu Đãi Sinh Nhật".equals(p.getPromotionName())) {
                        return isBirthday;
                    }
                    return true; // Promotion thường
                })
                .max(Comparator.comparing(p -> calculateDiscountValue(p, totalOriginalPrice)))
                .orElse(null);
        log.info("Promotion's name: {}", promotion == null ? null : promotion.getPromotionName());

        /**
         * Step 6. Find the first available WashBay to assign. Check if that Bay is
         * available.
         */
        WashBay washBay = consecutiveSlots.get(0).getWashBay();

        if (!BayStatus.ACTIVE.equals(washBay.getStatus())) {
            throw new WashBayInavailableException(
                    String.format("Khoang rửa '%s' đang %s, không thể thực hiện dịch vụ",
                            washBay.getName(),
                            washBay.getStatus()));
        }

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
                .bookingCode(bookingCodeGenerator.generate())
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
         * Step 10. Immediately create WashSession for each BookingDetail in PENDING
         * status.
         */
        for (BookingDetail bookingDetail : savedDetails) {
            WashSession washSession = WashSession.builder()
                    .booking(savedBooking)
                    .customer(customer)
                    .vehicle(vehicle)
                    .servicePrice(bookingDetail.getServicePrice())
                    .staff(null)
                    .startTime(null)
                    .endTime(null)
                    .status(WashSessionStatus.PENDING)
                    .bay(washBay)
                    .build();
            washSessionRepository.save(washSession);
        }

        /**
         * Step 11. Build and return response.
         */
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
        LocalDateTime startDateTime = bookingDay.atTime(startTimeSlot.getStartTime());
        LocalDateTime endDateTime = startDateTime.plusMinutes(totalDuration);

        CreateBookingResponse bookingResponse = CreateBookingResponse.builder()
                .id(savedBooking.getId())
                .customerName(customer.getFullName())
                .vehicleLicensePlate(vehicle.getLicensePlate())
                .vehicleTypeName(vehicle.getVehicleType().getTypeName())
                .bayName(washBay.getName())
                .status(savedBooking.getStatus())
                .notes(savedBooking.getNotes())
                .bookingCode(savedBooking.getBookingCode())
                .bookingDate(bookingDay)
                .startTime(startTimeSlot.getStartTime())
                .endDate(endDateTime.toLocalDate())
                .endTime(startTimeSlot.getStartTime().plusMinutes(totalDuration))
                .totalDurationMinutes(totalDuration)
                .slotsOccupied(slotsNeeded)
                .promotionName(promotion != null ? promotion.getPromotionName() : null)
                .totalOriginalPrice(totalOriginalPrice)
                .totalDiscount(totalDiscount)
                .totalFinalPrice(totalFinalPrice)
                .bookingDetails(bookingDetailResponses)
                .createdAt(savedBooking.getCreatedAt())
                .build();

        /**
         * Step 12. Generate QR Code and send booking confirmation email.
         */
        if (useEmailService.equals("yes")) {
            byte[] qrCodeBytes = qrCodeGenerator.generateQrCode(savedBooking.getBookingCode());
            emailService.sendBookingSuccessToEmail(customer.getEmail(),
                    savedBooking.getBookingCode(),
                    bookingResponse,
                    qrCodeBytes);
        }

        return bookingResponse;

    }

    public BookingResponse getBookingByBookingCode(String email, String bookingCode) {

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng!"));

        Optional<Booking> optionalBooking = bookingRepository.findByBookingCode(bookingCode);
        if (optionalBooking.isEmpty()) {
            throw new BookingNotFoundException("Không tìm thấy mã đặt lịch: " + bookingCode);
        }

        Booking booking = optionalBooking.get();
        if (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.STAFF) {
            return bookingMapper.toBookingResponse(booking);
        } else {
            if (!currentUser.getEmail().equals(booking.getCustomer().getEmail())) {
                return null;
            } else {
                return bookingMapper.toBookingResponse(booking);
            }
        }
    }

    public List<BookingResponse> getTodayBookings() {
        return bookingMapper.toBookingResponses(bookingRepository.findTodayBookings(LocalDate.now()));
    }

    public List<BookingResponse> getCustomerUpcomingBookings(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy khách hàng"));
        LocalDate today = LocalDate.now();
        return bookingMapper
                .toBookingResponses(bookingRepository.findCustomerUpcomingBookings(customer.getId(), today));
    }

    public List<BookingResponse> getCustomerAllBookings(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy khách hàng"));
        return bookingMapper.toBookingResponses(bookingRepository.findByCustomerId(customer.getId()));
    }

    public BigDecimal calculateDiscountValue(Promotion promotion, BigDecimal totalOriginalPrice) {
        if (promotion == null || totalOriginalPrice == null) {
            return BigDecimal.ZERO;
        }
        if (promotion.getDiscountType().equals(PromotionDiscountType.FIXED_AMOUNT)) {
            return promotion.getDiscountValue();
        } else if (promotion.getDiscountType().equals(PromotionDiscountType.PERCENTAGE)) {
            return totalOriginalPrice
                    .multiply(promotion.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            return totalOriginalPrice;
        }
    }

}

/**
 * Booking tạo xong
 * → WashSession tạo sẵn (status = PENDING)
 * → Staff bắt đầu → WashSession (status = IN_PROGRESS, startTime = now)
 * → Staff stop → WashSession (status = COMPLETED, endTime = now)
 * → Tất cả WashSession của Booking COMPLETED
 * → Tạo Billing (status = PENDING, link Booking)
 * originalAmount = SUM(BookingDetail.finalPrice)
 * discountAmount = từ Voucher (nếu có)
 * finalAmount = originalAmount - discountAmount
 */