package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autowashpro.backend.exception.AccountExistedException;
import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.mapper.StaffMapper;
import com.autowashpro.backend.model.dto.CreateStaffRequest;
import com.autowashpro.backend.model.dto.StaffAdminResponse;
import com.autowashpro.backend.model.dto.StaffInfoResponse;
import com.autowashpro.backend.model.dto.UpdateStaffRequest;
import com.autowashpro.backend.model.entity.Staff;
import com.autowashpro.backend.model.enums.Role;
import com.autowashpro.backend.repository.StaffRepository;
import com.autowashpro.backend.repository.UserRepository;

@Service
@Transactional
public class StaffService {

    private final StaffRepository repository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StaffMapper staffMapper;

    @Autowired
    public StaffService(StaffRepository repository,
                        UserRepository userRepository,
                        PasswordEncoder passwordEncoder, StaffMapper staffMapper) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.staffMapper = staffMapper;
    }

    // ==================== Original methods (for StaffController) ====================

    public Staff createNew(Staff staff) {
        return repository.save(staff);
    }

    public Staff findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Nhân viên không tồn tại!"));
    }

    public List<Staff> findAll() {
        return repository.findAll();
    }

    public Staff update(Staff staff) {
        return repository.save(staff);
    }

    public void delete(Long id) {
        Staff staff = findById(id);
        repository.delete(staff);
    }

    // ==================== Admin-specific methods ====================

    public Page<StaffAdminResponse> searchStaffsAdmin(String search, Pageable pageable) {
        return repository.searchStaffs(search, pageable)
                .map(this::toStaffAdminResponse);
    }

    public StaffAdminResponse toStaffAdminResponse(Staff staff) {
        return new StaffAdminResponse(
                staff.getId(),
                staff.getFullName(),
                staff.getEmail(),
                staff.getPhoneNumber(),
                staff.getRole(),
                staff.getHiredDate(),
                staff.isActive(),
                staff.getCreatedAt(),
                staff.getUpdatedAt());
    }

    public Staff createByAdmin(CreateStaffRequest request) {
        // Validate unique email
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new AccountExistedException("Email đã tồn tại!");
        }

        // Validate unique phone number
        if (request.getPhoneNumber() != null && repository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalArgumentException("Số điện thoại đã được sử dụng!");
        }

        Staff staff = new Staff();
        staff.setFullName(request.getFullName());
        staff.setEmail(request.getEmail());
        staff.setPassword(passwordEncoder.encode(request.getPassword()));
        staff.setPhoneNumber(request.getPhoneNumber());
        staff.setHiredDate(request.getHiredDate());
        staff.setRole(Role.STAFF);
        staff.setActive(true);

        staff = repository.save(staff);
        return staff;
    }

    public Staff updateByAdmin(Long id, UpdateStaffRequest request) {
        Staff staff = findById(id);

        // Validate unique email if changed
        if (request.getEmail() != null && !request.getEmail().equals(staff.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new AccountExistedException("Email đã tồn tại!");
            }
            staff.setEmail(request.getEmail());
        }

        // Validate unique phone number if changed
        if (request.getPhoneNumber() != null
                && !request.getPhoneNumber().equals(staff.getPhoneNumber())
                && repository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new IllegalArgumentException("Số điện thoại đã được sử dụng!");
        }

        // Update only non-null fields
        if (request.getFullName() != null) {
            staff.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null) {
            staff.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            staff.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getHiredDate() != null) {
            staff.setHiredDate(request.getHiredDate());
        }

        return repository.save(staff);
    }

    public void deactivate(Long id) {
        Staff staff = findById(id);
        staff.setActive(false);
        repository.save(staff);
    }

    public void activate(Long id) {
        Staff staff = findById(id);
        staff.setActive(true);
        repository.save(staff);
    }

    @Transactional(readOnly = true)
    public StaffInfoResponse getCurrentStaffInfo(String email) {
        Staff staff = repository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy staff với email: " + email));
        return staffMapper.toStaffInfoResponse(staff);
    }
}
