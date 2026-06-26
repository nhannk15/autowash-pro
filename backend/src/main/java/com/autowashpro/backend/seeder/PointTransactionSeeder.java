package com.autowashpro.backend.seeder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.PointTransaction;
import com.autowashpro.backend.model.entity.Staff;
import com.autowashpro.backend.model.enums.TransactionType;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.PointTransactionRepository;
import com.autowashpro.backend.repository.StaffRepository;

@Component
@Order(16)
public class PointTransactionSeeder implements Seeder {

    private final PointTransactionRepository pointTransactionRepository;
    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;

    @Autowired
    public PointTransactionSeeder(PointTransactionRepository pointTransactionRepository,
            CustomerRepository customerRepository, StaffRepository staffRepository) {
        this.pointTransactionRepository = pointTransactionRepository;
        this.customerRepository = customerRepository;
        this.staffRepository = staffRepository;
    }

    @Override
    public void seed() {
        if (pointTransactionRepository.count() > 0)
            return;

        Customer leThiThuy = customerRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("Customer id=1 not found"));
        Customer nguyenKhacLeNhan = customerRepository.findById(2L)
                .orElseThrow(() -> new RuntimeException("Customer id=2 not found"));
        Staff staff = staffRepository.findByEmail("khacbuu@gmail.com")
                .orElseThrow(() -> new RuntimeException("Staff khacbuu@gmail.com not found"));

        // 1. BONUS +500 for Lê Thị Thúy
        PointTransaction bonus = PointTransaction.builder()
                .customer(leThiThuy)
                .staff(staff)
                .transactionType(TransactionType.BONUS)
                .pointsChange(500L)
                .balanceAfter(leThiThuy.getCurrentPoints() + 500)
                .description("Bù điểm do lỗi hệ thống không tích điểm sau thanh toán")
                .build();
        pointTransactionRepository.save(bonus);

        leThiThuy.setCurrentPoints(leThiThuy.getCurrentPoints() + 500);
        leThiThuy.setLifetimePoints(leThiThuy.getLifetimePoints() + 500);
        customerRepository.save(leThiThuy);

        // 2. ADJUST -200 for Nguyễn Khắc Lê Nhân
        PointTransaction adjust = PointTransaction.builder()
                .customer(nguyenKhacLeNhan)
                .staff(staff)
                .transactionType(TransactionType.ADJUST)
                .pointsChange(-200L)
                .balanceAfter(nguyenKhacLeNhan.getCurrentPoints() - 200)
                .description("Điều chỉnh trừ điểm khuyến mãi cộng nhầm")
                .build();
        pointTransactionRepository.save(adjust);

        nguyenKhacLeNhan.setCurrentPoints(nguyenKhacLeNhan.getCurrentPoints() - 200);
        customerRepository.save(nguyenKhacLeNhan);
    }
}
