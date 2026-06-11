package com.autowashpro.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.exception.VehicleNotFoundException;
import com.autowashpro.backend.exception.VehicleTypeNotFoundException;
import com.autowashpro.backend.mapper.VehicleMapper;
import com.autowashpro.backend.model.dto.CreateVehicleRequest;
import com.autowashpro.backend.model.dto.VehicleResponse;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.Vehicle;
import com.autowashpro.backend.model.entity.VehicleType;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.VehicleRepository;
import com.autowashpro.backend.repository.VehicleTypeRepository;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository repository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private VehicleMapper vehicleMapper;

    @Autowired
    private VehicleTypeRepository vehicleTypeRepository;

    public List<VehicleResponse> findByCustomerId(Long id) {
        customerRepository.findById(id).orElseThrow(() -> new UserNotFoundException("Người dùng không tồn tại."));
        return vehicleMapper.toVehicleResponseList(repository.findByCustomerId(id));
    }

    public Vehicle createNew(Vehicle vehicle) {
        // Validate unique license plate
        if (vehicle.getLicensePlate() != null && repository.existsByLicensePlate(vehicle.getLicensePlate())) {
            throw new IllegalArgumentException("Biển số xe đã tồn tại!");
        }

        return repository.save(vehicle);
    }

    public VehicleResponse addNewVehicleForCustomer(CreateVehicleRequest request) {
        // Validate unique license plate
        if (request.getLicensePlate() != null && repository.existsByLicensePlate(request.getLicensePlate())) {
            throw new IllegalArgumentException("Biển số xe đã tồn tại!");
        }

        Optional<Customer> optionalCustomer = customerRepository.findById(request.getCustomerId());
        if (optionalCustomer.isEmpty()) {
            throw new UserNotFoundException("Khách hàng không tồn tại!");
        }
        Customer customer = optionalCustomer.get();

        Optional<VehicleType> optionalVehicleType = vehicleTypeRepository.findById(request.getVehicleTypeId());
        if (optionalVehicleType.isEmpty()) {
            throw new VehicleTypeNotFoundException("Khách hàng không tồn tại!");
        }
        VehicleType vehicleType = optionalVehicleType.get();

        Vehicle newVehicle = Vehicle
                .builder()
                .customer(customer)
                .vehicleType(vehicleType)
                .licensePlate(request.getLicensePlate())
                .brand(request.getBrand())
                .model(request.getModel())
                .color(request.getColor())
                .image(request.getImage())
                .build();
        Vehicle savedVehicle = repository.save(newVehicle);

        return vehicleMapper.toVehicleResponse(savedVehicle);
    }

    public void deleteMyCar(Long vehicleId, String customerEmail) {
        Vehicle vehicle = repository
                .findById(vehicleId)
                .orElseThrow(() -> new VehicleNotFoundException("Xe không tồn tại"));
        if (!vehicle.getCustomer().getEmail().equals(customerEmail)) {
            throw new VehicleNotFoundException("Bạn không thể xóa xe của người khác");
        }
        vehicle.setActive(false);
        repository.save(vehicle);
    }

}
