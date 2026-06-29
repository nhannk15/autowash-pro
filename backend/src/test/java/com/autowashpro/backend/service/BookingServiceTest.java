package com.autowashpro.backend.service;

import java.math.BigDecimal;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.autowashpro.backend.exception.ExceedBookingWindowException;
import com.autowashpro.backend.exception.SlotInavailabilityException;
import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.exception.WashBayInavailableException;
import com.autowashpro.backend.mapper.BookingMapper;
import com.autowashpro.backend.model.dto.CreateBookingRequest;
import com.autowashpro.backend.model.dto.CreateBookingResponse;
import com.autowashpro.backend.model.entity.AvailableSlot;
import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.model.entity.BookingDetail;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.MembershipTier;
import com.autowashpro.backend.model.entity.Promotion;
import com.autowashpro.backend.model.entity.Service;
import com.autowashpro.backend.model.entity.ServicePrice;
import com.autowashpro.backend.model.entity.TimeSlot;
import com.autowashpro.backend.model.entity.Vehicle;
import com.autowashpro.backend.model.entity.VehicleType;
import com.autowashpro.backend.model.entity.WashBay;
import com.autowashpro.backend.model.enums.BayStatus;
import com.autowashpro.backend.model.enums.BookingStatus;
import com.autowashpro.backend.model.enums.PromotionDiscountType;
import com.autowashpro.backend.repository.AvailableSlotRepository;
import com.autowashpro.backend.repository.BookingDetailRepository;
import com.autowashpro.backend.repository.BookingRepository;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.PromotionRepository;
import com.autowashpro.backend.repository.ServicePriceRepository;
import com.autowashpro.backend.repository.ServiceRepository;
import com.autowashpro.backend.repository.TimeSlotRepository;
import com.autowashpro.backend.repository.UserRepository;
import com.autowashpro.backend.model.entity.Billing;
import com.autowashpro.backend.repository.BillingRepository;
import com.autowashpro.backend.repository.VoucherRepository;
import com.autowashpro.backend.repository.VehicleRepository;
import com.autowashpro.backend.repository.WashSessionRepository;
import com.autowashpro.backend.service.BillingService;
import com.autowashpro.backend.service.PromotionService;
import com.autowashpro.backend.utils.BookingCodeGenerator;
import com.autowashpro.backend.utils.QrCodeGenerator;

@ExtendWith(MockitoExtension.class)
@Tag("unit")
public class BookingServiceTest {
    /**
     * How to write test classes.
     * 1. Indentify class need to be tested and its dependencies.
     * 2. Test script.
     * 3. Set up @BeforeEach.
     * 4. AAA.
     * 5. Naming Convention.
     */

    @InjectMocks
    private BookingService bookingService;

    @Mock
    private CustomerRepository customerRepository;
    @Mock
    private TimeSlotRepository timeSlotRepository;
    @Mock
    private ServiceRepository serviceRepository;
    @Mock
    private ServicePriceRepository servicePriceRepository;
    @Mock
    private AvailableSlotRepository availableSlotRepository;
    @Mock
    private VehicleRepository vehicleRepository;
    @Mock
    private PromotionRepository promotionRepository;
    @Mock
    private VoucherRepository voucherRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private BookingDetailRepository bookingDetailRepository;
    @Mock
    private WashSessionRepository washSessionRepository;
    @Mock
    private BookingMapper bookingMapper;
    @Mock
    private BookingCodeGenerator bookingCodeGenerator;
    @Mock
    private QrCodeGenerator qrCodeGenerator;
    @Mock
    private EmailService emailService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PromotionService promotionService;
    @Mock
    private BillingService billingService;
    @Mock
    private BillingRepository billingRepository;

    // Fixtures.
    private MembershipTier tier;
    private Customer customer;
    private VehicleType vehicleType;
    private Vehicle vehicle;
    private TimeSlot timeSlot;
    private Service service;
    private ServicePrice servicePrice;
    private WashBay washBay;
    private AvailableSlot availableSlot;
    private Booking savedBooking;
    private BookingDetail savedDetail;
    private CreateBookingRequest request;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(bookingService, "useEmailService", false);
        tier = new MembershipTier();
        tier.setId(1L);
        tier.setTierName("BRONZE");
        tier.setTierLevel(1);
        tier.setBookingWindowDays(7);

