package com.autowashpro.backend.service;

import java.math.BigDecimal;
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

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.autowashpro.backend.exception.ExceedBookingWindowException;
import com.autowashpro.backend.exception.UserNotFoundException;
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

@Tag("unit-bookingService")
@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    /**
     * Common fixtures
     */
//     private CreateBookingRequest createBookingRequest;
//     private Customer customer;
//     private MembershipTier membershipTier;
//     private Vehicle vehicle;
//     private VehicleType vehicleType;
//     private TimeSlot timeSlot;
//     private ServicePrice servicePrice1;
//     private Service service1;
//     private WashBay washBay;
//     private AvailableSlot availableSlot1;
//     private AvailableSlot availableSlot2;
//     private Booking savedBooking;

//     @Mock
//     private CustomerRepository customerRepository;

//     @Mock
//     private ServicePriceRepository servicePriceRepository;

//     @Mock
//     private AvailableSlotRepository availableSlotRepository;

//     @Mock
//     private TimeSlotRepository timeSlotRepository;

//     @Mock
//     private VehicleRepository vehicleRepository;

//     @Mock
//     private PromotionRepository promotionRepository;

//     @Mock
//     private BookingRepository bookingRepository;

//     @Mock
//     private BookingDetailRepository bookingDetailRepository;

//     @InjectMocks
//     private BookingService bookingService;

//     @BeforeEach
//     void setUp() {
//         membershipTier = new MembershipTier();
//         membershipTier.setId(1L);
//         membershipTier.setTierName("Bronze");
//         membershipTier.setBookingWindowDays(7);

//         customer = new Customer();
//         customer.setId(1L);
//         customer.setFullName("Nguyen Van A");
//         customer.setTier(membershipTier);

//         vehicleType = new VehicleType();
//         vehicleType.setId(1L);
//         vehicleType.setTypeName("SEDAN");

//         vehicle = new Vehicle();
//         vehicle.setId(1L);
//         vehicle.setLicensePlate("51A-123.45");
//         vehicle.setVehicleType(vehicleType);

//         timeSlot = new TimeSlot();
//         timeSlot.setId(1L);
//         timeSlot.setStartTime(LocalTime.of(7, 0));
//         timeSlot.setEndTime(LocalTime.of(8, 0));

//         service1 = new Service();
//         service1.setId(1L);
//         service1.setServiceName("Rửa xe ngoại thất cao cấp");
//         service1.setDurationMinutes(45);

//         servicePrice1 = new ServicePrice();
//         servicePrice1.setId(1L);
//         servicePrice1.setPrice(new BigDecimal("150000"));
//         servicePrice1.setService(service1);
//         servicePrice1.setVehicleType(vehicleType);

//         washBay = new WashBay();
//         washBay.setId(1L);
//         washBay.setName("Bay 1");

//         availableSlot1 = new AvailableSlot();
//         availableSlot1.setId(1L);
//         availableSlot1.setSlotDate(LocalDate.now().plusDays(1));
//         availableSlot1.setTimeSlot(timeSlot);
//         availableSlot1.setWashBay(washBay);
//         availableSlot1.setBooking(null);

//         availableSlot2 = new AvailableSlot();
//         availableSlot2.setId(2L);
//         availableSlot2.setSlotDate(LocalDate.now().plusDays(1));
//         availableSlot2.setTimeSlot(timeSlot);
//         availableSlot2.setWashBay(washBay);
//         availableSlot2.setBooking(null);

//         savedBooking = Booking.builder()
//                 .id(1L)
//                 .customer(customer)
//                 .vehicle(vehicle)
//                 .status(BookingStatus.CONFIRMED)
//                 .build();

//         createBookingRequest = CreateBookingRequest.builder()
//                 .customerId(1L)
//                 .vehicleId(1L)
//                 .timeSlotId(1L)
//                 .bookingDate(LocalDate.now().plusDays(1))
//                 .servicePriceIds(List.of(1L))
//                 .notes("Test note")
//                 .build();
//     }

