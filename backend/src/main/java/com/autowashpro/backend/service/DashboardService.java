package com.autowashpro.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.dto.DashboardMetricsResponse;
import com.autowashpro.backend.model.dto.MetricSnapshot;
import com.autowashpro.backend.model.enums.WashSessionStatus;
import com.autowashpro.backend.repository.BillingRepository;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.PointTransactionRepository;
import com.autowashpro.backend.repository.WashSessionRepository;

@Service
public class DashboardService {

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final BillingRepository billingRepository;
    private final WashSessionRepository washSessionRepository;
    private final CustomerRepository customerRepository;
    private final PointTransactionRepository pointTransactionRepository;

    @Autowired
    public DashboardService(BillingRepository billingRepository,
                            WashSessionRepository washSessionRepository,
                            CustomerRepository customerRepository,
                            PointTransactionRepository pointTransactionRepository) {
        this.billingRepository = billingRepository;
        this.washSessionRepository = washSessionRepository;
        this.customerRepository = customerRepository;
        this.pointTransactionRepository = pointTransactionRepository;
    }

    public DashboardMetricsResponse getDailyMetrics() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        BigDecimal todayRevenue = zeroIfNull(billingRepository.sumRevenueByDate(today));
        BigDecimal yesterdayRevenue = zeroIfNull(billingRepository.sumRevenueByDate(yesterday));

        Long todaySessionCount = zeroIfNull(washSessionRepository.countByStatusAndDate(WashSessionStatus.PAID, today));
        Long yesterdaySessionCount = zeroIfNull(washSessionRepository.countByStatusAndDate(WashSessionStatus.PAID, yesterday));

        Long todayNewCustomers = zeroIfNull(customerRepository.countByCreatedAtDate(today));
        Long yesterdayNewCustomers = zeroIfNull(customerRepository.countByCreatedAtDate(yesterday));

        Long todayPointsIssued = zeroIfNull(pointTransactionRepository.sumPointsIssuedByDate(LocalDateTime.now()));
        Long yesterdayPointsIssued = zeroIfNull(pointTransactionRepository.sumPointsIssuedByDate(LocalDateTime.now().minusDays(1)));

        return new DashboardMetricsResponse(
                today,
                buildSnapshot(todayRevenue, yesterdayRevenue),
                buildSnapshot(todaySessionCount, yesterdaySessionCount),
                buildSnapshot(todayNewCustomers, yesterdayNewCustomers),
                buildSnapshot(todayPointsIssued, yesterdayPointsIssued));
    }

    MetricSnapshot buildSnapshot(Number value, Number yesterdayValue) {
        return new MetricSnapshot(
                value,
                yesterdayValue,
                calculatePercentageChange(toBigDecimal(value), toBigDecimal(yesterdayValue)));
    }

    Double calculatePercentageChange(BigDecimal today, BigDecimal yesterday) {
        if (yesterday.compareTo(BigDecimal.ZERO) == 0) {
            return today.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }

        if (today.compareTo(BigDecimal.ZERO) == 0) {
            return -100.0;
        }

        return today.subtract(yesterday)
                .multiply(ONE_HUNDRED)
                .divide(yesterday, 2, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private BigDecimal toBigDecimal(Number value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }

        if (value instanceof BigDecimal bigDecimal) {
            return bigDecimal;
        }

        return new BigDecimal(value.toString());
    }

    private BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private Long zeroIfNull(Long value) {
        return value == null ? 0L : value;
    }

}
