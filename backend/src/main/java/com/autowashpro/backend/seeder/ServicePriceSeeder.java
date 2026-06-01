package com.autowashpro.backend.seeder;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.Service;
import com.autowashpro.backend.model.entity.ServicePrice;
import com.autowashpro.backend.model.entity.VehicleType;
import com.autowashpro.backend.repository.ServicePriceRepository;
import com.autowashpro.backend.repository.ServiceRepository;
import com.autowashpro.backend.repository.VehicleTypeRepository;

@Component
public class ServicePriceSeeder {

    @Autowired
    private ServicePriceRepository servicePriceRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private VehicleTypeRepository vehicleTypeRepository;

    public void seed() {
        if (servicePriceRepository.count() > 0)
            return;

        VehicleType sedan = vehicleTypeRepository.findByTypeName("SEDAN").orElseThrow();
        VehicleType suv = vehicleTypeRepository.findByTypeName("SUV").orElseThrow();

        // service name -> [sedan price, suv price]
        Map<String, String[]> priceMap = new LinkedHashMap<>();
        priceMap.put("Dán phim cách nhiệt chống nóng cao cấp", new String[] { "7500000", "9500000" });
        priceMap.put("Phủ Ceramic bảo vệ sơn", new String[] { "5000000", "7000000" });
        priceMap.put("Vệ sinh nội thất chuyên sâu", new String[] { "800000", "1000000" });
        priceMap.put("Vệ sinh khoang máy chuyên sâu", new String[] { "450000", "550000" });
        priceMap.put("Bảo dưỡng nhanh tổng quát", new String[] { "350000", "450000" });
        priceMap.put("Khử mùi và diệt khuẩn cabin", new String[] { "200000", "250000" });
        priceMap.put("Rửa xe ngoại thất cao cấp", new String[] { "150000", "200000" });

        for (Map.Entry<String, String[]> entry : priceMap.entrySet()) {
            Service service = serviceRepository.findByServiceName(entry.getKey()).orElseThrow();
            String[] prices = entry.getValue();

            servicePriceRepository.save(build(service, sedan, prices[0]));
            servicePriceRepository.save(build(service, suv, prices[1]));
        }
    }

    private ServicePrice build(Service service, VehicleType vehicleType, String price) {
        ServicePrice sp = new ServicePrice();
        sp.setService(service);
        sp.setVehicleType(vehicleType);
        sp.setPrice(new BigDecimal(price));
        sp.setActive(true);
        return sp;
    }
}
