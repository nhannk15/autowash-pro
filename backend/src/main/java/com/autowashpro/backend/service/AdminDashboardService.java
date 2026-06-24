package com.autowashpro.backend.service;

import java.math.BigDecimal;
import java.time.DateTimeException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autowashpro.backend.mapper.BillingMapper;
import com.autowashpro.backend.model.dto.DashboardSummaryResponse;
import com.autowashpro.backend.model.dto.RecentTransactionItem;
import com.autowashpro.backend.model.dto.RevenueDataRequest;
import com.autowashpro.backend.model.dto.RevenueDataResponse;
import com.autowashpro.backend.model.dto.ServiceUsageStats;
import com.autowashpro.backend.model.entity.Billing;
import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.model.enums.BayStatus;
import com.autowashpro.backend.model.enums.BookingStatus;
import com.autowashpro.backend.repository.BillingRepository;
import com.autowashpro.backend.repository.BookingRepository;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.ServiceRepository;
import com.autowashpro.backend.repository.WashBayRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AdminDashboardService {

    private final BillingRepository billingRepository;
    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final WashBayRepository washBayRepository;
    private final BillingMapper billingMapper;
    private final ServiceRepository serviceRepository;

    @Autowired
    public AdminDashboardService(BillingRepository billingRepository, BookingRepository bookingRepository,
            CustomerRepository customerRepository, WashBayRepository washBayRepository,
            BillingMapper billingMapper, ServiceRepository serviceRepository) {
        this.billingRepository = billingRepository;
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
        this.washBayRepository = washBayRepository;
        this.billingMapper = billingMapper;
        this.serviceRepository = serviceRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(String period) {
        Long totalRevenue = 0L;
        Long previousRevenue = 0L;
        ;
        int totalBookings = 0;
        int completedBookings = 0;
        int cancelledBookings = 0;
        int pendingBookings = 0;
        int newCustomers = 0;
        int activeBays = washBayRepository.findByStatus(BayStatus.ACTIVE).size();
        int totalBays = washBayRepository.findAll().size();

        if (period.trim().equalsIgnoreCase("today")) {
            log.info("AdminDashboardService - start getting today's metrics");
            LocalDate today = LocalDate.now();
            totalRevenue = billingRepository.sumRevenueByDate(today).longValue();
            log.info("AdminDashboardService - today's totalRevenue: {}", totalRevenue);

            previousRevenue = billingRepository.sumRevenueByDate(today.minusDays(1L)).longValue();
            log.info("AdminDashboardService - yesterday's totalRevenue: {}", previousRevenue);

            totalBookings = bookingRepository.findBookingsAccordingToDate(today, today).size();
            log.info("AdminDashboardService - today's totalBookings: {}}", totalBookings);

            completedBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.COMPLETED, today, today)
                    .size();
            log.info("AdminDashboardService - today's completedBooking: {}", completedBookings);

            cancelledBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.CANCELLED, today, today)
                    .size();
            log.info("AdminDashboardService - today's cancelledBookings: {}", cancelledBookings);

            pendingBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.CONFIRMED, today, today)
                    .size();
            log.info("AdminDasboardService - today's pendingBookings: {}", pendingBookings);

            newCustomers = customerRepository.countNewCustomersBetween(today.atStartOfDay(),
                    today.plusDays(1L).atStartOfDay());
            log.info("AdminDasboardService - today's newCustomers: {}", newCustomers);

            log.info("AdminDasboardService - activeBays: {}", activeBays);

            log.info("AdminDasboardService - totalBays: {}", totalBays);

        } else if (period.trim().equalsIgnoreCase("week")) {
            log.info("AdminDashboardService - start getting week's metrics");
            LocalDate today = LocalDate.now();
            LocalDate startOfThisWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            LocalDate startOfLastWeek = startOfThisWeek.minusWeeks(1L);
            LocalDate endOfLastWeek = startOfLastWeek.plusDays(6L);

            BigDecimal tempTotalReveneu = billingRepository
                    .sumRevenueByPaidDateRange(startOfLastWeek.atStartOfDay(),
                            today.plusDays(1L).atStartOfDay());
            if (tempTotalReveneu != null) {
                totalRevenue = tempTotalReveneu.longValue();
            }
            log.info("AdminDashboardService - week's totalRevenue: {}", totalRevenue);

            BigDecimal tempPreviousRevenue = billingRepository
                    .sumRevenueByPaidDateRange(startOfLastWeek.atStartOfDay(),
                            endOfLastWeek.plusDays(1L).atStartOfDay());
            if (tempPreviousRevenue != null) {
                previousRevenue = tempPreviousRevenue.longValue();
            }
            log.info("AdminDashboardService - last week's totalRevenue: {}", previousRevenue);

            totalBookings = bookingRepository.findBookingsAccordingToDate(startOfThisWeek, today).size();
            log.info("AdminDashboardService - week's totalBookings: {}}", totalBookings);

            completedBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.COMPLETED, startOfThisWeek, today)
                    .size();
            log.info("AdminDashboardService - week's completedBooking: {}", completedBookings);

            cancelledBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.CANCELLED, startOfThisWeek, today)
                    .size();
            log.info("AdminDashboardService - week's cancelledBookings: {}", cancelledBookings);

            pendingBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.CONFIRMED, startOfThisWeek, today)
                    .size();
            log.info("AdminDasboardService - week's pendingBookings: {}", pendingBookings);

            newCustomers = customerRepository.countNewCustomersBetween(startOfThisWeek.atStartOfDay(),
                    today.plusDays(1L).atStartOfDay());
            log.info("AdminDasboardService - week's newCustomers: {}", newCustomers);

            log.info("AdminDasboardService - activeBays: {}", activeBays);

            log.info("AdminDasboardService - totalBays: {}", totalBays);
        } else if (period.trim().equalsIgnoreCase("month")) {
            log.info("AdminDashboardService - start getting month's metrics");
            LocalDate today = LocalDate.now();
            LocalDate startOfThisMonth = today.withDayOfMonth(1);
            LocalDate startOfLastMonth = startOfThisMonth.minusMonths(1L);
            LocalDate endOfLastMonth = today.withDayOfMonth(1).minusDays(1L);

            BigDecimal tempTotalReveneu = billingRepository
                    .sumRevenueByPaidDateRange(startOfThisMonth.atStartOfDay(),
                            today.plusDays(1L).atStartOfDay());
            if (tempTotalReveneu != null) {
                totalRevenue = tempTotalReveneu.longValue();
            }
            log.info("AdminDashboardService - week's totalRevenue: {}", totalRevenue);

            BigDecimal tempPreviousRevenue = billingRepository
                    .sumRevenueByPaidDateRange(startOfLastMonth.atStartOfDay(),
                            endOfLastMonth.plusDays(1L).atStartOfDay());
            if (tempPreviousRevenue != null) {
                previousRevenue = tempPreviousRevenue.longValue();
            }
            log.info("AdminDashboardService - last week's totalRevenue: {}", previousRevenue);

            totalBookings = bookingRepository.findBookingsAccordingToDate(startOfThisMonth, today).size();
            log.info("AdminDashboardService - week's totalBookings: {}}", totalBookings);

            completedBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.COMPLETED, startOfThisMonth, today)
                    .size();
            log.info("AdminDashboardService - week's completedBooking: {}", completedBookings);

            cancelledBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.CANCELLED, startOfThisMonth, today)
                    .size();
            log.info("AdminDashboardService - week's cancelledBookings: {}", cancelledBookings);

            pendingBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.CONFIRMED, startOfThisMonth, today)
                    .size();
            log.info("AdminDasboardService - week's pendingBookings: {}", pendingBookings);

            newCustomers = customerRepository.countNewCustomersBetween(startOfThisMonth.atStartOfDay(),
                    today.plusDays(1L).atStartOfDay());
            log.info("AdminDasboardService - week's newCustomers: {}", newCustomers);

            log.info("AdminDasboardService - activeBays: {}", activeBays);

            log.info("AdminDasboardService - totalBays: {}", totalBays);
        } else if (period.trim().equalsIgnoreCase("year")) {
            log.info("AdminDashboardService - start getting year's metrics");
            LocalDate today = LocalDate.now();
            LocalDate startOfThisYear = today.withDayOfYear(1);
            LocalDate startOfLastYear = startOfThisYear.minusYears(1);
            LocalDate endOfLastYear = today.withDayOfYear(1).minusDays(1L);

            BigDecimal tempTotalReveneu = billingRepository
                    .sumRevenueByPaidDateRange(startOfThisYear.atStartOfDay(),
                            today.plusDays(1L).atStartOfDay());
            if (tempTotalReveneu != null) {
                totalRevenue = tempTotalReveneu.longValue();
            }
            log.info("AdminDashboardService - year's totalRevenue: {}", totalRevenue);

            BigDecimal tempPreviousRevenue = billingRepository
                    .sumRevenueByPaidDateRange(startOfLastYear.atStartOfDay(),
                            endOfLastYear.plusDays(1L).atStartOfDay());
            if (tempPreviousRevenue != null) {
                previousRevenue = tempPreviousRevenue.longValue();
            }
            log.info("AdminDashboardService - last year's totalRevenue: {}", previousRevenue);

            totalBookings = bookingRepository.findBookingsAccordingToDate(startOfThisYear, today).size();
            log.info("AdminDashboardService - year's totalBookings: {}}", totalBookings);

            completedBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.COMPLETED, startOfThisYear, today)
                    .size();
            log.info("AdminDashboardService - year's completedBooking: {}", completedBookings);

            cancelledBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.CANCELLED, startOfThisYear, today)
                    .size();
            log.info("AdminDashboardService - year's cancelledBookings: {}", cancelledBookings);

            pendingBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.CONFIRMED, startOfThisYear, today)
                    .size();
            log.info("AdminDasboardService - year's pendingBookings: {}", pendingBookings);

            newCustomers = customerRepository.countNewCustomersBetween(startOfThisYear.atStartOfDay(),
                    today.plusDays(1L).atStartOfDay());
            log.info("AdminDasboardService - year's newCustomers: {}", newCustomers);

            log.info("AdminDasboardService - activeBays: {}", activeBays);

            log.info("AdminDasboardService - totalBays: {}", totalBays);
        } else if (period.trim().equalsIgnoreCase("all")) {
            log.info("AdminDashboardService - start getting all's period");

            BigDecimal tempTotalReveneu = billingRepository.sumRevenue();
            if (tempTotalReveneu != null) {
                totalRevenue = tempTotalReveneu.longValue();
            }
            log.info("AdminDashboardService - year's totalRevenue: {}", totalRevenue);

            log.info("AdminDashboardService - last year's totalRevenue: {}", previousRevenue);

            List<Booking> allBookings = bookingRepository.findAll();

            totalBookings = allBookings.size();
            log.info("AdminDashboardService - year's totalBookings: {}}", totalBookings);

            completedBookings = allBookings.stream()
                    .filter(booking -> booking.getStatus() == BookingStatus.COMPLETED)
                    .toList().size();
            log.info("AdminDashboardService - year's completedBooking: {}", completedBookings);

            cancelledBookings = allBookings.stream()
                    .filter(booking -> booking.getStatus() == BookingStatus.CANCELLED)
                    .toList().size();
            log.info("AdminDashboardService - year's cancelledBookings: {}", cancelledBookings);

            pendingBookings = allBookings.stream()
                    .filter(booking -> booking.getStatus() == BookingStatus.CONFIRMED)
                    .toList().size();
            log.info("AdminDasboardService - year's pendingBookings: {}", pendingBookings);

            newCustomers = customerRepository.findAll().size();
            log.info("AdminDasboardService - year's newCustomers: {}", newCustomers);

            log.info("AdminDasboardService - activeBays: {}", activeBays);

            log.info("AdminDasboardService - totalBays: {}", totalBays);
        } else {
            throw new RuntimeException("There's no such that period");
        }

        log.info("AdminDasboardService - complete creating response");
        DashboardSummaryResponse response = DashboardSummaryResponse
                .builder()
                .totalRevenue(totalRevenue)
                .previousRevenue(previousRevenue)
                .totalBookings(totalBookings)
                .completedBookings(completedBookings)
                .cancelledBookings(cancelledBookings)
                .newCustomers(newCustomers)
                .activeBays(activeBays)
                .totalBays(totalBays)
                .build();

        return response;
    }

    @Transactional(readOnly = true)
    public List<RecentTransactionItem> getRecentTransactions() {
        return billingMapper.toRecentTransactionItems(billingRepository.getRecentTransactions());
    }

    public List<RevenueDataResponse> getRevenueData(RevenueDataRequest request) {
        log.info("AdminDashboardService - getRevenueData()");

        log.info("AdminDashboardService - data: {} {} {} {}", request.getStartDate(), request.getEndDate(),
                request.getMonth(), request.getYear());

        List<RevenueDataResponse> revenues = new ArrayList<>();
        List<Billing> billings = new ArrayList<>();
        if (request.getStartDate() != null && request.getEndDate() != null) {
            LocalDate startDate = request.getStartDate();
            LocalDate endDate = request.getEndDate();
            log.info("AdminDashboardService - get revenue from {} to {}", startDate, endDate);
            if (endDate.isBefore(startDate)) {
                throw new DateTimeException("startDate can't be after endDate");
            }

            billings = billingRepository.findBillingsByStartDateAndEndDate(startDate.atStartOfDay(),
                    endDate.plusDays(1).atStartOfDay());
        } else if (request.getMonth() != null && request.getYear() != 0){
            LocalDate startDate = LocalDate.of(request.getYear(), request.getMonth().getValue(), 1);
            LocalDate endDate = startDate.plusMonths(1L).minusDays(1L);
            log.info("AdminDashboardService - get revenue in {}/{}", startDate.getMonth(), startDate.getYear());
            billings = billingRepository.findBillingsByStartDateAndEndDate(startDate.atStartOfDay(),
                    endDate.plusDays(1).atStartOfDay());
        } else {
            throw new IllegalArgumentException("Vui lòng cung cấp startDate/endDate hoặc month/year");
        }
        revenues = billingMapper.toRevenueDataResponses(billings);
        Map<LocalDate, RevenueDataResponse> revenueMap = new LinkedHashMap<>();
        for (RevenueDataResponse revenue: revenues) {
            if (revenueMap.containsKey(revenue.getDay())) {
                RevenueDataResponse targetRevenue = revenueMap.get(revenue.getDay());
                targetRevenue.setRevenue(targetRevenue.getRevenue().add(revenue.getRevenue()));
                targetRevenue.setTotalOrders(targetRevenue.getTotalOrders() + 1);
            } else {
                revenue.setTotalOrders(1);
                revenueMap.put(revenue.getDay(), revenue);
            }
        }
        
        return new ArrayList<>(revenueMap.values());
    }

    public List<ServiceUsageStats> getServiceUsagesStats() {
        return serviceRepository.getServiceUsages();
    }
}
