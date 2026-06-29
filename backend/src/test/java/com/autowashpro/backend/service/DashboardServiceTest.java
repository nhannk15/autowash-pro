package com.autowashpro.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.argThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.autowashpro.backend.model.dto.DashboardMetricsResponse;
import com.autowashpro.backend.model.enums.WashSessionStatus;
import com.autowashpro.backend.repository.BillingRepository;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.PointTransactionRepository;
import com.autowashpro.backend.repository.WashSessionRepository;

class DashboardServiceTest {

    private DashboardService dashboardService;
    private BillingRepository billingRepository;
    private WashSessionRepository washSessionRepository;
    private CustomerRepository customerRepository;
    private PointTransactionRepository pointTransactionRepository;

    @BeforeEach
    void setUp() {
        billingRepository = mock(BillingRepository.class);
        washSessionRepository = mock(WashSessionRepository.class);
        customerRepository = mock(CustomerRepository.class);
        pointTransactionRepository = mock(PointTransactionRepository.class);

        dashboardService = new DashboardService(
                billingRepository,
                washSessionRepository,
                customerRepository,
                pointTransactionRepository);
    }

    @Test
    void calculatePercentageChangeReturnsOneHundredWhenYesterdayIsZeroAndTodayIsPositive() {
        Double result = dashboardService.calculatePercentageChange(BigDecimal.TEN, BigDecimal.ZERO);

        assertEquals(100.0, result);
    }

    @Test
    void calculatePercentageChangeReturnsZeroWhenYesterdayAndTodayAreZero() {
        Double result = dashboardService.calculatePercentageChange(BigDecimal.ZERO, BigDecimal.ZERO);

        assertEquals(0.0, result);
    }

    @Test
    void calculatePercentageChangeReturnsNegativeOneHundredWhenTodayIsZeroAndYesterdayIsPositive() {
        Double result = dashboardService.calculatePercentageChange(BigDecimal.ZERO, BigDecimal.TEN);

        assertEquals(-100.0, result);
    }

    @Test
    void calculatePercentageChangeReturnsRoundedPercentageForNormalValues() {
        Double result = dashboardService.calculatePercentageChange(BigDecimal.valueOf(20), BigDecimal.valueOf(15));

        assertEquals(33.33, result);
    }

    @Test
    void getDailyMetricsReturnsSnapshotsForTodayAndYesterday() {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        when(billingRepository.sumRevenueByDate(today)).thenReturn(BigDecimal.valueOf(5_000_000));
        when(billingRepository.sumRevenueByDate(yesterday)).thenReturn(BigDecimal.valueOf(4_000_000));
        when(washSessionRepository.countByStatusAndDate(WashSessionStatus.PAID, today)).thenReturn(20L);
        when(washSessionRepository.countByStatusAndDate(WashSessionStatus.PAID, yesterday)).thenReturn(15L);
        when(customerRepository.countByCreatedAtDate(today)).thenReturn(5L);
        when(customerRepository.countByCreatedAtDate(yesterday)).thenReturn(10L);
        when(pointTransactionRepository.sumPointsIssuedByDate(argThat(dt -> dt != null && dt.toLocalDate().equals(today)))).thenReturn(1200L);
        when(pointTransactionRepository.sumPointsIssuedByDate(argThat(dt -> dt != null && dt.toLocalDate().equals(yesterday)))).thenReturn(800L);

        DashboardMetricsResponse response = dashboardService.getDailyMetrics();

        assertEquals(today, response.getDate());
        assertEquals(BigDecimal.valueOf(5_000_000), response.getRevenue().getValue());
        assertEquals(BigDecimal.valueOf(4_000_000), response.getRevenue().getYesterdayValue());
        assertEquals(25.0, response.getRevenue().getPercentageChange());
        assertEquals(20L, response.getSessionCount().getValue());
        assertEquals(15L, response.getSessionCount().getYesterdayValue());
        assertEquals(33.33, response.getSessionCount().getPercentageChange());
        assertEquals(5L, response.getNewCustomers().getValue());
        assertEquals(10L, response.getNewCustomers().getYesterdayValue());
        assertEquals(-50.0, response.getNewCustomers().getPercentageChange());
        assertEquals(1200L, response.getPointsIssued().getValue());
        assertEquals(800L, response.getPointsIssued().getYesterdayValue());
        assertEquals(50.0, response.getPointsIssued().getPercentageChange());

        verify(washSessionRepository).countByStatusAndDate(WashSessionStatus.PAID, today);
        verify(washSessionRepository).countByStatusAndDate(WashSessionStatus.PAID, yesterday);
    }

    @Test
    void getDailyMetricsTreatsNullSumsAsZero() {
        DashboardMetricsResponse response = dashboardService.getDailyMetrics();

        assertEquals(BigDecimal.ZERO, response.getRevenue().getValue());
        assertEquals(BigDecimal.ZERO, response.getRevenue().getYesterdayValue());
        assertEquals(0.0, response.getRevenue().getPercentageChange());
        assertEquals(0L, response.getPointsIssued().getValue());
        assertEquals(0L, response.getPointsIssued().getYesterdayValue());
        assertEquals(0.0, response.getPointsIssued().getPercentageChange());
    }

}