//     @Test
//     void createBooking_success_noPromotion() {
//         // Arange
//         when(customerRepository.findById(1L))
//                 .thenReturn(Optional.of(customer));
//         when(servicePriceRepository.findAllById(List.of(1L)))
//                 .thenReturn(List.of(servicePrice1));
//         when(timeSlotRepository.findById(1L))
//                 .thenReturn(Optional.of(timeSlot));
//         when(availableSlotRepository.findConsecutiveSlotsFromDate(any(), any(), anyInt(), any()))
//                 .thenReturn(List.of(availableSlot1));
//         when(promotionRepository.findApplicablePromotions(any(), any()))
//                 .thenReturn(List.of());
//         when(vehicleRepository.findById(1L))
//                 .thenReturn(Optional.of(vehicle));
//         when(bookingRepository.save(any()))
//                 .thenReturn(savedBooking);
//         when(bookingDetailRepository.save(any()))
//                 .thenAnswer(inv -> {
//                     BookingDetail d = inv.getArgument(0);
//                     d.setServicePrice(servicePrice1);
//                     return d;
//                 });

//         // Act
//         CreateBookingResponse bookingResponse = bookingService.createBooking(createBookingRequest);

//         // Assert
//         assertThat(bookingResponse).isNotNull();
//         assertThat(bookingResponse.getId()).isEqualTo(1L);
//         assertThat(bookingResponse.getPromotionName()).isNull();
//         assertThat(bookingResponse.getTotalOriginalPrice()).isEqualByComparingTo("150000");
//         assertThat(bookingResponse.getTotalDiscount()).isEqualByComparingTo("0");
//         assertThat(bookingResponse.getTotalFinalPrice()).isEqualByComparingTo("150000");

//     }

//     @Test
//     void createBooking_success_withPercentagePromotion() {
//         // Arrange
//         Promotion promotion = new Promotion();
//         promotion.setId(1L);
//         promotion.setDescription("Discount 20%");
//         promotion.setDiscountType(PromotionDiscountType.PERCENTAGE);
//         promotion.setDiscountValue(BigDecimal.valueOf(20));

//         when(customerRepository.findById(1L))
//                 .thenReturn(Optional.of(customer));
//         when(servicePriceRepository.findAllById(List.of(1L)))
//                 .thenReturn(List.of(servicePrice1));
//         when(timeSlotRepository.findById(1L))
//                 .thenReturn(Optional.of(timeSlot));
//         when(availableSlotRepository.findConsecutiveSlotsFromDate(any(), any(), anyInt(), any()))
//                 .thenReturn(List.of(availableSlot1));
//         when(promotionRepository.findApplicablePromotions(any(), anyLong()))
//                 .thenReturn(List.of(promotion));
//         when(vehicleRepository.findById(1L))
//                 .thenReturn(Optional.of(vehicle));
//         when(bookingRepository.save(any()))
//                 .thenReturn(savedBooking);
//         when(bookingDetailRepository.save(any()))
//                 .thenAnswer(inv -> {
//                     BookingDetail d = inv.getArgument(0);
//                     d.setServicePrice(servicePrice1);
//                     d.setPromotion(promotion);
//                     return d;
//                 });

//         // Act
//         CreateBookingResponse response = bookingService.createBooking(createBookingRequest);

//         // Assert
//         assertThat(response.getTotalDiscount()).isEqualByComparingTo("30000");
//         assertThat(response.getTotalFinalPrice()).isEqualByComparingTo("120000");
//     }

//     @Test
//     void createBooking_success_withFixedAmountPromotion() {
//         // Arrange
//         Promotion promotion = new Promotion();
//         promotion.setId(1L);
//         promotion.setDescription("Discount 50k");
//         promotion.setDiscountType(PromotionDiscountType.FIXED_AMOUNT);
//         promotion.setDiscountValue(BigDecimal.valueOf(50000));

//         when(customerRepository.findById(1L))
//                 .thenReturn(Optional.of(customer));
//         when(servicePriceRepository.findAllById(List.of(1L)))
//                 .thenReturn(List.of(servicePrice1));
//         when(timeSlotRepository.findById(1L))
//                 .thenReturn(Optional.of(timeSlot));
//         when(availableSlotRepository.findConsecutiveSlotsFromDate(any(), any(), anyInt(), any()))
//                 .thenReturn(List.of(availableSlot1));
//         when(promotionRepository.findApplicablePromotions(any(), anyLong()))
//                 .thenReturn(List.of(promotion));
//         when(vehicleRepository.findById(1L))
//                 .thenReturn(Optional.of(vehicle));
//         when(bookingRepository.save(any()))
//                 .thenReturn(savedBooking);
//         when(bookingDetailRepository.save(any()))
//                 .thenAnswer(inv -> {
//                     BookingDetail d = inv.getArgument(0);
//                     d.setServicePrice(servicePrice1);
//                     d.setPromotion(promotion);
//                     return d;
//                 });

