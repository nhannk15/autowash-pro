package com.autowashpro.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autowashpro.backend.exception.BookingNotFoundException;
import com.autowashpro.backend.exception.EarlyWashSessionException;
import com.autowashpro.backend.exception.StaffNotFoundException;
import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.mapper.WashSessionMapper;
import com.autowashpro.backend.model.dto.StartWashSessionRequest;
import com.autowashpro.backend.model.dto.WashSessionResponse;
import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.model.entity.Staff;
import com.autowashpro.backend.model.entity.WashSession;
import com.autowashpro.backend.model.enums.BookingStatus;
import com.autowashpro.backend.model.enums.WashSessionStatus;
import com.autowashpro.backend.repository.BookingRepository;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.StaffRepository;
import com.autowashpro.backend.repository.WashSessionRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class WashSessionService {

    private final WashSessionRepository repository;
    private final StaffRepository staffRepository;
    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final WashSessionMapper washSessionMapper;
    private final BillingService billingService;
    private final StaffService staffService;

    @Autowired
    public WashSessionService(WashSessionRepository repository, StaffRepository staffRepository,
            BookingRepository bookingRepository, CustomerRepository customerRepository,
            WashSessionMapper washSessionMapper, BillingService billingService, StaffService staffService) {
        this.repository = repository;
        this.staffRepository = staffRepository;
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
        this.washSessionMapper = washSessionMapper;
        this.billingService = billingService;
        this.staffService = staffService;
    }

    @Transactional
    public List<WashSessionResponse> startWashSession(Long bookingId, String email) {
        Staff staff = staffRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy staff"));
        staff.setOccupied(true);
        staffRepository.save(staff);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Không tìm thấy Booking với id: " + bookingId));

        /**
         * For Eazy Testing, we commented these statements...
         */
        // LocalTime scheduledStartTime =
        // booking.getAvailableSlots().getFirst().getTimeSlot().getStartTime();
        // LocalTime now = LocalTime.now();
        // if (!now.isAfter(scheduledStartTime.minusMinutes(5L))) {
        // throw new EarlyWashSessionException("Chỉ có thể bắt đầu phiên rửa xe trước 5
        // phút");
        // }

        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);

        List<WashSession> washSessions = repository.findByBookingId(bookingId);
        for (WashSession washSession : washSessions) {
            washSession.setStaff(staff);
            washSession.setStatus(WashSessionStatus.IN_PROGRESS);
            washSession.setStartTime(LocalDateTime.now());
            repository.save(washSession);
        }

        List<WashSession> savedWashSessions = repository.findByBookingId(bookingId);
        return washSessionMapper.toResponseList(savedWashSessions);
    }

    @Transactional
    public List<WashSessionResponse> startWashSessionVersion2(StartWashSessionRequest request, String email) {
        Long bookingId = request.getBookingId();
        String staffNote = request.getStaffNote();
        Staff staff = staffRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy staff"));
        staff.setOccupied(true);
        staffRepository.save(staff);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Không tìm thấy Booking với id: " + bookingId));
        /**
         * For Eazy Testing, we commented these statements...
         */
        // LocalTime scheduledStartTime =
        // booking.getAvailableSlots().getFirst().getTimeSlot().getStartTime();
        // LocalTime now = LocalTime.now();
        // if (!now.isAfter(scheduledStartTime.minusMinutes(5L))) {
        // throw new EarlyWashSessionException("Chỉ có thể bắt đầu phiên rửa xe trước 5
        // phút");
        // }

        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);

        List<WashSession> washSessions = repository.findByBookingId(bookingId);
        for (WashSession washSession : washSessions) {
            washSession.setStaff(staff);
            washSession.setStatus(WashSessionStatus.IN_PROGRESS);
            washSession.setStartTime(LocalDateTime.now());
            washSession.setStaffNote(staffNote);
            repository.save(washSession);
        }

        List<WashSession> savedWashSessions = repository.findByBookingId(bookingId);
        return washSessionMapper.toResponseList(savedWashSessions);
    }

    @Transactional
    public List<WashSessionResponse> completeWashSession(Long bookingId, String email) {
        Staff staff = staffRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy staff"));
        staff.setOccupied(false);
        staffRepository.save(staff);

        List<WashSession> washSessions = repository.findByBookingId(bookingId);
        for (WashSession washSession : washSessions) {
            washSession.setStaff(staff);
            washSession.setStatus(WashSessionStatus.COMPLETED);
            washSession.setEndTime(LocalDateTime.now());
            repository.save(washSession);
        }

        List<WashSession> savedWashSessions = repository.findByBookingId(bookingId);

        /**
         * Create Billing immediately.
         */
        // billingService.createPendingBilling(bookingId);
        return washSessionMapper.toResponseList(savedWashSessions);
    }

    @Transactional
    public List<WashSessionResponse> cancleWashSession(Long bookingId, String email) {
        Staff staff = staffRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy staff"));

        List<WashSession> washSessions = repository.findByBookingId(bookingId);
        for (WashSession washSession : washSessions) {
            washSession.setStaff(staff);
            washSession.setStatus(WashSessionStatus.CANCELLED);
            repository.save(washSession);
        }

        List<WashSession> savedWashSessions = repository.findByBookingId(bookingId);
        return washSessionMapper.toResponseList(savedWashSessions);
    }

    @Transactional
    public List<WashSessionResponse> startWashSessionAssigningStaff(Long bookingId, Long staffId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy staff"));
        staff.setOccupied(true);
        staffRepository.save(staff);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Không tìm thấy Booking với id: " + bookingId));

        /**
         * For Eazy Testing, we commented these statements...
         */
        // LocalTime scheduledStartTime =
        // booking.getAvailableSlots().getFirst().getTimeSlot().getStartTime();
        // LocalTime now = LocalTime.now();
        // if (!now.isAfter(scheduledStartTime.minusMinutes(5L))) {
        // throw new EarlyWashSessionException("Chỉ có thể bắt đầu phiên rửa xe trước 5
        // phút");
        // }

        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);

        List<WashSession> washSessions = repository.findByBookingId(bookingId);
        for (WashSession washSession : washSessions) {
            washSession.setStaff(staff);
            washSession.setStatus(WashSessionStatus.IN_PROGRESS);
            washSession.setStartTime(LocalDateTime.now());
            repository.save(washSession);
        }

        List<WashSession> savedWashSessions = repository.findByBookingId(bookingId);
        return washSessionMapper.toResponseList(savedWashSessions);
    }

    @Transactional
    public List<WashSessionResponse> startWashSessionAssigningStaffVersion3(StartWashSessionRequest request,
            Long staffId) {

        Long bookingId = request.getBookingId();
        String staffNote = request.getStaffNote();

        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy staff"));
        staff.setOccupied(true);
        staffRepository.save(staff);

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Không tìm thấy Booking với id: " + bookingId));

        /**
         * For Eazy Testing, we commented these statements...
         */
        // LocalTime scheduledStartTime = booking.getAvailableSlots().getFirst().getTimeSlot().getStartTime();
        // LocalTime now = LocalTime.now();
        // if (now.isAfter(scheduledStartTime.minusMinutes(5L))) {
        //     log.info("startWashSessionAsigningStaff() - start the wash for the booking {}", booking.getBookingCode());
        //     log.info("scheduled start time: {}", scheduledStartTime.toString());
        //     log.info("Now: {}", now.toString());
        //     throw new EarlyWashSessionException("Chỉ có thể bắt đầu phiên rửa xe trước 5 phút");
        // }

        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);

        List<WashSession> washSessions = repository.findByBookingId(bookingId);
        for (WashSession washSession : washSessions) {
            washSession.setStaff(staff);
            washSession.setStatus(WashSessionStatus.IN_PROGRESS);
            washSession.setStartTime(LocalDateTime.now());
            washSession.setStaffNote(staffNote);
            repository.save(washSession);
        }

        List<WashSession> savedWashSessions = repository.findByBookingId(bookingId);
        return washSessionMapper.toResponseList(savedWashSessions);
    }

    @Transactional
    public List<WashSessionResponse> completeWashSessionVersion2(Long bookingId) {

        List<WashSession> washSessions = repository.findByBookingId(bookingId);
        for (WashSession washSession : washSessions) {
            washSession.setStatus(WashSessionStatus.COMPLETED);
            washSession.setEndTime(LocalDateTime.now());
            repository.save(washSession);

            Staff staff = washSession.getStaff();
            staff.setOccupied(false);
            staffRepository.save(staff);
        }

        List<WashSession> savedWashSessions = repository.findByBookingId(bookingId);

        /**
         * Create Billing immediately.
         */
        // billingService.createPendingBilling(bookingId);
        return washSessionMapper.toResponseList(savedWashSessions);
    }

    @Transactional
    public List<WashSessionResponse> startWashSessionAssigningNullStaff(StartWashSessionRequest request, Long staffId) {

        Long bookingId = request.getBookingId();
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Không tìm thấy mã đặt lịch với id: " + bookingId));

        Staff staff = null;

        if (staffId == null) {
            WashSession washSession = booking.getWashSessions().getFirst();
            staff = washSession.getStaff();
            if (staff == null) {
                LocalDate presentBookingDate = LocalDate.now();
                staff = staffService.getSpecificAlgorithmedStaff(presentBookingDate);
            }
        } else {
            staff = staffRepository.findById(staffId)
                    .orElseThrow(() -> new StaffNotFoundException("Không tìm thấy nhân viên với id: " + staffId));
        }
        return startWashSessionAssigningStaffVersion3(request, staff.getId());

    }

}