        customer = new Customer();
        customer.setId(4L);
        customer.setFullName("Nguyen Khac Le Nhan");
        customer.setEmail("nhannk2101@gmail.com");
        customer.setTier(tier);

        vehicleType = new VehicleType();
        vehicleType.setId(1L);
        vehicleType.setTypeName("SEDAN");

        vehicle = new Vehicle();
        vehicle.setModel("Sedan car for users");
        vehicle.setId(1L);
        vehicle.setCustomer(customer);
        vehicle.setVehicleType(vehicleType);
        vehicle.setLicensePlate("59A-61394");

        timeSlot = new TimeSlot();
        timeSlot.setId(1L);
        timeSlot.setStartTime(LocalTime.of(7, 0));
        timeSlot.setEndTime(LocalTime.of(8, 0));

        service = new Service();
        service.setId(1L);
        service.setServiceName("Rửa xe nội thất");
        service.setDurationMinutes(45);

        servicePrice = new ServicePrice();
        servicePrice.setService(service);
        servicePrice.setVehicleType(vehicleType);
        servicePrice.setPrice(BigDecimal.valueOf(150000L));

        washBay = new WashBay();
        washBay.setId(1L);
        washBay.setName("Bay 1");
        washBay.setStatus(BayStatus.ACTIVE);

        availableSlot = new AvailableSlot();
        availableSlot.setId(1L);
        availableSlot.setSlotDate(LocalDate.now().plusDays(1));
        availableSlot.setTimeSlot(timeSlot);
        availableSlot.setWashBay(washBay);

        savedBooking = Booking
                .builder()
                .id(1L)
                .customer(customer)
                .vehicle(vehicle)
                .status(BookingStatus.CONFIRMED)
                .bookingCode("ABCXYZ")
                .build();

        savedDetail = new BookingDetail();
        savedDetail.setBooking(savedBooking);
        savedDetail.setServicePrice(servicePrice);
        savedDetail.setPriceAtBooking(new BigDecimal("150000"));
        savedDetail.setDiscountAmount(BigDecimal.ZERO);
        savedDetail.setFinalPrice(new BigDecimal("150000"));

