package com.autowashpro.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autowashpro.backend.exception.BookingNotFoundException;
import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.mapper.WashSessionMapper;
import com.autowashpro.backend.model.dto.WashSessionResponse;
import com.autowashpro.backend.model.entity.Billing;
import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.model.entity.Staff;
import com.autowashpro.backend.model.entity.WashSession;
import com.autowashpro.backend.model.enums.BookingStatus;
import com.autowashpro.backend.model.enums.WashSessionStatus;
import com.autowashpro.backend.repository.BookingRepository;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.StaffRepository;
import com.autowashpro.backend.repository.WashSessionRepository;

@Service
public class WashSessionService {

    private final WashSessionRepository repository;
    private final StaffRepository staffRepository;
    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final WashSessionMapper washSessionMapper;
    private final BillingService billingService;

    @Autowired
    public WashSessionService(WashSessionRepository repository, StaffRepository staffRepository,
            BookingRepository bookingRepository, CustomerRepository customerRepository,
            WashSessionMapper washSessionMapper, BillingService billingService) {
        this.repository = repository;
        this.staffRepository = staffRepository;
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
        this.washSessionMapper = washSessionMapper;
        this.billingService = billingService;
    }

    @Transactional
    public List<WashSessionResponse> startWashSession(Long bookingId, String email) {
        Staff staff = staffRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy staff"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Không tìm thấy Booking với id: " + bookingId));

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
    public List<WashSessionResponse> completeWashSession(Long bookingId, String email) {
        Staff staff = staffRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy staff"));
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
        Billing newBilling = billingService.createPendingBilling(bookingId);
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

}
