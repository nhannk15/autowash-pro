package com.autowashpro.backend.seeder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.Vehicle;
import com.autowashpro.backend.model.entity.VehicleType;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.VehicleRepository;
import com.autowashpro.backend.repository.VehicleTypeRepository;

@Component
public class VehicleSeeder {

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private VehicleTypeRepository vehicleTypeRepository;

    public void seed() {
        if (vehicleRepository.count() > 0)
            return;

        Customer customer = customerRepository.findByEmail("lethuyavhs@gmail.com").orElseThrow();
        VehicleType sedan = vehicleTypeRepository.findByTypeName("SEDAN").orElseThrow();

        Vehicle v = new Vehicle();
        v.setCustomer(customer);
        v.setVehicleType(sedan);
        v.setLicensePlate("74A-18536");
        v.setBrand("Huyndai");
        v.setModel("CRETA");
        v.setColor("Đen");
        v.setActive(true);

        vehicleRepository.save(v);
    }

}
