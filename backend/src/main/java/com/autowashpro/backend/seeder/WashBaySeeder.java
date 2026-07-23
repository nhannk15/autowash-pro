package com.autowashpro.backend.seeder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.WashBay;
import com.autowashpro.backend.model.enums.BayCategory;
import com.autowashpro.backend.model.enums.BayStatus;
import com.autowashpro.backend.repository.WashBayRepository;

@Component
@Order(9)
public class WashBaySeeder implements Seeder {
    
    private final WashBayRepository washBayRepository;

    @Autowired
    public WashBaySeeder(WashBayRepository washBayRepository) {
        this.washBayRepository = washBayRepository;
    }

    @Override
    public void seed() {
        if (washBayRepository.count() > 0) return;

        washBayRepository.save(build("Bay 1", BayStatus.ACTIVE, BayCategory.NORMAL));
        washBayRepository.save(build("Bay 2", BayStatus.ACTIVE, BayCategory.NORMAL));
        washBayRepository.save(build("Bay 3", BayStatus.ACTIVE, BayCategory.NORMAL));
        washBayRepository.save(build("Bay 4", BayStatus.MAINTENANCE, BayCategory.NORMAL));
        washBayRepository.save(build("Bay 5", BayStatus.ACTIVE, BayCategory.NORMAL));
        washBayRepository.save(build("Bay 6", BayStatus.ACTIVE, BayCategory.PREMIUM));
    }

    private WashBay build(String name, BayStatus status, BayCategory category) {
        WashBay bay = new WashBay();
        bay.setName(name);
        bay.setStatus(status);
        bay.setCategory(category);
        return bay;
    }

}
