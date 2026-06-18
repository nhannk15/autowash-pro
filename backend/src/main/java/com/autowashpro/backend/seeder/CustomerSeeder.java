package com.autowashpro.backend.seeder;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.MembershipTier;
import com.autowashpro.backend.model.enums.Role;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.MembershipTierRepository;

@Component
@Order(8)
public class CustomerSeeder implements Seeder {

    private final CustomerRepository customerRepository;
    private final MembershipTierRepository membershipTierRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public CustomerSeeder(CustomerRepository customerRepository, MembershipTierRepository membershipTierRepository,
            PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.membershipTierRepository = membershipTierRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void seed() {
        if (customerRepository.count() > 0)
            return;

        MembershipTier bronze = membershipTierRepository.findByTierName("Bronze").orElseThrow();
        MembershipTier silver = membershipTierRepository.findByTierName("Silver").orElseThrow();
        MembershipTier gold = membershipTierRepository.findByTierName("Gold").orElseThrow();
        MembershipTier platinum = membershipTierRepository.findByTierName("Platinum").orElseThrow();

        Customer leThiThuy = new Customer();
        leThiThuy.setEmail("lethuyavhs@gmail.com");
        leThiThuy.setFullName("Lê Thị Thúy");
        leThiThuy.setPhoneNumber("0844884762");
        leThiThuy.setPassword(passwordEncoder.encode("12345678"));
        leThiThuy.setRole(Role.CUSTOMER);
        leThiThuy.setActive(true);
        leThiThuy.setDateOfBirth(LocalDate.of(1995, 8, 20));
        leThiThuy.setTier(bronze);
        leThiThuy.setCurrentPoints(1500L);
        leThiThuy.setLifetimePoints(1500L);
        leThiThuy.setTierStartDate(LocalDate.now());
        leThiThuy.setTierEndDate(LocalDate.now().plusYears(1));
        leThiThuy.setNextReviewDate(LocalDate.now().plusMonths(6));
        customerRepository.save(leThiThuy);

        Customer nguyenKhacLeNhan = new Customer();
        nguyenKhacLeNhan.setEmail("nhannk2101@gmail.com");
        nguyenKhacLeNhan.setFullName("Nguyễn Khắc Lê Nhân");
        nguyenKhacLeNhan.setPhoneNumber("0912176662");
        nguyenKhacLeNhan.setPassword(passwordEncoder.encode("12345678"));
        nguyenKhacLeNhan.setRole(Role.CUSTOMER);
        nguyenKhacLeNhan.setActive(true);
        nguyenKhacLeNhan.setDateOfBirth(LocalDate.of(2006, 1, 21));
        nguyenKhacLeNhan.setTier(bronze);
        nguyenKhacLeNhan.setCurrentPoints(400L);
        nguyenKhacLeNhan.setLifetimePoints(400L);
        nguyenKhacLeNhan.setTierStartDate(LocalDate.now());
        nguyenKhacLeNhan.setTierEndDate(LocalDate.now().plusYears(1));
        nguyenKhacLeNhan.setNextReviewDate(LocalDate.now().plusMonths(6));
        customerRepository.save(nguyenKhacLeNhan);

        Customer tranPhuongTrinh = new Customer();
        tranPhuongTrinh.setEmail("tranphuongtrinhussh@gmail.com");
        tranPhuongTrinh.setFullName("Trần Bùi Phương Trinh");
        tranPhuongTrinh.setPhoneNumber("0825671552");
        tranPhuongTrinh.setPassword(passwordEncoder.encode("12345678"));
        tranPhuongTrinh.setRole(Role.CUSTOMER);
        tranPhuongTrinh.setActive(true);
        tranPhuongTrinh.setDateOfBirth(LocalDate.of(2006, 11, 3));
        tranPhuongTrinh.setTier(silver);
        tranPhuongTrinh.setCurrentPoints(600L);
        tranPhuongTrinh.setLifetimePoints(600L);
        tranPhuongTrinh.setTierStartDate(LocalDate.now());
        tranPhuongTrinh.setTierEndDate(LocalDate.now().plusYears(1));
        tranPhuongTrinh.setNextReviewDate(LocalDate.now().plusMonths(6));
        customerRepository.save(tranPhuongTrinh);

        Customer dangNhatThienBao = new Customer();
        dangNhatThienBao.setEmail("baothi762@gmail.com");
        dangNhatThienBao.setFullName("Đặng Nhất Thiên Bảo");
        dangNhatThienBao.setPhoneNumber("0911038806");
        dangNhatThienBao.setPassword(passwordEncoder.encode("12345678"));
        dangNhatThienBao.setRole(Role.CUSTOMER);
        dangNhatThienBao.setActive(true);
        dangNhatThienBao.setDateOfBirth(LocalDate.of(2006, 10, 2));
        dangNhatThienBao.setTier(silver);
        dangNhatThienBao.setCurrentPoints(700L);
        dangNhatThienBao.setLifetimePoints(700L);
        dangNhatThienBao.setTierStartDate(LocalDate.now());
        dangNhatThienBao.setTierEndDate(LocalDate.now().plusYears(1));
        dangNhatThienBao.setNextReviewDate(LocalDate.now().plusMonths(6));
        customerRepository.save(dangNhatThienBao);

        Customer hoDuongNhatQuang = new Customer();
        hoDuongNhatQuang.setEmail("nhatquanghoduong@gmail.com");
        hoDuongNhatQuang.setFullName("Hồ Dương Nhật Quang");
        hoDuongNhatQuang.setPhoneNumber("0904937926");
        hoDuongNhatQuang.setPassword(passwordEncoder.encode("12345678"));
        hoDuongNhatQuang.setRole(Role.CUSTOMER);
        hoDuongNhatQuang.setActive(true);
        hoDuongNhatQuang.setDateOfBirth(LocalDate.of(2006, 10, 2));
        hoDuongNhatQuang.setTier(gold);
        hoDuongNhatQuang.setCurrentPoints(700L);
        hoDuongNhatQuang.setLifetimePoints(700L);
        hoDuongNhatQuang.setTierStartDate(LocalDate.now());
        hoDuongNhatQuang.setTierEndDate(LocalDate.now().plusYears(1));
        hoDuongNhatQuang.setNextReviewDate(LocalDate.now().plusMonths(6));
        customerRepository.save(hoDuongNhatQuang);

        Customer tranVuongQuan = new Customer();
        tranVuongQuan.setEmail("tranvuongquan2707@gmail.com");
        tranVuongQuan.setFullName("Trần Vương Quân");
        tranVuongQuan.setPhoneNumber("0963363246");
        tranVuongQuan.setPassword(passwordEncoder.encode("12345678"));
        tranVuongQuan.setRole(Role.CUSTOMER);
        tranVuongQuan.setActive(true);
        tranVuongQuan.setDateOfBirth(LocalDate.of(2006, 7, 27));
        tranVuongQuan.setTier(gold);
        tranVuongQuan.setCurrentPoints(700L);
        tranVuongQuan.setLifetimePoints(700L);
        tranVuongQuan.setTierStartDate(LocalDate.now());
        tranVuongQuan.setTierEndDate(LocalDate.now().plusYears(1));
        tranVuongQuan.setNextReviewDate(LocalDate.now().plusMonths(6));
        customerRepository.save(tranVuongQuan);

        Customer phanNguyenAnhThu = new Customer();
        phanNguyenAnhThu.setEmail("anhthu.phannguyen010806@gmail.com");
        phanNguyenAnhThu.setFullName("Phan Nguyễn Anh Thư");
        phanNguyenAnhThu.setPhoneNumber("0898159165");
        phanNguyenAnhThu.setPassword(passwordEncoder.encode("12345678"));
        phanNguyenAnhThu.setRole(Role.CUSTOMER);
        phanNguyenAnhThu.setActive(true);
        phanNguyenAnhThu.setDateOfBirth(LocalDate.of(2006, 8, 01));
        phanNguyenAnhThu.setTier(gold);
        phanNguyenAnhThu.setCurrentPoints(700L);
        phanNguyenAnhThu.setLifetimePoints(700L);
        phanNguyenAnhThu.setTierStartDate(LocalDate.now());
        phanNguyenAnhThu.setTierEndDate(LocalDate.now().plusYears(1));
        phanNguyenAnhThu.setNextReviewDate(LocalDate.now().plusMonths(6));
        customerRepository.save(phanNguyenAnhThu);

        Customer nguyenHuynhMinhNhat = new Customer();
        nguyenHuynhMinhNhat.setEmail("nghminhnhat2006@gmail.com");
        nguyenHuynhMinhNhat.setFullName("Nguyễn Huỳnh Minh Nhật");
        nguyenHuynhMinhNhat.setPhoneNumber("0898159165");
        nguyenHuynhMinhNhat.setPassword(passwordEncoder.encode("12345678"));
        nguyenHuynhMinhNhat.setRole(Role.CUSTOMER);
        nguyenHuynhMinhNhat.setActive(true);
        nguyenHuynhMinhNhat.setDateOfBirth(LocalDate.of(2006, 5, 24));
        nguyenHuynhMinhNhat.setTier(platinum);
        nguyenHuynhMinhNhat.setCurrentPoints(700L);
        nguyenHuynhMinhNhat.setLifetimePoints(700L);
        nguyenHuynhMinhNhat.setTierStartDate(LocalDate.now());
        nguyenHuynhMinhNhat.setTierEndDate(LocalDate.now().plusYears(1));
        nguyenHuynhMinhNhat.setNextReviewDate(LocalDate.now().plusMonths(6));
        customerRepository.save(nguyenHuynhMinhNhat);

        Customer phanNgocQuyet = new Customer();
        phanNgocQuyet.setEmail("phanngocquyet06@gmail.com");
        phanNgocQuyet.setFullName("Phan Ngọc Quyết");
        phanNgocQuyet.setPhoneNumber("0898159165");
        phanNgocQuyet.setPassword(passwordEncoder.encode("12345678"));
        phanNgocQuyet.setRole(Role.CUSTOMER);
        phanNgocQuyet.setActive(true);
        phanNgocQuyet.setDateOfBirth(LocalDate.of(2006, 5, 24));
        phanNgocQuyet.setTier(platinum);
        phanNgocQuyet.setCurrentPoints(0L);
        phanNgocQuyet.setLifetimePoints(0L);
        phanNgocQuyet.setTierStartDate(LocalDate.now());
        phanNgocQuyet.setTierEndDate(LocalDate.now().plusYears(1));
        phanNgocQuyet.setNextReviewDate(LocalDate.now().plusMonths(6));
        customerRepository.save(phanNgocQuyet);
    }
}