//         // Act
//         CreateBookingResponse response = bookingService.createBooking(createBookingRequest);

//         // Assert
//         assertThat(response.getTotalDiscount()).isEqualByComparingTo("50000");
//         assertThat(response.getTotalFinalPrice()).isEqualByComparingTo("100000");
//     }

//     @Test
//     void createBooking_customerNotFound_throwsUserNotFoundException() {

//         // Arrange
//         when(customerRepository.findById(1L)).thenReturn(Optional.empty());

//         // Act + Assert
//         assertThrows(UserNotFoundException.class, () -> bookingService.createBooking(createBookingRequest));
//     }

//     @Test
//     void createBooking_exceedBookingWindow_throwsExceedBookingWindowException() {
//         // Arrange
//         createBookingRequest.setBookingDate(createBookingRequest.getBookingDate().plusDays(30));
//         when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));

//         // Act + Assert
//         assertThrows(ExceedBookingWindowException.class, () -> bookingService.createBooking(createBookingRequest));

//     }

//     @Test
//     void createBooking_vehicleNotFound_throwsRuntimeException() {
//         when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
//         when(servicePriceRepository.findAllById(any())).thenReturn(List.of(servicePrice1));
//         when(timeSlotRepository.findById(1L)).thenReturn(Optional.of(timeSlot));
//         when(availableSlotRepository.findConsecutiveSlotsFromDate(any(), any(), anyInt(), any()))
//                 .thenReturn(List.of(availableSlot1));
//         when(promotionRepository.findApplicablePromotions(any(), any())).thenReturn(List.of());
//         when(vehicleRepository.findById(1L)).thenReturn(Optional.empty());

//         assertThatThrownBy(() -> bookingService.createBooking(createBookingRequest))
//                 .isInstanceOf(RuntimeException.class)
//                 .hasMessage("Vehicle not found");
//     }

//     @Test
//     void createBooking_timeSlotNotFound_throwsRuntimeException() {
//         when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
//         when(servicePriceRepository.findAllById(any())).thenReturn(List.of(servicePrice1));
//         when(timeSlotRepository.findById(1L)).thenReturn(Optional.empty());

//         assertThatThrownBy(() -> bookingService.createBooking(createBookingRequest))
//                 .isInstanceOf(RuntimeException.class)
//                 .hasMessage("Time slot not found");
//     }

//     @Test
//     void createBooking_notEnoughSlots_throwsRuntimeException() {
//         when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
//         when(servicePriceRepository.findAllById(any())).thenReturn(List.of(servicePrice1));
//         when(timeSlotRepository.findById(1L)).thenReturn(Optional.of(timeSlot));
//         when(availableSlotRepository.findConsecutiveSlotsFromDate(any(), any(), anyInt(), any()))
//                 .thenReturn(List.of()); // không có slot nào

//         assertThatThrownBy(() -> bookingService.createBooking(createBookingRequest))
//                 .isInstanceOf(RuntimeException.class)
//                 .hasMessage("Not enough consecutive slots avalable");
//     }

//     @Test
//     void createBooking_slotAlreadyBooked_throwsRuntimeException() {
//         availableSlot1.setBooking(savedBooking); // slot đã bị đặt

//         when(customerRepository.findById(1L)).thenReturn(Optional.of(customer));
//         when(servicePriceRepository.findAllById(any())).thenReturn(List.of(servicePrice1));
//         when(timeSlotRepository.findById(1L)).thenReturn(Optional.of(timeSlot));
//         when(availableSlotRepository.findConsecutiveSlotsFromDate(any(), any(), anyInt(), any()))
//                 .thenReturn(List.of(availableSlot1));

//         assertThatThrownBy(() -> bookingService.createBooking(createBookingRequest))
//                 .isInstanceOf(RuntimeException.class)
//                 .hasMessage("One or more executive slots have been booked");
//     }

}
