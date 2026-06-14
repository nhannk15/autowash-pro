package com.autowashpro.backend.seeder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.Vehicle;
import com.autowashpro.backend.model.entity.VehicleType;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.VehicleRepository;
import com.autowashpro.backend.repository.VehicleTypeRepository;

@Component
@Order(10)
public class VehicleSeeder implements Seeder {

    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;
    private final VehicleTypeRepository vehicleTypeRepository;

    @Autowired
    public VehicleSeeder(VehicleRepository vehicleRepository, CustomerRepository customerRepository,
            VehicleTypeRepository vehicleTypeRepository) {
        this.vehicleRepository = vehicleRepository;
        this.customerRepository = customerRepository;
        this.vehicleTypeRepository = vehicleTypeRepository;
    }

    @Override
    public void seed() {
        if (vehicleRepository.count() > 0)
            return;

        Customer leThiThuy = customerRepository.findByEmail("lethuyavhs@gmail.com").orElseThrow();
        Customer nguyenKhacLeNhan = customerRepository.findByEmail("nhannk2101@gmail.com").orElseThrow();
        Customer tranPhuongTrinh = customerRepository.findByEmail("tranphuongtrinhussh@gmail.com")
                .orElseThrow();
        Customer dangNhatThienBao = customerRepository.findByEmail("baothi762@gmail.com").orElseThrow();
        Customer hoDuongNhatQuang = customerRepository.findByEmail("nhatquanghoduong@gmail.com").orElseThrow();
        Customer tranVuongQuan = customerRepository.findByEmail("tranvuongquan2707@gmail.com").orElseThrow();
        Customer phanNguyenAnhThu = customerRepository.findByEmail("anhthu.phannguyen010806@gmail.com")
                .orElseThrow();
        Customer phanNgocQuyet = customerRepository.findByEmail("phanngocquyet06@gmail.com").orElseThrow();

        VehicleType sedan = vehicleTypeRepository.findByTypeName("SEDAN").orElseThrow();
        VehicleType suv = vehicleTypeRepository.findByTypeName("SUV").orElseThrow();

        // Xe 1: Hyundai Creta (Sedan)
        Vehicle hyundaiCreta = new Vehicle();
        hyundaiCreta.setCustomer(leThiThuy);
        hyundaiCreta.setVehicleType(sedan);
        hyundaiCreta.setLicensePlate("74A-18536");
        hyundaiCreta.setBrand("Hyundai");
        hyundaiCreta.setModel("CRETA");
        hyundaiCreta.setColor("Đen");
        hyundaiCreta.setImage(
                "https://imgd.aeplcdn.com/664x374/n/cw/ec/106815/creta-exterior-right-front-three-quarter-6.png?isig=0&q=80");
        hyundaiCreta.setActive(true);
        vehicleRepository.save(hyundaiCreta);

        // Xe 2: Toyota Camry (Sedan)
        Vehicle toyotaCamry = new Vehicle();
        toyotaCamry.setCustomer(leThiThuy);
        toyotaCamry.setVehicleType(sedan);
        toyotaCamry.setLicensePlate("51F-12345");
        toyotaCamry.setBrand("Toyota");
        toyotaCamry.setModel("Camry");
        toyotaCamry.setColor("Trắng");
        toyotaCamry.setImage(
                "https://imgd.aeplcdn.com/664x374/n/cw/ec/130579/camry-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80");
        toyotaCamry.setActive(true);
        vehicleRepository.save(toyotaCamry);

        // Xe 3: Honda CR-V (SUV)
        Vehicle hondaCrv = new Vehicle();
        hondaCrv.setCustomer(nguyenKhacLeNhan);
        hondaCrv.setVehicleType(suv);
        hondaCrv.setLicensePlate("29K-67890");
        hondaCrv.setBrand("Honda");
        hondaCrv.setModel("CR-V");
        hondaCrv.setColor("Bạc");
        hondaCrv.setImage(
                "https://imgd.aeplcdn.com/664x374/n/cw/ec/124395/cr-v-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80");
        hondaCrv.setActive(true);
        vehicleRepository.save(hondaCrv);

        // Xe 4: Mazda 3 (Sedan)
        Vehicle mazda3 = new Vehicle();
        mazda3.setCustomer(nguyenKhacLeNhan);
        mazda3.setVehicleType(sedan);
        mazda3.setLicensePlate("61A-24680");
        mazda3.setBrand("Mazda");
        mazda3.setModel("3");
        mazda3.setColor("Đỏ");
        mazda3.setImage(
                "https://imgd.aeplcdn.com/664x374/n/cw/ec/129737/mazda3-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80");
        mazda3.setActive(true);
        vehicleRepository.save(mazda3);

        // Xe 5: Ford Everest (SUV)
        Vehicle fordEverest = new Vehicle();
        fordEverest.setCustomer(tranPhuongTrinh);
        fordEverest.setVehicleType(suv);
        fordEverest.setLicensePlate("43C-13579");
        fordEverest.setBrand("Ford");
        fordEverest.setModel("Everest");
        fordEverest.setColor("Xám");
        fordEverest.setImage(
                "https://imgd.aeplcdn.com/664x374/n/cw/ec/131717/everest-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80");
        fordEverest.setActive(true);
        vehicleRepository.save(fordEverest);

        // Xe 6: Kia Cerato (Sedan)
        Vehicle kiaCerato = new Vehicle();
        kiaCerato.setCustomer(dangNhatThienBao);
        kiaCerato.setVehicleType(sedan);
        kiaCerato.setLicensePlate("72B-98765");
        kiaCerato.setBrand("Kia");
        kiaCerato.setModel("Cerato");
        kiaCerato.setColor("Xanh dương");
        kiaCerato.setImage(
                "https://imgd.aeplcdn.com/664x374/n/cw/ec/124403/cerato-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80");
        kiaCerato.setActive(true);
        vehicleRepository.save(kiaCerato);

        // Xe 7: Mitsubishi Xpander (SUV)
        Vehicle mitsubishiXpander = new Vehicle();
        mitsubishiXpander.setCustomer(hoDuongNhatQuang);
        mitsubishiXpander.setVehicleType(suv);
        mitsubishiXpander.setLicensePlate("59C-45678");
        mitsubishiXpander.setBrand("Mitsubishi");
        mitsubishiXpander.setModel("Xpander");
        mitsubishiXpander.setColor("Hitam");
        mitsubishiXpander.setImage(
                "https://imgd.aeplcdn.com/664x374/n/cw/ec/107695/xpander-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80");
        mitsubishiXpander.setActive(true);
        vehicleRepository.save(mitsubishiXpander);

        // Xe 8: Nissan Altima (Sedan)
        Vehicle nissanAltima = new Vehicle();
        nissanAltima.setCustomer(tranVuongQuan);
        nissanAltima.setVehicleType(sedan);
        nissanAltima.setLicensePlate("30E-11223");
        nissanAltima.setBrand("Nissan");
        nissanAltima.setModel("Altima");
        nissanAltima.setColor("Vàng đồng");
        nissanAltima.setImage(
                "https://imgd.aeplcdn.com/664x374/n/cw/ec/129831/altima-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80");
        nissanAltima.setActive(true);
        vehicleRepository.save(nissanAltima);

        // Xe 9: Suzuki Ertiga (SUV)
        Vehicle suzukiErtiga = new Vehicle();
        suzukiErtiga.setCustomer(phanNguyenAnhThu);
        suzukiErtiga.setVehicleType(suv);
        suzukiErtiga.setLicensePlate("88D-99887");
        suzukiErtiga.setBrand("Suzuki");
        suzukiErtiga.setModel("Ertiga");
        suzukiErtiga.setColor("Cafe");
        suzukiErtiga.setImage(
                "https://imgd.aeplcdn.com/664x374/n/cw/ec/129837/ertiga-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80");
        suzukiErtiga.setActive(true);
        vehicleRepository.save(suzukiErtiga);

        // Xe 10: Tesla Model 3 (Sedan - Electric)
        Vehicle teslaModel3 = new Vehicle();
        teslaModel3.setCustomer(phanNgocQuyet);
        teslaModel3.setVehicleType(sedan);
        teslaModel3.setLicensePlate("99F-77777");
        teslaModel3.setBrand("Tesla");
        teslaModel3.setModel("Model 3");
        teslaModel3.setColor("Xanh dương");
        teslaModel3.setImage(
                "https://imgd.aeplcdn.com/664x374/n/cw/ec/129841/model-3-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80");
        teslaModel3.setActive(true);
        vehicleRepository.save(teslaModel3);
    }

}
