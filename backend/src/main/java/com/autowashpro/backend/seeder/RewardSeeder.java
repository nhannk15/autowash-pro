package com.autowashpro.backend.seeder;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.Reward;
import com.autowashpro.backend.model.enums.RewardType;
import com.autowashpro.backend.repository.RewardRepository;

@Component
@Order(12)
public class RewardSeeder implements Seeder {
    
    private final RewardRepository rewardRepository;

    @Autowired
    RewardSeeder(RewardRepository rewardRepository) {
        this.rewardRepository = rewardRepository;
    }

    @Override
    public void seed() {
        if (rewardRepository.count() > 0) return;

        // Giảm tiền trực tiếp
        rewardRepository.save(build(
            "Giảm 50.000đ cho lần rửa tiếp theo",
            RewardType.DISCOUNT_FLAT,
            200L,
            new BigDecimal("50000"),
            30,
            "Đổi 200 điểm để nhận voucher giảm 50.000đ áp dụng cho lần sử dụng dịch vụ tiếp theo."
        ));

        // Giảm phần trăm
        rewardRepository.save(build(
            "Giảm 10% tổng hóa đơn",
            RewardType.DISCOUNT_PERCENTAGE,
            500L,
            new BigDecimal("10"),
            30,
            "Đổi 500 điểm để nhận voucher giảm 10% tổng giá trị hóa đơn."
        ));

        // Rửa xe miễn phí
        rewardRepository.save(build(
            "Rửa xe ngoại thất miễn phí",
            RewardType.FREE_WASH,
            1000L,
            new BigDecimal("0"),
            60,
            "Đổi 1000 điểm để nhận 1 lần rửa xe ngoại thất cao cấp miễn phí."
        ));
    }

    private Reward build(String name, RewardType type, Long pointCost,
                         BigDecimal discountValue, int validityDays, String description) {
        Reward r = new Reward();
        r.setRewardName(name);
        r.setRewardType(type);
        r.setPointCost(pointCost);
        r.setDiscountValue(discountValue);
        r.setValidityDays(validityDays);
        r.setDescription(description);
        r.setActive(true);
        return r;
    }

}
