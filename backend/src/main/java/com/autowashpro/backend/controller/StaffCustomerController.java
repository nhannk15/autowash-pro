package com.autowashpro.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.dto.QuickCreateRequest;
import com.autowashpro.backend.model.dto.QuickCreateResponse;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.Vehicle;
import com.autowashpro.backend.model.entity.VehicleType;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.VehicleTypeRepository;
import com.autowashpro.backend.service.CustomerService;
import com.autowashpro.backend.service.VehicleService;

@RestController
@RequestMapping("/api/staff/customers")
public class StaffCustomerController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private VehicleTypeRepository vehicleTypeRepository;

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Customer>> searchByPhone(@RequestParam String phone) {
        return ResponseEntity.ok(ApiResponse.success(customerService.findByPhoneNumber(phone)));
    }

    @PostMapping("/quick-create")
    public ResponseEntity<ApiResponse<QuickCreateResponse>> quickCreate(@RequestBody QuickCreateRequest request) {

        // Create customer
        Customer customer = new Customer();
        customer.setFullName(request.getFullName());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setEmail(request.getEmail());
        customer.setDateOfBirth(request.getDateOfBirth());
        customer = customerService.createNew(customer);

        // Create vehicle
        Vehicle vehicle = new Vehicle();
        vehicle.setCustomer(customer);
        if (request.getVehicleTypeId() != null) {
            VehicleType vehicleType = vehicleTypeRepository.findById(request.getVehicleTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("Loại xe không tồn tại!"));
            vehicle.setVehicleType(vehicleType);
        }
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setColor(request.getColor());
        vehicle = vehicleService.createNew(vehicle);

        QuickCreateResponse response = new QuickCreateResponse(
                customer.getId(),
                vehicle.getId(),
                customer.getFullName(),
                customer.getPhoneNumber(),
                vehicle.getLicensePlate());

        return ResponseEntity.ok(ApiResponse.created(response));
    }

}
