package com.autowashpro.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.exception.AccountExistedException;
import com.autowashpro.backend.model.dto.RegistrationRequest;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.MembershipTier;
import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.model.enums.Role;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.MembershipTierRepository;
import com.autowashpro.backend.repository.UserRepository;

@Service
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

        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());

        if (existingUser.isPresent()) {
            User user = existingUser.get();

            // If user already has a password → email/password account already exists
            if (user.getPassword() != null) {
                throw new AccountExistedException(
                        "Email " + request.getEmail() + " đã tồn tại");
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
        return repository.save(customer);
    }

    public Customer findById(Long id) {
        return repository.findById(id).get();
    }

    public List<Customer> findAll() {
        return repository.findAll();
    }

    public Customer update(Customer customer) {
        return repository.save(customer);
    }

    public void delete(Long id) {
        Customer customer = findById(id);
        repository.delete(customer);
    }

}
