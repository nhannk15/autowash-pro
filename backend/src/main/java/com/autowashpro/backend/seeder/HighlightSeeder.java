package com.autowashpro.backend.seeder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.repository.ServiceRepository;

@Component
public class HighlightSeeder implements Seeder {

    private final ServiceRepository serviceRepository;

    @Autowired
    public HighlightSeeder(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @Override
    public void seed() {
    }

}
