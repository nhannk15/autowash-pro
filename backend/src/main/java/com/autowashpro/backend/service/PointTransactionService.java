package com.autowashpro.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.mapper.PointTransactionMapper;
import com.autowashpro.backend.model.dto.AdjustPointsResponse;
import com.autowashpro.backend.model.dto.RecentTransactionResponse;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.Notification;
import com.autowashpro.backend.model.entity.PointTransaction;
import com.autowashpro.backend.model.entity.Staff;
import com.autowashpro.backend.model.enums.NotificationType;
import com.autowashpro.backend.model.enums.TransactionType;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.PointTransactionRepository;
import com.autowashpro.backend.repository.StaffRepository;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class PointTransactionService {

    private final PointTransactionRepository pointTransactionRepository;
    private final CustomerRepository customerRepository;
    private final PointTransactionMapper pointTransactionMapper;
    private final StaffRepository staffRepository;
    private final NotificationService notificationService;

    @Autowired
    public PointTransactionService(PointTransactionRepository pointTransactionRepository,
            CustomerRepository customerRepository, PointTransactionMapper pointTransactionMapper,
            StaffRepository staffRepository, NotificationService notificationService) {
        this.pointTransactionRepository = pointTransactionRepository;
        this.customerRepository = customerRepository;
        this.pointTransactionMapper = pointTransactionMapper;
        this.staffRepository = staffRepository;
        this.notificationService = notificationService;
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

    @Transactional
    public AdjustPointsResponse adjustPoints(Long customerId, Long pointsChange, String reason, String staffEmail) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new UserNotFoundException(
                        "Không tìm thấy khách hàng với id: " + customerId));

        Staff staff = staffRepository.findByEmail(staffEmail)
                .orElseThrow(() -> new UserNotFoundException(
                        "Không tìm thấy nhân viên với email: " + staffEmail));

        if (pointsChange == 0) {
            throw new IllegalArgumentException("Số điểm thay đổi phải khác 0");
        }

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Lý do điều chỉnh không được để trống");
        }

        if (pointsChange < 0 && customer.getCurrentPoints() + pointsChange < 0) {
            throw new IllegalArgumentException(
                    "Khách hàng không đủ điểm để trừ. Số dư hiện tại: " + customer.getCurrentPoints()
                            + ", yêu cầu trừ: " + Math.abs(pointsChange));
        }

        TransactionType transactionType = pointsChange >= 0 ? TransactionType.BONUS : TransactionType.ADJUST;

        try {
            customer.setCurrentPoints(Math.addExact(customer.getCurrentPoints(), pointsChange));
            if (pointsChange > 0) {
                customer.setLifetimePoints(Math.addExact(customer.getLifetimePoints(), pointsChange));
            }
        } catch (ArithmeticException e) {
            throw new IllegalArgumentException("Số điểm vượt quá giới hạn lưu trữ cho phép của hệ thống");
        }
        customerRepository.save(customer);

        PointTransaction transaction = PointTransaction.builder()
                .customer(customer)
                .staff(staff)
                .transactionType(transactionType)
                .pointsChange(pointsChange)
                .balanceAfter(customer.getCurrentPoints())
                .description(reason)
                .expiryDate(pointsChange > 0 ? LocalDate.now().plusMonths(6) : null)
                .build();
        PointTransaction saved = pointTransactionRepository.save(transaction);

        String actionWord = pointsChange > 0 ? "được cộng" : "bị trừ";
        String title = "Biến động điểm thưởng";
        String bodyMessage = String.format("Tài khoản của bạn vừa %s %d điểm. Lý do: %s",
                actionWord, Math.abs(pointsChange), reason);

        Notification noti = new Notification();
        noti.setCustomer(customer);
        noti.setNotificationType(NotificationType.POINTS_ADJUST);
        noti.setTitle(title);
        noti.setBody(bodyMessage);
        noti.setRefId(saved.getId());
        noti.setRefType("POINT_TRANSACTION");
        notificationService.createNew(noti);

        log.info("Staff {} adjusted {} points for customer {}. Reason: {}. Balance: {}",
                staff.getFullName(), pointsChange, customer.getFullName(), reason,
                customer.getCurrentPoints());

        return AdjustPointsResponse.builder()
                .customerId(customer.getId())
                .customerName(customer.getFullName())
                .currentPoints(customer.getCurrentPoints())
                .transactionId(saved.getId())
                .transactionType(transactionType)
                .pointsChange(pointsChange)
                .balanceAfter(customer.getCurrentPoints())
                .description(reason)
                .createdByStaffName(staff.getFullName())
                .createdAt(saved.getCreatedAt())
                .build();
    }

}
