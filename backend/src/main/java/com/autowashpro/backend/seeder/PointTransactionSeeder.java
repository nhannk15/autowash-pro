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

        Customer leThiThuy = customerRepository.findByEmail("lethuyavhs@gmail.com")
                .orElseThrow(() -> new RuntimeException("Customer lethuyavhs@gmail.com not found"));
        Customer nguyenKhacLeNhan = customerRepository.findByEmail("nhannk2101@gmail.com")
                .orElseThrow(() -> new RuntimeException("Customer nhannk2101@gmail.com not found"));
        Staff staff = staffRepository.findByEmail("khacbuu@gmail.com")
                .orElseThrow(() -> new RuntimeException("Staff khacbuu@gmail.com not found"));

        /*
         * Seed 2 PointTransaction mẫu để hiển thị trên UI lịch sử giao dịch.
         *
         * Lưu ý:
         * - Dùng email thay vì ID cứng → không phụ thuộc thứ tự insert của seeder khác
         * - KHÔNG tự ý sửa currentPoints/lifetimePoints của customer.
         *   Việc cộng/trừ điểm chỉ thực hiện qua API /api/staff/customers/{id}/points
         *   hoặc khi thanh toán hóa đơn.
         * - balanceAfter = customer.getCurrentPoints() (snapshot hiện tại, ảo cho demo)
         */

        // 1. BONUS +500 cho Lê Thị Thúy
        PointTransaction bonus = PointTransaction.builder()
                .customer(leThiThuy)
                .staff(staff)
                .transactionType(TransactionType.BONUS)
                .pointsChange(500L)
                .balanceAfter(leThiThuy.getCurrentPoints())
                .description("Bù điểm do lỗi hệ thống không tích điểm sau thanh toán")
                .expiryDate(java.time.LocalDate.now().plusMonths(6))
                .build();
        pointTransactionRepository.save(bonus);

        // 2. ADJUST -200 cho Nguyễn Khắc Lê Nhân
        PointTransaction adjust = PointTransaction.builder()
                .customer(nguyenKhacLeNhan)
                .staff(staff)
                .transactionType(TransactionType.ADJUST)
                .pointsChange(-200L)
                .balanceAfter(nguyenKhacLeNhan.getCurrentPoints())
                .description("Điều chỉnh trừ điểm khuyến mãi cộng nhầm")
                .build();
        pointTransactionRepository.save(adjust);
    }
}
