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

        Vehicle v1 = new Vehicle();
        v1.setCustomer(customer);
        v1.setVehicleType(sedan);
        v1.setLicensePlate("74A-18536");
        v1.setBrand("Huyndai");
        v1.setModel("CRETA");
        v1.setColor("Đen");
        v1.setImage("https://imgd.aeplcdn.com/664x374/n/cw/ec/106815/creta-exterior-right-front-three-quarter-6.png?isig=0&q=80");
        v1.setActive(true);
        vehicleRepository.save(v1);

        Vehicle v2 = new Vehicle();
        v2.setCustomer(customer);
        v2.setVehicleType(sedan);
        v2.setLicensePlate("74A-88888");
        v2.setBrand("Honda");
        v2.setModel("Civic");
        v2.setColor("Trắng");
        v2.setImage("https://cdn.jdpower.com/JDPA_2020-Honda-Civic-Sport-Touring-Hatchback-White-Front-Quarter.jpg");
        v2.setActive(true);

        vehicleRepository.save(v2);


        Customer khacnhan = customerRepository.findByEmail("nhannk2101@gmail.com").orElseThrow();
        VehicleType suv = vehicleTypeRepository.findByTypeName("SUV").orElseThrow();

        Vehicle v3 = new Vehicle();
        v3.setCustomer(khacnhan);
        v3.setVehicleType(suv);
        v3.setLicensePlate("74A-66666");
        v3.setBrand("Honda");
        v3.setModel("Civic");
        v3.setColor("Trắng");
        v3.setImage("https://cdn.jdpower.com/JDPA_2020-Honda-Civic-Sport-Touring-Hatchback-White-Front-Quarter.jpg");
        v3.setActive(true);

        vehicleRepository.save(v3);
    }

}
