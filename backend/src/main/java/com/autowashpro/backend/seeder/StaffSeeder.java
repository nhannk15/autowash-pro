package com.autowashpro.backend.seeder;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.Staff;
import com.autowashpro.backend.model.enums.Role;
import com.autowashpro.backend.repository.StaffRepository;

@Component
public class StaffSeeder {

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public void seed() {
        if (staffRepository.count() > 0)
            return;

        staffRepository.save(
                build("nhannk15@gmail.com", "Admin Nhân Khắc", "0363636363", LocalDate.of(2022, 1, 10), Role.ADMIN));
        staffRepository.save(
                build("khacbuu@gmail.com", "Staff Khắc Bửu", "0942575234", LocalDate.of(2022, 6, 1), Role.STAFF));
    }

    private Staff build(String email, String fullName, String phoneNumber,
            LocalDate hiredDate, Role role) {
        Staff s = new Staff();
        s.setEmail(email);
        s.setFullName(fullName != null ? fullName : "");
        s.setPhoneNumber(phoneNumber);
        s.setPassword(passwordEncoder.encode("123456"));
        s.setRole(role);
        s.setHiredDate(hiredDate);
        s.setActive(true);
        return s;
    }
}
