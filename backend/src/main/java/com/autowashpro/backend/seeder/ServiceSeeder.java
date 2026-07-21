package com.autowashpro.backend.seeder;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.Service;
import com.autowashpro.backend.model.enums.ServiceCategory;
import com.autowashpro.backend.repository.ServiceRepository;

@Component
@Order(2)
public class ServiceSeeder implements Seeder {

    private final ServiceRepository serviceRepository;

    @Autowired
    public ServiceSeeder(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    @Override
    public void seed() {
        if (serviceRepository.count() > 0)
            return;

        serviceRepository.save(build(
                "Rửa xe ngoại thất cao cấp",
                "Sạch sâu từng khe kẽ, bảo vệ và dưỡng bóng bề mặt sơn xe bằng công nghệ rửa xe 3 bước tiên tiến.",
                45, "1.00", ServiceCategory.BASIC,
                "https://vietnamcarcare.com/wp-content/uploads/2022/06/rua-xe-o-to-chuyen-nghiep-chuan-detailing-cao-cap-1.jpg"));
        serviceRepository.save(build(
                "Vệ sinh nội thất chuyên sâu",
                "Khử sạch mùi ẩm mốc, hút bụi cabin và giặt ướt/hơi nước nóng ghế da, nỉ, phục hồi chi tiết nhựa toàn diện.",
                240, "1.50", ServiceCategory.BASIC,
                "https://vietnamcarcare.com/wp-content/uploads/2022/06/rua-xe-o-to-chuyen-nghiep-chuan-detailing-cao-cap-1.jpg"));
        serviceRepository.save(build(
                "Phủ Ceramic bảo vệ sơn",
                "Tạo lớp màng thủy tinh bảo vệ sơn xe chống tia UV, mưa axit, giảm xước dăm và tạo hiệu ứng lá sen bóng bẩy vượt trội.",
                2160, "2.00", ServiceCategory.PREMIUM,
                "https://vietnamcarcare.com/wp-content/uploads/2022/06/rua-xe-o-to-chuyen-nghiep-chuan-detailing-cao-cap-1.jpg"));
        serviceRepository.save(build(
                "Vệ sinh khoang máy chuyên sâu",
                "Làm sạch bụi bẩn, dầu mỡ lâu ngày tích tụ trong khoang động cơ, bảo dưỡng chi tiết cao su/nhựa và chống chuột hiệu quả.",
                120, "1.50", ServiceCategory.BASIC,
                "https://vietnamcarcare.com/wp-content/uploads/2022/06/rua-xe-o-to-chuyen-nghiep-chuan-detailing-cao-cap-1.jpg"));
        serviceRepository.save(build(
                "Khử mùi và diệt khuẩn cabin",
                "Loại bỏ hoàn toàn mùi ẩm mốc, mùi thức ăn, thú cưng bằng công nghệ xông khói diệt khuẩn thông minh sinh học.",
                45, "1.00", ServiceCategory.ADDON,
                "https://vietnamcarcare.com/wp-content/uploads/2022/06/rua-xe-o-to-chuyen-nghiep-chuan-detailing-cao-cap-1.jpg"));
        serviceRepository.save(build(
                "Bảo dưỡng nhanh tổng quát",
                "Kiểm tra và bảo dưỡng các bộ phận thiết yếu như Bugi, lọc gió, phanh, nước làm mát để xe luôn vận hành tin cậy.",
                90, "1.00", ServiceCategory.BASIC,
                "https://vietnamcarcare.com/wp-content/uploads/2022/06/rua-xe-o-to-chuyen-nghiep-chuan-detailing-cao-cap-1.jpg"));
        serviceRepository.save(build(
                "Dán phim cách nhiệt chống nóng cao cấp",
                "Bảo vệ sức khỏe và nội thất xe bằng dòng phim cách nhiệt quang học cao cấp, cản 99% tia UV và giảm nhiệt lượng cabin vượt trội.",
                1440, "2.00", ServiceCategory.PREMIUM,
                "https://vietnamcarcare.com/wp-content/uploads/2022/06/rua-xe-o-to-chuyen-nghiep-chuan-detailing-cao-cap-1.jpg"));
    }

    public Service build(String serviceName, String description, int durationMinutes, String multiplier,
            ServiceCategory category, String image) {
        Service newService = new Service();
        newService.setServiceName(serviceName);
        newService.setDescription(description);
        newService.setDurationMinutes(durationMinutes);
        newService.setPointMultiplier(new BigDecimal(multiplier));
        newService.setCategory(category);
        newService.setImage(image);
        return newService;
    }

}
