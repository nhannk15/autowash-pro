package com.autowashpro.backend.seeder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.WashBay;
import com.autowashpro.backend.model.enums.BayStatus;
import com.autowashpro.backend.repository.WashBayRepository;

@Component
public class WashBaySeeder {
    
    @Autowired
    private WashBayRepository washBayRepository;

    public void seed() {
        if (washBayRepository.count() > 0) return;

        washBayRepository.save(build("Bay 1", BayStatus.ACTIVE));
        washBayRepository.save(build("Bay 2", BayStatus.ACTIVE));
        washBayRepository.save(build("Bay 3", BayStatus.ACTIVE));
        washBayRepository.save(build("Bay 4", BayStatus.MAINTENANCE));
        washBayRepository.save(build("Bay 5", BayStatus.INACTIVE));
    }

    private WashBay build(String name, BayStatus status) {
        WashBay bay = new WashBay();
        bay.setName(name);
        bay.setStatus(status);
        return bay;
    }

}