        request = CreateBookingRequest
                .builder()
                .customerId(3L)
                .vehicleId(1L)
                .timeSlotId(1L)
                .bookingDate(LocalDate.now().plusDays(1))
                .servicePriceIds(List.of(1L))
                .notes("Test notes")
                .build();
    }

    private void commonMockStubs() {
        when(customerRepository.findById(3L)).thenReturn(Optional.of(customer));
        when(timeSlotRepository.findById(1L)).thenReturn(Optional.of(timeSlot));
        when(servicePriceRepository.findAllById((any()))).thenReturn(List.of(servicePrice));
        when(availableSlotRepository.findConsecutiveSlotsFromDate(any(), any(), anyInt(), any(Pageable.class)))
                .thenReturn(List.of(availableSlot));
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(bookingRepository.saveAndFlush(any())).thenReturn(savedBooking);
        when(bookingCodeGenerator.generate()).thenReturn("ABCXYZ");
        when(bookingRepository.findByIdWithDetails(any())).thenReturn(Optional.of(savedBooking));
        Billing mockBilling = new Billing();
        mockBilling.setId(1L);
        mockBilling.setBooking(savedBooking);
        when(billingRepository.findByBookingId(any())).thenReturn(Optional.of(mockBilling));
    }

    private Promotion createNewPromotion(PromotionDiscountType type, BigDecimal value) {
        Promotion newPromotion = new Promotion();
        newPromotion.setId(1L);
        newPromotion.setPromotionName("Discount: " + value);
        newPromotion.setDiscountType(type);
        newPromotion.setDiscountValue(value);
        return newPromotion;
    }

    @Test
    void createBooking_success_noPromotion() {
        // Arrange
        request.setPromotionId(null);
        commonMockStubs();

        // Act
        CreateBookingResponse response = bookingService.createBooking(request);

        // Assert
        assertNotNull(response);
        assertEquals("ABCXYZ", response.getBookingCode());
        assertEquals(new BigDecimal("150000"), response.getTotalOriginalPrice());
        assertEquals(BigDecimal.ZERO, response.getTotalDiscount());
        assertEquals(new BigDecimal("150000"), response.getTotalFinalPrice());
        verify(bookingRepository, atLeastOnce()).saveAndFlush(any());
        verify(washSessionRepository, atLeastOnce()).saveAndFlush(any());
    }

    @Test
    void createBooking_success_percentagePromotion() {
        // Arrange
        request.setPromotionId(1L);
        commonMockStubs();
        Promotion newPromotion = createNewPromotion(PromotionDiscountType.PERCENTAGE, BigDecimal.valueOf(20));
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(newPromotion));

        // Act
        CreateBookingResponse response = bookingService.createBooking(request);

        // Assert
        assertNotNull(response);
        assertEquals("ABCXYZ", response.getBookingCode());
        assertEquals(new BigDecimal("150000"), response.getTotalOriginalPrice());
        assertEquals(new BigDecimal("30000"), response.getTotalDiscount());
        assertEquals(new BigDecimal("120000"), response.getTotalFinalPrice());
    }

    @Test
    void createBooking_success_fixedAmountPromotion() {
        // Arrange
        request.setPromotionId(1L);
        commonMockStubs();
        Promotion newPromotion = createNewPromotion(PromotionDiscountType.FIXED_AMOUNT, new BigDecimal("50000"));
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(newPromotion));

        // Act
        CreateBookingResponse response = bookingService.createBooking(request);

        // Assert
        assertNotNull(response);
        assertEquals("ABCXYZ", response.getBookingCode());
        assertEquals(new BigDecimal("150000"), response.getTotalOriginalPrice());
        assertEquals(new BigDecimal("50000"), response.getTotalDiscount());
        assertEquals(new BigDecimal("100000"), response.getTotalFinalPrice());
    }

    @Test
    void createBooking_success_emailNotSent_useEmailServiceIsNo() {
        // Arrange
        request.setPromotionId(null);
        ReflectionTestUtils.setField(bookingService, "useEmailService", false);
        commonMockStubs();

        // Act
        CreateBookingResponse response = bookingService.createBooking(request);

        // Assert
        assertNotNull(response);
        verify(emailService, never()).sendBookingSuccessToEmail(any(), any(), any(), any());
    }

    @Test
    void createBooking_success_emailSent_useEmailSeriveIsYes() {
        // Arrange
        request.setPromotionId(null);
        ReflectionTestUtils.setField(bookingService, "useEmailService", true);
        commonMockStubs();
        when(qrCodeGenerator.generateQrCode(any())).thenReturn(new byte[] { 1, 2, 3 });

        // Act
        CreateBookingResponse response = bookingService.createBooking(request);

        // Assert
        assertNotNull(response);
        verify(emailService, times(1)).sendBookingSuccessToEmail(any(), any(), any(), any());
    }

    @Test
    void createBooking_customerNotFound_throwsUserNotFoundException() {
        // Arrange
        when(customerRepository.findById(3L)).thenReturn(Optional.empty());

        // Act + Assert
        assertThrows(UserNotFoundException.class, () -> {
            bookingService.createBooking(request);
        });
    }

    @Test
    void createBooking_bookingInThePast_throwsDateTimeException() {
        // Arrange
        request.setBookingDate(LocalDate.now().minusDays(1));
        when(customerRepository.findById(any()))
                .thenReturn(Optional.of(customer));

        // Act + Assert
        assertThrows(DateTimeException.class, () -> {
            bookingService.createBooking(request);
        });
    }

    @Test
    void createBooking_bookingTooCloseToSlot_throwSlotInavailabilityException() {
        // Arrange
        when(customerRepository.findById(3L))
                .thenReturn(Optional.of(customer));
        request.setBookingDate(LocalDate.now());
        LocalTime startTimeSlot = LocalTime.now().minusMinutes(1);
        timeSlot.setStartTime(startTimeSlot);
        when(timeSlotRepository.findById(1L)).thenReturn(Optional.of(timeSlot));

        // Act + Assert
        assertThrows(SlotInavailabilityException.class, () -> {
            bookingService.createBooking(request);
        });
    }

    @Test
    void createBooking_exceedBookingWindow_throwsExceedBookingWindowException() {
        // Arrange
        when(customerRepository.findById(3L))
                .thenReturn(Optional.of(customer));
        when(timeSlotRepository.findById(1L))
                .thenReturn(Optional.of(timeSlot));
        LocalDate bookingDate = LocalDate.now().plusDays(8);
        request.setBookingDate(bookingDate);

        // Act + Assert
        assertThrows(ExceedBookingWindowException.class, () -> {
            bookingService.createBooking(request);
        });
    }

    @Test
    void createBooking_timeSlotNotFound_throwsSlotInavailabilityException() {
        // Arrange
        when(customerRepository.findById(3L))
                .thenReturn(Optional.of(customer));
        when(timeSlotRepository.findById(1L))
                .thenReturn(Optional.of(timeSlot));
        when(servicePriceRepository.findAllById(List.of(1L)))
                .thenReturn(List.of(servicePrice));
        when(availableSlotRepository.findConsecutiveSlotsFromDate(any(), any(), anyInt(), any(Pageable.class)))
                .thenReturn(List.of());

        // Act + Assert
        assertThrows(SlotInavailabilityException.class, () -> {
            bookingService.createBooking(request);
        });

    }

    @Test
    void createBooking_vehicleNotFound_throwsRuntimeException() {
        // Arrange
        when(customerRepository.findById(3L))
                .thenReturn(Optional.of(customer));
        when(timeSlotRepository.findById(1L))
                .thenReturn(Optional.of(timeSlot));
        when(servicePriceRepository.findAllById(List.of(1L)))
                .thenReturn(List.of(servicePrice));
        when(availableSlotRepository.findConsecutiveSlotsFromDate(any(), any(), anyInt(), any(Pageable.class)))
                .thenReturn(List.of(availableSlot));
        when(vehicleRepository.findById(1L))
                .thenReturn(Optional.empty());

        // Act + Arrange
        assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(request);
        });
    }

    @Test
    void createBooking_notEnoughConsecutiveSlots_throwsSlotInavailabilityException() {
        // Arrange
        when(customerRepository.findById(3L))
                .thenReturn(Optional.of(customer));
        when(timeSlotRepository.findById(1L))
                .thenReturn(Optional.of(timeSlot));
        when(servicePriceRepository.findAllById(List.of(1L)))
                .thenReturn(List.of(servicePrice));
        when(availableSlotRepository.findConsecutiveSlotsFromDate(any(), any(), anyInt(), any(Pageable.class)))
                .thenReturn(List.of());
        
        // Act + Assert
        assertThrows(SlotInavailabilityException.class, () -> {
            bookingService.createBooking(request);
        });
    }

    @Test
    void createBooking_slotAlreadyBooked_throwsSlotInavailabilityException() {
        // Arrange
        availableSlot.setBooking(savedBooking);
        when(customerRepository.findById(3L))
                .thenReturn(Optional.of(customer));
        when(timeSlotRepository.findById(1L))
                .thenReturn(Optional.of(timeSlot));
        when(servicePriceRepository.findAllById(List.of(1L)))
                .thenReturn(List.of(servicePrice));
        when(availableSlotRepository.findConsecutiveSlotsFromDate(any(), any(), anyInt(), any(Pageable.class)))
                .thenReturn(List.of(availableSlot));
        assertThrows(SlotInavailabilityException.class, () -> {
            bookingService.createBooking(request);
        });
        
    }

    @Test
    void createBooking_washBayMaintenance_throwsWashBayInavailableException() {
        washBay.setStatus(BayStatus.MAINTENANCE);
        availableSlot.setWashBay(washBay);
        when(customerRepository.findById(3L))
                .thenReturn(Optional.of(customer));
        when(timeSlotRepository.findById(1L))
                .thenReturn(Optional.of(timeSlot));
        when(servicePriceRepository.findAllById(List.of(1L)))
                .thenReturn(List.of(servicePrice));
        when(availableSlotRepository.findConsecutiveSlotsFromDate(any(), any(), anyInt(), any(Pageable.class)))
                .thenReturn(List.of(availableSlot));
        assertThrows(WashBayInavailableException.class, () -> {
            bookingService.createBooking(request);
        });
    }

}
