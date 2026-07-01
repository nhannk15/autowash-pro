package com.autowashpro.backend.service;

import java.math.BigDecimal;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autowashpro.backend.mapper.BillingMapper;
import com.autowashpro.backend.mapper.PromotionUsageMapper;
import com.autowashpro.backend.model.dto.DashboardSummaryResponse;
import com.autowashpro.backend.model.dto.DeductionChartItem;
import com.autowashpro.backend.model.dto.PeakHourStats;
import com.autowashpro.backend.model.dto.PromotionUsageStats;
import com.autowashpro.backend.model.dto.RecentTransactionItem;
import com.autowashpro.backend.model.dto.RevenueDataRequest;
import com.autowashpro.backend.model.dto.RevenueDataResponse;
import com.autowashpro.backend.model.dto.ServiceUsageStats;
import com.autowashpro.backend.model.entity.Billing;
import com.autowashpro.backend.model.entity.Promotion;
import com.autowashpro.backend.model.entity.PromotionUsage;
import com.autowashpro.backend.model.entity.Voucher;
import com.autowashpro.backend.model.enums.BayStatus;
import com.autowashpro.backend.model.enums.BookingStatus;
import com.autowashpro.backend.model.enums.DepositStatus;
import com.autowashpro.backend.model.enums.PaymentStatus;
import com.autowashpro.backend.model.enums.PromotionDiscountType;
import com.autowashpro.backend.model.enums.RewardType;
import com.autowashpro.backend.repository.BillingRepository;
import com.autowashpro.backend.repository.BookingRepository;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.PromotionUsageRepository;
import com.autowashpro.backend.repository.ServiceRepository;
import com.autowashpro.backend.repository.WashBayRepository;
import com.autowashpro.backend.repository.WashSessionRepository;

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
    private final WashSessionRepository washSessionRepository;
    private final PromotionUsageRepository promotionUsageRepository;
    private final PromotionUsageMapper promotionUsageMapper;

    @Autowired
    public AdminDashboardService(BillingRepository billingRepository, BookingRepository bookingRepository,
            CustomerRepository customerRepository, WashBayRepository washBayRepository,
            BillingMapper billingMapper, ServiceRepository serviceRepository,
            WashSessionRepository washSessionRepository, PromotionUsageRepository promotionUsageRepository,
            PromotionUsageMapper promotionUsageMapper) {
        this.billingRepository = billingRepository;
        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
        this.washBayRepository = washBayRepository;
        this.billingMapper = billingMapper;
        this.serviceRepository = serviceRepository;
        this.washSessionRepository = washSessionRepository;
        this.promotionUsageRepository = promotionUsageRepository;
        this.promotionUsageMapper = promotionUsageMapper;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(RevenueDataRequest request) {
        Long totalRevenue = 0L;
        Long previousRevenue = 0L;
        int totalBookings = 0;
        int completedBookings = 0;
        int cancelledBookings = 0;
        int pendingBookings = 0;
        int newCustomers = 0;
        int activeBays = washBayRepository.findByStatus(BayStatus.ACTIVE).size();
        int totalBays = washBayRepository.findAll().size();

        if (request.getStartDate() != null && request.getEndDate() != null) {
            LocalDate startDate = request.getStartDate();
            LocalDate endDate = request.getEndDate();
            log.info("AdminDashboardService - revenue from {} to {}", startDate, endDate);

            BigDecimal tempTotalRevenue = billingRepository.sumRevenueByPaidDateRange(startDate.atStartOfDay(),
                    endDate.plusDays(1).atStartOfDay().minusMinutes(1));
            if (tempTotalRevenue == null) {
                totalRevenue = 0L;
            } else {
                totalRevenue = tempTotalRevenue.longValue();
            }
            log.info("AdminDashboardService - totalRevenue: {}", totalRevenue);

            BigDecimal tempPreviousRevenue = billingRepository.sumRevenueByPaidDateRange(
                    startDate.minusDays(1L).atStartOfDay(),
                    startDate.atStartOfDay().minusMinutes(1));
            if (tempPreviousRevenue == null) {
                previousRevenue = 0L;
            } else {
                previousRevenue = tempPreviousRevenue.longValue();
            }
            log.info("AdminDashboardService - previousRevenue: {}", previousRevenue);

            totalBookings = bookingRepository.findBookingsAccordingToDate(startDate, endDate).size();
            log.info("AdminDashboardService - today's totalBookings: {}}", totalBookings);

            completedBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.COMPLETED, startDate, endDate)
                    .size();
            log.info("AdminDashboardService - today's completedBooking: {}", completedBookings);

            cancelledBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.CANCELLED, startDate, endDate)
                    .size();
            log.info("AdminDashboardService - today's cancelledBookings: {}", cancelledBookings);

            pendingBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.CONFIRMED, startDate, endDate)
                    .size();
            log.info("AdminDasboardService - today's pendingBookings: {}", pendingBookings);

            newCustomers = customerRepository.countNewCustomersBetween(startDate.atStartOfDay(),
                    endDate.plusDays(1L).atStartOfDay());
            log.info("AdminDasboardService - today's newCustomers: {}", newCustomers);

            log.info("AdminDasboardService - activeBays: {}", activeBays);
            log.info("AdminDasboardService - totalBays: {}", totalBays);

        } else if (request.getMonth() != null && request.getYear() != 0) {
            log.info("AdminDashboardService - revenue of {}/{}", request.getMonth(), request.getYear());
            LocalDate startDate = LocalDate.of(request.getYear(), request.getMonth().getValue(), 1);
            LocalDate endDate = startDate.plusMonths(1L).minusDays(1L);
            log.info("AdminDashboardService - revenue from {} to {}", startDate, endDate);

            BigDecimal tempTotalRevenue = billingRepository.sumRevenueByPaidDateRange(startDate.atStartOfDay(),
                    endDate.plusDays(1).atStartOfDay().minusMinutes(1));
            if (tempTotalRevenue == null) {
                totalRevenue = 0L;
            } else {
                totalRevenue = tempTotalRevenue.longValue();
            }
            log.info("AdminDashboardService - totalRevenue: {}", totalRevenue);

            BigDecimal tempPreviousRevenue = billingRepository.sumRevenueByPaidDateRange(
                    startDate.minusDays(1L).atStartOfDay(),
                    startDate.atStartOfDay().minusMinutes(1));
            if (tempPreviousRevenue == null) {
                previousRevenue = 0L;
            } else {
                previousRevenue = tempPreviousRevenue.longValue();
            }
            log.info("AdminDashboardService - previousRevenue: {}", previousRevenue);

            totalBookings = bookingRepository.findBookingsAccordingToDate(startDate, endDate).size();
            log.info("AdminDashboardService - today's totalBookings: {}}", totalBookings);

            completedBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.COMPLETED, startDate, endDate)
                    .size();
            log.info("AdminDashboardService - today's completedBooking: {}", completedBookings);

            cancelledBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.CANCELLED, startDate, endDate)
                    .size();
            log.info("AdminDashboardService - today's cancelledBookings: {}", cancelledBookings);

            pendingBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.CONFIRMED, startDate, endDate)
                    .size();
            log.info("AdminDasboardService - today's pendingBookings: {}", pendingBookings);

            newCustomers = customerRepository.countNewCustomersBetween(startDate.atStartOfDay(),
                    endDate.plusDays(1L).atStartOfDay());
            log.info("AdminDasboardService - today's newCustomers: {}", newCustomers);

            log.info("AdminDasboardService - activeBays: {}", activeBays);
            log.info("AdminDasboardService - totalBays: {}", totalBays);
        } else if (request.getYear() != 0) {
            LocalDate startDate = LocalDate.of(request.getYear(), 1, 1);
            LocalDate endDate = LocalDate.now();
            log.info("AdminDashboardService - revenue of {}", request.getYear());
            log.info("AdminDashboardService - revenue from {} to {}", startDate, endDate);

            BigDecimal tempTotalRevenue = billingRepository.sumRevenueByPaidDateRange(startDate.atStartOfDay(),
                    endDate.plusDays(1).atStartOfDay().minusMinutes(1));
            if (tempTotalRevenue == null) {
                totalRevenue = 0L;
            } else {
                totalRevenue = tempTotalRevenue.longValue();
            }
            log.info("AdminDashboardService - totalRevenue: {}", startDate, totalRevenue);

            BigDecimal tempPreviousRevenue = billingRepository.sumRevenueByPaidDateRange(
                    startDate.minusDays(1L).atStartOfDay(),
                    startDate.atStartOfDay().minusMinutes(1));
            if (tempPreviousRevenue == null) {
                previousRevenue = 0L;
            } else {
                previousRevenue = tempPreviousRevenue.longValue();
            }
            log.info("AdminDashboardService - previousRevenue: {}", previousRevenue);

            totalBookings = bookingRepository.findBookingsAccordingToDate(startDate, endDate).size();
            log.info("AdminDashboardService - today's totalBookings: {}}", totalBookings);

            completedBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.COMPLETED, startDate, endDate)
                    .size();
            log.info("AdminDashboardService - today's completedBooking: {}", completedBookings);

            cancelledBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.CANCELLED, startDate, endDate)
                    .size();
            log.info("AdminDashboardService - today's cancelledBookings: {}", cancelledBookings);

            pendingBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.CONFIRMED, startDate, endDate)
                    .size();
            log.info("AdminDasboardService - today's pendingBookings: {}", pendingBookings);

            newCustomers = customerRepository.countNewCustomersBetween(startDate.atStartOfDay(),
                    endDate.plusDays(1L).atStartOfDay());
            log.info("AdminDasboardService - today's newCustomers: {}", newCustomers);

            log.info("AdminDasboardService - activeBays: {}", activeBays);
            log.info("AdminDasboardService - totalBays: {}", totalBays);
        } else {
            LocalDate startDate = LocalDate.of(2000, 1, 1);
            LocalDate endDate = LocalDate.now();
            log.info("AdminDashboardService - revenue when started", request.getYear());
            log.info("AdminDashboardService - revenue from {} to {}", startDate, endDate);

            BigDecimal tempTotalRevenue = billingRepository.sumRevenueByPaidDateRange(startDate.atStartOfDay(),
                    endDate.plusDays(1).atStartOfDay().minusMinutes(1));
            if (tempTotalRevenue == null) {
                totalRevenue = 0L;
            } else {
                totalRevenue = tempTotalRevenue.longValue();
            }
            log.info("AdminDashboardService - totalRevenue: {}", startDate, totalRevenue);

            BigDecimal tempPreviousRevenue = billingRepository.sumRevenueByPaidDateRange(
                    startDate.minusDays(1L).atStartOfDay(),
                    startDate.atStartOfDay().minusMinutes(1));
            if (tempPreviousRevenue == null) {
                previousRevenue = 0L;
            } else {
                previousRevenue = tempPreviousRevenue.longValue();
            }
            log.info("AdminDashboardService - previousRevenue: {}", previousRevenue);

            totalBookings = bookingRepository.findBookingsAccordingToDate(startDate, endDate).size();
            log.info("AdminDashboardService - today's totalBookings: {}}", totalBookings);

            completedBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.COMPLETED, startDate, endDate)
                    .size();
            log.info("AdminDashboardService - today's completedBooking: {}", completedBookings);

            cancelledBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.CANCELLED, startDate, endDate)
                    .size();
            log.info("AdminDashboardService - today's cancelledBookings: {}", cancelledBookings);

            pendingBookings = bookingRepository
                    .findByStatusAccordingToDate(BookingStatus.CONFIRMED, startDate, endDate)
                    .size();
            log.info("AdminDasboardService - today's pendingBookings: {}", pendingBookings);

            newCustomers = customerRepository.countNewCustomersBetween(startDate.atStartOfDay(),
                    endDate.plusDays(1L).atStartOfDay());
            log.info("AdminDasboardService - today's newCustomers: {}", newCustomers);

            log.info("AdminDasboardService - activeBays: {}", activeBays);
            log.info("AdminDasboardService - totalBays: {}", totalBays);
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
        } else if (request.getMonth() != null && request.getYear() != 0) {
            LocalDate startDate = LocalDate.of(request.getYear(), request.getMonth().getValue(), 1);
            LocalDate endDate = startDate.plusMonths(1L).minusDays(1L);
            log.info("AdminDashboardService - get revenue in {}/{}", startDate.getMonth(), startDate.getYear());
            billings = billingRepository.findBillingsByStartDateAndEndDate(startDate.atStartOfDay(),
                    endDate.plusDays(1).atStartOfDay());
        } else if (request.getYear() != 0) {
            LocalDate startDate = LocalDate.of(request.getYear(), 1, 1);
            LocalDateTime endDate = LocalDateTime.now();
            log.info("AdminDashboardService - get revenue in {}/{}", startDate.getMonth(), startDate.getYear());
            billings = billingRepository.findBillingsByStartDateAndEndDate(startDate.atStartOfDay(),
                    endDate);
        } else {
            billings = billingRepository.findAllPaidBillings();
        }
        revenues = billingMapper.toRevenueDataResponses(billings);
        Map<LocalDate, RevenueDataResponse> revenueMap = new LinkedHashMap<>();
        for (RevenueDataResponse revenue : revenues) {
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

    public List<ServiceUsageStats> getServiceUsagesStats(RevenueDataRequest request) {
        if (request.getStartDate() != null && request.getEndDate() != null) {
            LocalDate startDate = request.getStartDate();
            LocalDate endDate = request.getEndDate();
            log.info("AdminDashboardService - get serviceUsageStats from {} to {}", startDate, endDate);
            if (endDate.isBefore(startDate)) {
                throw new DateTimeException("startDate can't be after endDate");
            }
            return serviceRepository.getServiceUsages(startDate.atStartOfDay(),
                    endDate.plusDays(1L).atStartOfDay().minusMinutes(1L));

        } else if (request.getMonth() != null && request.getYear() != 0) {
            LocalDate startDate = LocalDate.of(request.getYear(), request.getMonth().getValue(), 1);
            LocalDate endDate = startDate.plusMonths(1L).minusDays(1L);
            log.info("AdminDashboardService - get serviceUsageStats in {}/{}", startDate.getMonth(),
                    startDate.getYear());
            return serviceRepository.getServiceUsages(startDate.atStartOfDay(),
                    endDate.plusDays(1).atStartOfDay().minusMinutes(1L));
        } else if (request.getYear() != 0) {
            LocalDate startDate = LocalDate.of(request.getYear(), 1, 1);
            LocalDateTime endDate = LocalDateTime.now();
            log.info("AdminDashboardService - get revenue in {}/{}", startDate.getMonth(), startDate.getYear());
            return serviceRepository.getServiceUsages(startDate.atStartOfDay(),
                    endDate);
        } else {
            return serviceRepository.getAllServiceUsages();
        }

    }

    public List<PeakHourStats> getPeakHours(RevenueDataRequest request) {
        if (request.getStartDate() != null && request.getEndDate() != null) {
            LocalDate startDate = request.getStartDate();
            LocalDate endDate = request.getEndDate();
            log.info("AdminDashboardService - get peakHoursStats from {} to {}", startDate, endDate);
            if (endDate.isBefore(startDate)) {
                throw new DateTimeException("startDate can't be after endDate");
            }
            return washSessionRepository.getPeakHourStats(startDate.atStartOfDay(),
                    endDate.plusDays(1L).atStartOfDay().minusMinutes(1L));

        } else if (request.getMonth() != null && request.getYear() != 0) {
            LocalDate startDate = LocalDate.of(request.getYear(), request.getMonth().getValue(), 1);
            LocalDate endDate = startDate.plusMonths(1L).minusDays(1L);
            log.info("AdminDashboardService - get peakHoursStats in {}/{}", startDate.getMonth(),
                    startDate.getYear());
            return washSessionRepository.getPeakHourStats(startDate.atStartOfDay(),
                    endDate.plusDays(1).atStartOfDay().minusMinutes(1L));
        } else if (request.getYear() != 0) {
            LocalDate startDate = LocalDate.of(request.getYear(), 1, 1);
            LocalDateTime endDate = LocalDateTime.now();
            log.info("AdminDashboardService - get revenue in {}/{}", startDate.getMonth(), startDate.getYear());
            return washSessionRepository.getPeakHourStats(startDate.atStartOfDay(),
                    endDate);
        } else {
            return washSessionRepository.getAllPeakHourStats();
        }

    }

    public List<PromotionUsageStats> getPromotionUsageStats(RevenueDataRequest request) {

        if (request.getStartDate() != null && request.getEndDate() != null) {
            log.info("getPromotionUsageStats() - find all promotion usages from {} to {}.", request.getStartDate(),
                    request.getEndDate());

            LocalDateTime startTime = request.getStartDate().atStartOfDay();
            LocalDateTime endTime = request.getEndDate().plusDays(1L).atStartOfDay().minusMinutes(1L);

            List<PromotionUsage> promotionUsages = promotionUsageRepository.findFromStartTimeToEndTime(startTime,
                    endTime);
            return promotionUsageMapper.toPromotionUsageStatss(promotionUsages);
        } else if (request.getMonth() != null && request.getYear() != 0) {
            log.info("getPromotionUsageStats() - find all promotion usages in {}/{}.", request.getMonth().getValue(),
                    request.getYear());

            LocalDateTime startTime = LocalDate.of(request.getYear(), request.getMonth(), 1).atStartOfDay();
            LocalDateTime endTime = LocalDate.of(request.getYear(), request.getMonth(), 1).plusMonths(1L).atStartOfDay()
                    .minusMinutes(1L);

            List<PromotionUsage> promotionUsages = promotionUsageRepository.findFromStartTimeToEndTime(startTime,
                    endTime);
            return promotionUsageMapper.toPromotionUsageStatss(promotionUsages);
        } else if (request.getYear() != 0) {
            log.info("getPromotionUsageStats() - find all promotion usages in {}.", request.getYear());

            LocalDateTime startTime = LocalDateTime.of(request.getYear(), 1, 1, 0, 0, 0);
            LocalDateTime endTime = startTime.plusYears(1L).minusMinutes(1L);

            List<PromotionUsage> promotionUsages = promotionUsageRepository.findFromStartTimeToEndTime(startTime,
                    endTime);
            return promotionUsageMapper.toPromotionUsageStatss(promotionUsages);
        } else {
            List<PromotionUsage> promotionUsages = promotionUsageRepository.findAll();
            return promotionUsageMapper.toPromotionUsageStatss(promotionUsages);
        }

    }

    public HashMap<String, Long> countPromotionUsage(RevenueDataRequest request) {
        long usageCount = 0;

        if (request.getStartDate() != null && request.getEndDate() != null) {
            log.info("countPromotionUsage() - find all promotion usages from {} to {}.", request.getStartDate(),
                    request.getEndDate());

            LocalDateTime startTime = request.getStartDate().atStartOfDay();
            LocalDateTime endTime = request.getEndDate().plusDays(1L).atStartOfDay().minusMinutes(1L);

            usageCount = promotionUsageRepository.countFromStartTimeToEndTime(startTime, endTime);
        } else if (request.getMonth() != null && request.getYear() != 0) {
            log.info("countPromotionUsage() - find all promotion usages in {}/{}.", request.getMonth().getValue(),
                    request.getYear());

            LocalDateTime startTime = LocalDate.of(request.getYear(), request.getMonth(), 1).atStartOfDay();
            LocalDateTime endTime = LocalDate.of(request.getYear(), request.getMonth(), 1).plusMonths(1L).atStartOfDay()
                    .minusMinutes(1L);

            usageCount = promotionUsageRepository.countFromStartTimeToEndTime(startTime, endTime);
        } else if (request.getYear() != 0) {
            log.info("countPromotionUsage() - find all promotion usages in {}.", request.getYear());

            LocalDateTime startTime = LocalDateTime.of(request.getYear(), 1, 1, 0, 0, 0);
            LocalDateTime endTime = startTime.plusYears(1L).minusMinutes(1L);

            usageCount = promotionUsageRepository.countFromStartTimeToEndTime(startTime, endTime);
        } else {
            usageCount = promotionUsageRepository.count();
        }

        HashMap<String, Long> mapResponse = new HashMap<>();
        mapResponse.put("totalUsageCount", usageCount);
        return mapResponse;
    }

    @Transactional
    public List<DeductionChartItem> getPromotionDeductionChartItems(RevenueDataRequest request) {

        if (request.getStartDate() != null && request.getEndDate() != null) {
            log.info("getPromotionUsageStats() - find all promotion usages from {} to {}.", request.getStartDate(),
                    request.getEndDate());
            List<DeductionChartItem> result = new ArrayList<>();

            LocalDate startDate = request.getStartDate();
            LocalDate endDate = request.getEndDate();

            while (!startDate.isAfter(endDate)) {
                LocalDateTime startTime = startDate.atStartOfDay();
                LocalDateTime endTime = startDate.atTime(23, 59, 59);
                List<Billing> billings = billingRepository.findBillingsByStartDateAndEndDate(startTime, endTime);
                DeductionChartItem deductionChartItem = calculateDeduction(billings);
                deductionChartItem.setDay(startDate);
                result.add(deductionChartItem);

                startDate = startDate.plusDays(1L);

            }
            return result;

        } else if (request.getMonth() != null && request.getYear() != 0) {
            log.info("getPromotionUsageStats() - find all promotion usages in {}/{}.", request.getMonth().getValue(),
                    request.getYear());

            List<DeductionChartItem> result = new ArrayList<>();

            Month month = request.getMonth();
            int year = request.getYear();

            LocalDate startDate = LocalDate.of(year, month.getValue(), 1);
            LocalDate endDate = startDate.plusMonths(1L).minusDays(1L);

            while (!startDate.isAfter(endDate)) {
                LocalDateTime startTime = startDate.atStartOfDay();
                LocalDateTime endTime = startDate.atTime(23, 59, 59);
                List<Billing> billings = billingRepository.findBillingsByStartDateAndEndDate(startTime, endTime);
                DeductionChartItem deductionChartItem = calculateDeduction(billings);
                deductionChartItem.setDay(startDate);
                result.add(deductionChartItem);

                startDate = startDate.plusDays(1L);

            }

            return result;

        } else if (request.getYear() != 0) {
            log.info("getPromotionUsageStats() - find all promotion usages in {}.", request.getYear());

            List<DeductionChartItem> result = new ArrayList<>();

            int year = request.getYear();

            LocalDate startDate = LocalDate.of(year, 1, 1);
            LocalDate endDate = startDate.plusYears(1L).minusDays(1L);

            while (!startDate.isAfter(endDate)) {
                LocalDateTime startTime = startDate.atStartOfDay();
                LocalDateTime endTime = startDate.atTime(23, 59, 59);
                List<Billing> billings = billingRepository.findBillingsByStartDateAndEndDate(startTime, endTime);
                DeductionChartItem deductionChartItem = calculateDeduction(billings);
                deductionChartItem.setDay(startDate);
                result.add(deductionChartItem);

                startDate = startDate.plusDays(1L);

            }

            return result;

        } else {
            List<DeductionChartItem> result = new ArrayList<>();

            Optional<Billing> minBilling = billingRepository.findMinBilling();
            if (minBilling.isEmpty()) {
                return List.of();
            } else {
                LocalDateTime paidAt = minBilling.get().getPaidAt();
                LocalDateTime depositPaidAt = minBilling.get().getDepositPaidAt();
                LocalDate startDate = LocalDate.now();
                if (paidAt != null) {
                    startDate = paidAt.toLocalDate();
                } else if (depositPaidAt != null) {
                    startDate = depositPaidAt.toLocalDate();
                }

                LocalDate endDate = LocalDate.now();

                while (!startDate.isAfter(endDate)) {
                    LocalDateTime startTime = startDate.atStartOfDay();
                    LocalDateTime endTime = startDate.atTime(23, 59, 59);
                    List<Billing> billings = billingRepository.findBillingsByStartDateAndEndDate(startTime, endTime);
                    DeductionChartItem deductionChartItem = calculateDeduction(billings);
                    deductionChartItem.setDay(startDate);
                    result.add(deductionChartItem);

                    startDate = startDate.plusDays(1L);

                }

                return result;
            }

        }
    }

    private DeductionChartItem calculateDeduction(List<Billing> billings) {
        BigDecimal originalRevenue = billings
                .stream()
                .map((billing) -> {
                    if (billing.getDepositStatus().equals(DepositStatus.PAID) && billing.getPaymentStatus().equals(PaymentStatus.CANCELLED)) {
                        return billing.getDepositAmount();
                    } else {
                        return billing.getOriginalAmount();
                    }
                })
                .reduce(BigDecimal::add)
                .orElse(BigDecimal.ZERO);

        BigDecimal finalRevenue = billings
                .stream()
                .map((billing) -> {
                    if (billing.getDepositStatus().equals(DepositStatus.PAID) && billing.getPaymentStatus().equals(PaymentStatus.CANCELLED)) {
                        return billing.getDepositAmount();
                    } else if (billing.getDepositStatus().equals(DepositStatus.PAID) && billing.getPaymentStatus().equals(PaymentStatus.PENDING)) {
                        return billing.getDepositAmount();
                    } else {
                        return billing.getFinalAmount().add(billing.getDepositAmount());
                    }
                })
                .reduce(BigDecimal::add)
                .orElse(BigDecimal.ZERO);

        BigDecimal promotionDiscount = billings
                .stream()
                .map((billing) -> {
                    Promotion promotion = billing.getBooking().getPromotion();
                    if (promotion == null) {
                        return BigDecimal.ZERO;
                    } else if (promotion.getDiscountType().equals(PromotionDiscountType.FIXED_AMOUNT)) {
                        return promotion.getDiscountValue();
                    } else if (promotion.getDiscountType().equals(PromotionDiscountType.PERCENTAGE)) {
                        return billing.getOriginalAmount().multiply(promotion.getDiscountValue())
                                .divide(new BigDecimal(100L));
                    } else {
                        return BigDecimal.ZERO;
                    }
                })
                .reduce(BigDecimal::add)
                .orElse(BigDecimal.ZERO);

        BigDecimal voucherDiscount = billings
                .stream()
                .map((billing) -> {
                    Voucher voucher = billing.getVoucher();
                    if (voucher == null) {
                        return BigDecimal.ZERO;
                    } else if (voucher.getDiscountType().equals(RewardType.DISCOUNT_FLAT)) {
                        return voucher.getDiscountValue();
                    } else if (voucher.getDiscountType().equals(RewardType.DISCOUNT_PERCENTAGE)) {
                        Promotion promotion = billing.getBooking().getPromotion();
                        if (promotion == null) {
                            BigDecimal tempFinalAmount = billing.getOriginalAmount()
                                    .subtract(billing.getDepositAmount());
                            return tempFinalAmount.multiply(voucher.getDiscountValue())
                                    .divide(new BigDecimal(100L));

                        } else if (promotion.getDiscountType().equals(PromotionDiscountType.FIXED_AMOUNT)) {
                            BigDecimal tempFinalAmount = billing.getOriginalAmount()
                                    .subtract(promotion.getDiscountValue());
                            return tempFinalAmount.multiply(voucher.getDiscountValue())
                                    .divide(new BigDecimal(100L));

                        } else if (promotion.getDiscountType().equals(PromotionDiscountType.PERCENTAGE)) {
                            BigDecimal tempFinalAmount = billing.getOriginalAmount()
                                    .multiply(promotion.getDiscountValue()).divide(new BigDecimal(100L));
                            return tempFinalAmount.multiply(voucher.getDiscountValue())
                                    .divide(new BigDecimal(100L));

                        } else {
                            return BigDecimal.ZERO;
                        }
                    } else {
                        return BigDecimal.ZERO;
                    }

                })
                .reduce(BigDecimal::add)
                .orElse(BigDecimal.ZERO);

        BigDecimal totalDiscount = billings
                .stream()
                .map(Billing::getDiscountAmount)
                .reduce(BigDecimal::add)
                .orElse(BigDecimal.ZERO);

        long orderCount = billings.size();

        DeductionChartItem deductionChartItem = DeductionChartItem
                .builder()
                .day(null)
                .originalRevenue(originalRevenue)
                .finalRevenue(finalRevenue)
                .promotionDiscount(promotionDiscount)
                .voucherDiscount(voucherDiscount)
                .totalDiscount(totalDiscount)
                .orderCount(orderCount)
                .build();
        return deductionChartItem;
    }

}
