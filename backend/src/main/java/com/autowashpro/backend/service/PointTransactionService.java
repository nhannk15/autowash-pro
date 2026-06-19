package com.autowashpro.backend.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.PointTransaction;
import com.autowashpro.backend.model.enums.TransactionType;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.PointTransactionRepository;

@Service
public class PointTransactionService {

    private final PointTransactionRepository pointTransactionRepository;
    private final CustomerRepository customerRepository;

    @Autowired
    public PointTransactionService(PointTransactionRepository pointTransactionRepository, CustomerRepository customerRepository) {
        this.pointTransactionRepository = pointTransactionRepository;
        this.customerRepository = customerRepository;
    }

    public void evaluatePointTransactionExpiryDate() {
        LocalDate today = LocalDate.now();
        List<PointTransaction> pointTransactions = pointTransactionRepository.getExpiredAndEarnPointTransactions(today);
        for (PointTransaction pointTransaction: pointTransactions) {
            pointTransaction.setTransactionType(TransactionType.EXPIRE);
            pointTransactionRepository.save(pointTransaction);

            Customer customer = pointTransaction.getCustomer();
            customer.setCurrentPoints(customer.getCurrentPoints() - pointTransaction.getPointsChange());
            customerRepository.save(customer);
            
        }
    }

    public Long totalPointsEarnForCustomer(Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy khách hàng với id: " + customerId));
        return pointTransactionRepository.calculateTotalPointsEarned(customer.getId());
    }

}
