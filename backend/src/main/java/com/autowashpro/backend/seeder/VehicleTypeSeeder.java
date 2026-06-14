package com.autowashpro.backend.seeder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.VehicleType;
import com.autowashpro.backend.repository.VehicleTypeRepository;

@Component
@Order(1)
public class VehicleTypeSeeder implements Seeder {

    private final VehicleTypeRepository repository;

    @Autowired
    public VehicleTypeSeeder(VehicleTypeRepository repository) {
        this.repository = repository;
    }

    @Override
    public void seed() {
        if (repository.count() > 0)
            return;
        repository.save(build("SEDAN", "Xe Sedan 4-5 chỗ"));
        repository.save(build("SUV", "Xe SUV, MVP 7 chỗ"));

    }

    private VehicleType build(String name, String description) {
        VehicleType newType = new VehicleType();
        newType.setTypeName(name);
        newType.setDescription(description);
        return newType;
    }

}
