package com.autowashpro.backend.seeder;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.MembershipTier;
import com.autowashpro.backend.model.entity.TierRule;
import com.autowashpro.backend.repository.MembershipTierRepository;
import com.autowashpro.backend.repository.TierRuleRepository;

@Component
public class TierRuleSeeder {

    @Autowired
    private TierRuleRepository tierRuleRepository;

    @Autowired
    private MembershipTierRepository membershipTierRepository;

    public void seed() {
        if (tierRuleRepository.count() > 0)
            return;

        MembershipTier bronze = membershipTierRepository.findByTierName("Bronze").orElseThrow();
        MembershipTier silver = membershipTierRepository.findByTierName("Silver").orElseThrow();
        MembershipTier gold = membershipTierRepository.findByTierName("Gold").orElseThrow();
        MembershipTier platinum = membershipTierRepository.findByTierName("Platinum").orElseThrow();

        // Bronze: không hạ xuống vì là tier thấp nhất
        tierRuleRepository.save(build(bronze, 3, "500000", 12, null));

        // Silver: không đạt -> hạ xuống Bronze
        tierRuleRepository.save(build(silver, 5, "2000000", 6, bronze));

        // Gold: không đạt -> hạ xuống Silver
        tierRuleRepository.save(build(gold, 10, "5000000", 6, silver));

        // Platinum: không đạt -> hạ xuống Gold
        tierRuleRepository.save(build(platinum, 20, "15000000", 6, gold));
    }

    private TierRule build(MembershipTier tier, int minVisits,
            String minSpend, int reviewPeriodMonths,
            MembershipTier downgradeTier) {
        TierRule rule = new TierRule();
        rule.setTier(tier);
        rule.setMinVisitsRequired(minVisits);
        rule.setMinSpendRequired(new BigDecimal(minSpend));
        rule.setReviewPeriodMonths(reviewPeriodMonths);
        rule.setDowngradeTier(downgradeTier);
        return rule;
    }

}
