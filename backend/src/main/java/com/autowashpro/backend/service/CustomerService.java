package com.autowashpro.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autowashpro.backend.exception.AccountExistedException;
import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.model.dto.CustomerAdminResponse;
import com.autowashpro.backend.model.dto.MembershipTierSummaryResponse;
import com.autowashpro.backend.model.dto.RegistrationRequest;
import com.autowashpro.backend.model.dto.VehicleAdminResponse;
import com.autowashpro.backend.model.dto.VehicleTypeItemResponse;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.MembershipTier;
import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.model.entity.Vehicle;
import com.autowashpro.backend.model.entity.VehicleType;
import com.autowashpro.backend.model.enums.Role;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.MembershipTierRepository;
import com.autowashpro.backend.repository.UserRepository;

@Service
@Transactional
public class CustomerService {

    private CustomerRepository repository;
    private UserRepository userRepository;
    private MembershipTierRepository membershipTierRepository;
    private PasswordEncoder passwordEncoder;

    public CustomerService() {
    }

    @Autowired
    public CustomerService(CustomerRepository repository,
            UserRepository userRepository,
            MembershipTierRepository membershipTierRepository,
            PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.membershipTierRepository = membershipTierRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Customer register(RegistrationRequest request) {
        // Validate password match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu không khớp!");
        }

        // Validate date of birth is not in the future and age >= 18
        if (request.getDateOfBirth() != null) {
            if (request.getDateOfBirth().isAfter(LocalDate.now())) {
                throw new IllegalArgumentException("Ngày sinh không hợp lệ!");
            }
            if (request.getDateOfBirth().plusYears(18).isAfter(LocalDate.now())) {
                throw new IllegalArgumentException("Bạn phải đủ 18 tuổi để đăng ký!");
            }
        }

        // Check if phone number already exists
        if (request.getPhoneNumber() != null && repository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalArgumentException("Số điện thoại đã được sử dụng!");
        }

        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());

        if (existingUser.isPresent()) {
            User user = existingUser.get();

            // If user already has a password → email/password account already exists
            if (user.getPassword() != null) {
                throw new AccountExistedException(
                        "Email đã tồn tại");
            }

            // If user exists via OAuth2 only (has googleId but no password) → link credentials
            if (user.getGoogleId() != null && user.getPassword() == null) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
                user.setFullName(request.getFullName());
                user.setPhoneNumber(request.getPhoneNumber());

                // Update customer-specific fields if the user is a Customer
                if (user instanceof Customer customer) {
                    customer.setDateOfBirth(request.getDateOfBirth());
                    return repository.save(customer);
                }

                userRepository.save(user);
                return repository.findByEmail(request.getEmail()).orElseThrow();
            }
        }

        // No existing user → create a new Customer account
        MembershipTier bronzeTier = membershipTierRepository.findByTierName("Bronze")
                .orElseThrow(() -> new RuntimeException("Default membership tier 'Bronze' not found"));

        Customer customer = new Customer();
        customer.setEmail(request.getEmail());
        customer.setPassword(passwordEncoder.encode(request.getPassword()));
        customer.setFullName(request.getFullName());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setRole(Role.CUSTOMER);
        customer.setActive(true);

        // Initialize membership tier defaults
        customer.setTier(bronzeTier);
        customer.setCurrentPoints(0L);
        customer.setLifetimePoints(0L);
        customer.setTierStartDate(LocalDate.now());
        customer.setTierEndDate(LocalDate.now().plusYears(1));
        customer.setNextReviewDate(LocalDate.now().plusMonths(6));

        return repository.save(customer);
    }

    public Customer createNew(Customer customer) {
        // Validate unique phone number
        if (customer.getPhoneNumber() != null && repository.existsByPhoneNumber(customer.getPhoneNumber())) {
            throw new IllegalArgumentException("Số điện thoại đã được sử dụng!");
        }
        return repository.save(customer);
    }

    public Customer findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Khách hàng không tồn tại!"));
    }

    public List<Customer> findAll() {
        return repository.findAll();
    }

    public Page<Customer> searchCustomers(String search, Long tierId, Pageable pageable) {
        return repository.searchCustomers(search, tierId, pageable);
    }

    public Page<CustomerAdminResponse> searchCustomersAdmin(String search, Long tierId, Pageable pageable) {
        return repository.searchCustomers(search, tierId, pageable)
                .map(this::toCustomerAdminResponse);
    }

    private CustomerAdminResponse toCustomerAdminResponse(Customer customer) {
        return new CustomerAdminResponse(
                customer.getId(),
                customer.getEmail(),
                customer.getGoogleId(),
                customer.getFullName(),
                customer.getPhoneNumber(),
                customer.getAvatarUrl(),
                customer.getRole(),
                customer.isActive(),
                customer.getCreatedAt(),
                customer.getUpdatedAt(),
                customer.getDateOfBirth(),
                toMembershipTierSummaryResponse(customer.getTier()),
                customer.getCurrentPoints(),
                customer.getLifetimePoints(),
                customer.getTierStartDate(),
                customer.getTierEndDate(),
                customer.getLastReviewDate(),
                customer.getNextReviewDate(),
                customer.getVehicles() == null
                        ? List.of()
                        : customer.getVehicles().stream()
                                .map(this::toVehicleAdminResponse)
                                .toList());
    }

    private MembershipTierSummaryResponse toMembershipTierSummaryResponse(MembershipTier tier) {
        if (tier == null) {
            return null;
        }

        return new MembershipTierSummaryResponse(
                tier.getId(),
                tier.getTierName(),
                tier.getTierLevel(),
                tier.getBookingWindowDays(),
                tier.getPriorityQueueOrder(),
                tier.getPointEarnRate(),
                tier.getMinPointsToMaintain(),
                tier.getPerksDescription());
    }

    private VehicleAdminResponse toVehicleAdminResponse(Vehicle vehicle) {
        return new VehicleAdminResponse(
                vehicle.getId(),
                toVehicleTypeItemResponse(vehicle.getVehicleType()),
                vehicle.getLicensePlate(),
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getColor(),
                vehicle.getImage(),
                vehicle.isActive(),
                vehicle.getCreatedAt(),
                vehicle.getUpdatedAt());
    }

    private VehicleTypeItemResponse toVehicleTypeItemResponse(VehicleType vehicleType) {
        if (vehicleType == null) {
            return null;
        }

        return new VehicleTypeItemResponse(
                vehicleType.getId(),
                vehicleType.getTypeName(),
                vehicleType.getDescription(),
                vehicleType.isActive());
    }

    public Customer findByPhoneNumber(String phoneNumber) {
        return repository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy khách hàng với số điện thoại này!"));
    }

    public Customer update(Customer customer) {
        Customer existing = findById(customer.getId());

        // Check phone unique if changed
        if (customer.getPhoneNumber() != null
                && !customer.getPhoneNumber().equals(existing.getPhoneNumber())
                && repository.existsByPhoneNumber(customer.getPhoneNumber())) {
            throw new IllegalArgumentException("Số điện thoại đã được sử dụng!");
        }

        return repository.save(customer);
    }

    public void delete(Long id) {
        Customer customer = findById(id);
        repository.delete(customer);
    }

}
