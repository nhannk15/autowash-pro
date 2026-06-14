package com.autowashpro.backend.seeder;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.MembershipTier;
import com.autowashpro.backend.repository.MembershipTierRepository;

@Component
@Order(5)
public class MembershipTierSeeder implements Seeder {

    private final MembershipTierRepository membershipTierRepository;

    @Autowired
    public MembershipTierSeeder(MembershipTierRepository membershipTierRepository) {
        this.membershipTierRepository = membershipTierRepository;
    }

    @Override
    public void seed() {
        if (membershipTierRepository.count() > 0)
            return;

        membershipTierRepository.save(build("Bronze", 1, 7, 4, "1.00", 0, "Thành viên mới, tích điểm cơ bản."));
        membershipTierRepository.save(build("Silver", 2, 14, 3, "1.25", 500, "Ưu tiên đặt lịch, tích điểm nhanh hơn."));
        membershipTierRepository.save(build("Gold", 3, 21, 2, "1.50", 2000, "Hàng đợi ưu tiên cao, nhiều ưu đãi hơn."));
        membershipTierRepository.save(build("Platinum", 4, 30, 1, "2.00", 5000, "Quyền lợi cao nhất, phục vụ VIP."));
    }

    private MembershipTier build(String name, int level, int bookingWindowDays,
            int priorityQueueOrder, String pointEarnRate,
            int minPoints, String perksDescription) {
        MembershipTier tier = new MembershipTier();
        tier.setTierName(name);
        tier.setTierLevel(level);
        tier.setBookingWindowDays(bookingWindowDays);
        tier.setPriorityQueueOrder(priorityQueueOrder);
        tier.setPointEarnRate(new BigDecimal(pointEarnRate));
        tier.setMinPointsToMaintain(minPoints);
        tier.setPerksDescription(perksDescription);
        return tier;
    }
}
