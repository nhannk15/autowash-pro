package com.autowashpro.backend.seeder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.Promotion;
import com.autowashpro.backend.model.entity.Staff;
import com.autowashpro.backend.model.enums.PromotionDiscountType;
import com.autowashpro.backend.repository.PromotionRepository;
import com.autowashpro.backend.repository.StaffRepository;

@Component
public class PromotionSeeder {
    
    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private  StaffRepository staffRepository;

    public void seed() {
        if (promotionRepository.count() > 0) return;

        Staff admin = staffRepository.findByEmail("nhannk15@gmail.com").orElseThrow();

        // Tết dương lịch 1/1
        save(admin, "Tết Dương Lịch 2026",
            "Combo Rửa xe ngoại thất cao cấp + Khử mùi diệt khuẩn cabin, x2 điểm thưởng.",
            LocalDateTime.of(2025, 12, 31, 0, 0),
            LocalDateTime.of(2026, 1, 2, 23, 59),
            PromotionDiscountType.PERCENTAGE, new BigDecimal("10"),
            null, 500L, 1L);

        // Tết âm lịch (24-28 tháng Chạp ~ 22-26/1/2026)
        save(admin, "Tết Nguyên Đán 2026",
            "Combo Vệ sinh nội thất chuyên sâu + Rửa xe ngoại thất cao cấp, x3 điểm thưởng.",
            LocalDateTime.of(2026, 1, 22, 0, 0),
            LocalDateTime.of(2026, 1, 26, 23, 59),
            PromotionDiscountType.PERCENTAGE, new BigDecimal("15"),
            null, 500L, 1L);

        // 8/3
        save(admin, "Ngày Quốc Tế Phụ Nữ 8/3",
            "Giảm giá đặc biệt dành cho khách hàng nữ.",
            LocalDateTime.of(2026, 3, 8, 0, 0),
            LocalDateTime.of(2026, 3, 8, 23, 59),
            PromotionDiscountType.PERCENTAGE, new BigDecimal("20"),
            null, 300L, 1L);

        // Giỗ tổ Hùng Vương 10/3 âm lịch ~ 7/4/2026
        save(admin, "Giỗ Tổ Hùng Vương 2026",
            "Combo Rửa xe ngoại thất cao cấp + Vệ sinh khoang máy chuyên sâu.",
            LocalDateTime.of(2026, 4, 7, 0, 0),
            LocalDateTime.of(2026, 4, 7, 23, 59),
            PromotionDiscountType.PERCENTAGE, new BigDecimal("10"),
            null, 300L, 1L);

        // 30/4 - 1/5
        save(admin, "Lễ 30/4 - 1/5 2026",
            "Combo Rửa xe ngoại thất cao cấp + Bảo dưỡng nhanh tổng quát, x2 điểm thưởng.",
            LocalDateTime.of(2026, 4, 30, 0, 0),
            LocalDateTime.of(2026, 5, 1, 23, 59),
            PromotionDiscountType.PERCENTAGE, new BigDecimal("10"),
            null, 500L, 1L);

        // Mùa hè 28-30/6
        save(admin, "Khuyến Mãi Mùa Hè 2026",
            "Combo Vệ sinh nội thất chuyên sâu + Khử mùi diệt khuẩn cabin.",
            LocalDateTime.of(2026, 6, 28, 0, 0),
            LocalDateTime.of(2026, 6, 30, 23, 59),
            PromotionDiscountType.PERCENTAGE, new BigDecimal("15"),
            null, 500L, 1L);

        // 1-2/9
        save(admin, "Lễ Quốc Khánh 2/9 2026",
            "Combo Vệ sinh nội thất chuyên sâu + Rửa xe ngoại thất cao cấp, x2 điểm thưởng.",
            LocalDateTime.of(2026, 9, 1, 0, 0),
            LocalDateTime.of(2026, 9, 2, 23, 59),
            PromotionDiscountType.PERCENTAGE, new BigDecimal("10"),
            null, 500L, 1L);

        // 20/10
        save(admin, "Ngày Phụ Nữ Việt Nam 20/10",
            "Giảm giá đặc biệt dành cho khách hàng nữ.",
            LocalDateTime.of(2026, 10, 20, 0, 0),
            LocalDateTime.of(2026, 10, 20, 23, 59),
            PromotionDiscountType.PERCENTAGE, new BigDecimal("20"),
            null, 300L, 1L);

        // 19/11
        save(admin, "Ngày Nhà Giáo Việt Nam 20/11",
            "Giảm giá đặc biệt dành cho khách hàng nam.",
            LocalDateTime.of(2026, 11, 19, 0, 0),
            LocalDateTime.of(2026, 11, 19, 23, 59),
            PromotionDiscountType.PERCENTAGE, new BigDecimal("15"),
            null, 300L, 1L);

        // 24-25/12
        save(admin, "Giáng Sinh 2026",
            "Combo Rửa xe ngoại thất cao cấp + Phủ Ceramic bảo vệ sơn.",
            LocalDateTime.of(2026, 12, 24, 0, 0),
            LocalDateTime.of(2026, 12, 25, 23, 59),
            PromotionDiscountType.PERCENTAGE, new BigDecimal("10"),
            null, 500L, 1L);

        // Sinh nhật
        save(admin, "Ưu Đãi Sinh Nhật",
            "Giảm giá trực tiếp và x2 điểm thưởng trong ngày sinh nhật của khách hàng.",
            LocalDateTime.of(2026, 1, 1, 0, 0),
            LocalDateTime.of(2026, 12, 31, 23, 59),
            PromotionDiscountType.PERCENTAGE, new BigDecimal("20"),
            null, 9999L, 1L);
    }

    private void save(Staff admin, String name, String description,
                      LocalDateTime startDate, LocalDateTime endDate,
                      PromotionDiscountType discountType, BigDecimal discountValue,
                      Object ignored, Long maxUsesTotal, Long maxUsesPerCustomer) {
        Promotion p = new Promotion();
        p.setPromotionName(name);
        p.setDescription(description);
        p.setStartDate(startDate);
        p.setEndDate(endDate);
        p.setDiscountType(discountType);
        p.setDiscountValue(discountValue);
        p.setMaxUsesTotal(maxUsesTotal);
        p.setMaxUsesPerCustomer(maxUsesPerCustomer);
        p.setUsageCount(0L);
        p.setActive(true);
        p.setStaff(admin);
        promotionRepository.save(p);
    }

}
