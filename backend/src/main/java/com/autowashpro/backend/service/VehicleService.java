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
import com.autowashpro.backend.model.dto.UpdateVehicleRequest;
import com.autowashpro.backend.model.dto.VehicleResponse;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.Vehicle;
import com.autowashpro.backend.model.entity.VehicleType;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.VehicleRepository;
import com.autowashpro.backend.repository.VehicleTypeRepository;

@Service
public class VehicleService {

    private final VehicleRepository repository;

    private final CustomerRepository customerRepository;

    private final VehicleMapper vehicleMapper;

    private final VehicleTypeRepository vehicleTypeRepository;

    @Autowired
    public VehicleService(VehicleRepository repository, CustomerRepository customerRepository,
            VehicleMapper vehicleMapper, VehicleTypeRepository vehicleTypeRepository) {
        this.repository = repository;
        this.customerRepository = customerRepository;
        this.vehicleMapper = vehicleMapper;
        this.vehicleTypeRepository = vehicleTypeRepository;
    }

    public List<VehicleResponse> findAllVehicles() {
        return vehicleMapper.toVehicleResponseList(repository.findAll());
    }

    public List<VehicleResponse> findAllVehiclesForCustomer(String email) {
        Customer customer = customerRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("Người dùng không tồn tại."));
        return vehicleMapper.toVehicleResponseList(repository.findByCustomerId(customer.getId()));
    }

    public Vehicle createNew(Vehicle vehicle) {
        // Validate unique license plate
        if (vehicle.getLicensePlate() != null && repository.existsByLicensePlate(vehicle.getLicensePlate())) {
            throw new IllegalArgumentException("Biển số xe đã tồn tại!");
        }

        return repository.save(vehicle);
    }

    public VehicleResponse addNewVehicleForCustomer(String email, CreateVehicleRequest request) {
        // Validate unique license plate
        if (request.getLicensePlate() != null && repository.existsByLicensePlate(request.getLicensePlate())) {
            throw new IllegalArgumentException("Biển số xe đã tồn tại!");
        }

        Optional<Customer> optionalCustomer = customerRepository.findByEmail(email);
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

    public VehicleResponse updateMyCar(String email, Long vehicleId, UpdateVehicleRequest request) {

        Customer customer = customerRepository
                .findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Người dùng không tồn tại."));

        Vehicle vehicle = repository
                .findById(vehicleId)
                .orElseThrow(() -> new VehicleNotFoundException("Xe của người dùng không tồn tại."));

        if (!customer.getId().equals(vehicle.getCustomer().getId())) {
            throw new VehicleNotFoundException("Xe này không thuộc về bạn");
        }

        VehicleType vehicleType = vehicleTypeRepository
                .findById(request.getVehicleTypeId())
                .orElseThrow(() -> new VehicleTypeNotFoundException("Loại xe không tồn tại."));

        if(repository.existsByLicensePlate(request.getLicensePlate())) {
            throw new VehicleNotFoundException("Biển số không được trùng");
        }

        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setVehicleType(vehicleType);
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setColor(request.getColor());
        vehicle.setImage(request.getImage());

        Vehicle savedVehicle = repository.save(vehicle);
        return vehicleMapper.toVehicleResponse(savedVehicle);

    }

}
