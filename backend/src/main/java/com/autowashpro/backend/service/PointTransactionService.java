package com.autowashpro.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.mapper.PointTransactionMapper;
import com.autowashpro.backend.model.dto.RecentTransactionResponse;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.PointTransaction;
import com.autowashpro.backend.model.enums.TransactionType;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.PointTransactionRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PointTransactionService {

    private final PointTransactionRepository pointTransactionRepository;
    private final CustomerRepository customerRepository;
    private final PointTransactionMapper pointTransactionMapper;

    @Autowired
    public PointTransactionService(PointTransactionRepository pointTransactionRepository,
            CustomerRepository customerRepository, PointTransactionMapper pointTransactionMapper) {
        this.pointTransactionRepository = pointTransactionRepository;
        this.customerRepository = customerRepository;
        this.pointTransactionMapper = pointTransactionMapper;
    }

    public void evaluatePointTransactionExpiryDate() {
        LocalDate today = LocalDate.now();
        List<PointTransaction> pointTransactions = pointTransactionRepository.getExpiredAndEarnPointTransactions(today);
        for (PointTransaction pointTransaction : pointTransactions) {
            pointTransaction.setTransactionType(TransactionType.EXPIRE);
            pointTransaction.setDescription("Điểm Transaction tại ngày " + pointTransaction.getCreatedAt().toLocalDate() + " đã hết hạn.");
            pointTransaction.setCreatedAt(LocalDateTime.now());
            pointTransactionRepository.save(pointTransaction);

            Customer customer = pointTransaction.getCustomer();
            Long pointsChange = pointTransaction.getPointsChange();
            if (customer.getCurrentPoints() >= pointsChange) {
                customer.setCurrentPoints(customer.getCurrentPoints() - pointsChange);
            } else {
                customer.setCurrentPoints(0L);
            }
            customerRepository.save(customer);
        }
    }

    public Long calculateTotalPointsEarnForCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy khách hàng với id: " + customerId));
        return pointTransactionRepository.calculateTotalPointsEarned(customer.getId());
    }

    public List<RecentTransactionResponse> getCustomerRecentActivities(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không thể tìm thấy khách hàng với email: " + email));
        List<PointTransaction> recentActivities = pointTransactionRepository
                .findByCustomerIdOrderByCreatedAtDesc(customer.getId());
        return pointTransactionMapper.toRecentTransactionResponses(recentActivities);
    }

}
