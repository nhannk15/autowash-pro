package com.autowashpro.backend.seeder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.Highlight;
import com.autowashpro.backend.model.entity.Service;
import com.autowashpro.backend.model.entity.Step;
import com.autowashpro.backend.repository.HightlightRepository;
import com.autowashpro.backend.repository.ServiceRepository;
import com.autowashpro.backend.repository.StepRepository;

@Component
@Order(4)
public class StepAndHighlightSeeder implements Seeder {

    private final ServiceRepository serviceRepository;
    private final StepRepository stepRepository;
    private final HightlightRepository hightlightRepository;

    @Autowired
    public StepAndHighlightSeeder(ServiceRepository serviceRepository, StepRepository stepRepository, HightlightRepository hightlightRepository) {
        this.serviceRepository = serviceRepository;
        this.stepRepository = stepRepository;
        this.hightlightRepository = hightlightRepository;
    }

    @Override
    public void seed() {
        if (stepRepository.count() > 0) return;

        Service service1 = serviceRepository.findById(1L).orElseThrow();
        Service service2 = serviceRepository.findById(2L).orElseThrow();
        Service service3 = serviceRepository.findById(3L).orElseThrow();
        Service service4 = serviceRepository.findById(4L).orElseThrow();
        Service service5 = serviceRepository.findById(5L).orElseThrow();
        Service service6 = serviceRepository.findById(6L).orElseThrow();
        Service service7 = serviceRepository.findById(7L).orElseThrow();

        // ===== SERVICE 1 =====
        stepRepository.save(new Step(null, 1L, "Nhận xe, kiểm tra tình trạng tổng quát và xịt gầm bằng vòi phun áp lực.", service1));
        stepRepository.save(new Step(null, 2L, "Phun bọt tuyết lần 1, dùng cọ mềm vệ sinh logo, lưới tản nhiệt, khe kẽ.", service1));
        stepRepository.save(new Step(null, 3L, "Xả nước, phun bọt tuyết lần 2 và sử dụng găng tay microfiber lau thân xe.", service1));
        stepRepository.save(new Step(null, 4L, "Lau khô bằng khăn chuyên dụng, xịt dưỡng bóng bề mặt sơn và dưỡng lốp.", service1));
        stepRepository.save(new Step(null, 5L, "Kiểm tra lại chất lượng toàn bộ xe và bàn giao cho khách hàng.", service1));
        hightlightRepository.save(new Highlight(null, "Rửa xe 3 bước tiêu chuẩn chuyên sâu loại bỏ bụi bẩn tối đa.", service1));
        hightlightRepository.save(new Highlight(null, "Sử dụng hóa chất rửa xe pH trung tính an toàn cho sơn và lớp phủ.", service1));
        hightlightRepository.save(new Highlight(null, "Dưỡng lốp và các viền nhựa ngoài xe bằng dung dịch cao cấp.", service1));
        hightlightRepository.save(new Highlight(null, "Hút bụi sàn xe và vệ sinh thảm lót chân cơ bản.", service1));

        // ===== SERVICE 2 =====
        stepRepository.save(new Step(null, 1L, "Thu dọn đồ đạc cá nhân, hút bụi sơ bộ trần, sàn, cốp xe.", service2));
        stepRepository.save(new Step(null, 2L, "Vệ sinh trần xe và hệ thống tấm che nắng bằng hóa chất chuyên dụng.", service2));
        stepRepository.save(new Step(null, 3L, "Lau sạch táp lô, táp li, các nút bấm điều khiển bằng cọ mềm.", service2));
        stepRepository.save(new Step(null, 4L, "Giặt sâu ghế ngồi (da/nỉ) bằng máy phun hút và hơi nước nóng 100°C.", service2));
        stepRepository.save(new Step(null, 5L, "Lau sạch sàn xe, cốp xe, sấy khô hoàn toàn cabin và xịt dưỡng bóng da, nhựa.", service2));
        hightlightRepository.save(new Highlight(null, "Hút bụi và dọn dẹp chi tiết từ trần xe đến sàn xe và cốp sau.", service2));
        hightlightRepository.save(new Highlight(null, "Giặt hơi nước nóng diệt khuẩn bề mặt ghế ngồi và thảm nỉ.", service2));
        hightlightRepository.save(new Highlight(null, "Tẩy ố, làm sạch táp lô, táp li và các gioăng cao su cửa.", service2));
        hightlightRepository.save(new Highlight(null, "Dưỡng mềm bề mặt da, nhựa bằng dung dịch cao cấp ngăn lão hóa.", service2));

        // ===== SERVICE 3 =====
        stepRepository.save(new Step(null, 1L, "Rửa xe chuyên sâu, tẩy bụi sắt và nhựa đường bám trên bề mặt sơn.", service3));
        stepRepository.save(new Step(null, 2L, "Đánh bóng 3 bước hiệu chỉnh sơn xe, khôi phục độ bóng nguyên bản.", service3));
        stepRepository.save(new Step(null, 3L, "Vệ sinh tẩy dầu mỡ bề mặt sơn bằng dung dịch chuyên dụng trước khi phủ.", service3));
        stepRepository.save(new Step(null, 4L, "Tiến hành phủ lớp Ceramic thứ nhất, sấy khô bằng đèn hồng ngoại.", service3));
        stepRepository.save(new Step(null, 5L, "Phủ lớp Ceramic thứ hai tăng cường độ dày và dưỡng bóng bề mặt hoàn thiện.", service3));
        hightlightRepository.save(new Highlight(null, "Đánh bóng hiệu chỉnh bề mặt sơn giúp xóa mờ các vết xước quầng, xước dăm.", service3));
        hightlightRepository.save(new Highlight(null, "Phủ 2 lớp Ceramic 9H độ cứng cao bảo vệ sơn bền vững trước môi trường.", service3));
        hightlightRepository.save(new Highlight(null, "Tạo chiều sâu cho màu sơn và giữ hiệu ứng lá sen chống bám nước vượt trội.", service3));
        hightlightRepository.save(new Highlight(null, "Chính sách bảo hành độ bóng và hỗ trợ bảo dưỡng định kỳ lên đến 2 năm.", service3));

        // ===== SERVICE 4 =====
        stepRepository.save(new Step(null, 1L, "Chờ khoang máy nguội, dùng băng dính chuyên dụng bọc các chi tiết điện nhạy cảm.", service4));
        stepRepository.save(new Step(null, 2L, "Dùng súng lốc xoáy xịt sạch bụi bẩn khô, lá cây bám trong khoang máy.", service4));
        stepRepository.save(new Step(null, 3L, "Phun dung dịch làm sạch khoang động cơ chuyên sâu, cọ rửa chi tiết bằng cọ mềm.", service4));
        stepRepository.save(new Step(null, 4L, "Rửa lại bằng nước áp lực thấp, xì khô hoàn toàn các khe kẽ và đầu giắc cắm.", service4));
        stepRepository.save(new Step(null, 5L, "Tháo bọc bảo vệ, xịt dung dịch dưỡng bóng nhựa/cao su và dung dịch chống chuột.", service4));
        hightlightRepository.save(new Highlight(null, "Làm sạch dầu mỡ cứng đầu bám lâu ngày an toàn cho các cảm biến.", service4));
        hightlightRepository.save(new Highlight(null, "Sử dụng hóa chất vệ sinh khoang máy chuyên dụng không gây ăn mòn kim loại.", service4));
        hightlightRepository.save(new Highlight(null, "Phục hồi và dưỡng bóng bảo vệ các đường ống cao su, giắc cắm nhựa.", service4));
        hightlightRepository.save(new Highlight(null, "Phun phủ dung dịch chống chuột cắn phá dây điện và làm tổ.", service4));

        // ===== SERVICE 5 =====
        stepRepository.save(new Step(null, 1L, "Kiểm tra lọc gió điều hòa, vệ sinh hoặc đề xuất thay thế nếu quá bẩn.", service5));
        stepRepository.save(new Step(null, 2L, "Đặt máy xông khói sinh học chuyên dụng vào khu vực để chân hành khách phía trước.", service5));
        stepRepository.save(new Step(null, 3L, "Bật hệ thống điều hòa xe ở chế độ gió trong (Recirculation) công suất tối đa.", service5));
        stepRepository.save(new Step(null, 4L, "Đóng kín cửa xe chạy máy xông khói trong 15 phút để tuần hoàn hệ thống gió.", service5));
        stepRepository.save(new Step(null, 5L, "Mở toàn bộ cửa xe thông gió trong 10 phút, kiểm tra chất lượng mùi hương và bàn giao.", service5));
        hightlightRepository.save(new Highlight(null, "Khử mùi ẩm mốc máy lạnh, mùi thuốc lá, mùi da mới hiệu quả triệt để.", service5));
        hightlightRepository.save(new Highlight(null, "Diệt 99.9% vi khuẩn, nấm mốc ẩn sâu trong đường ống điều hòa.", service5));
        hightlightRepository.save(new Highlight(null, "Dung dịch xông khói chiết xuất sinh học tự nhiên, an toàn với trẻ nhỏ.", service5));
        hightlightRepository.save(new Highlight(null, "Không để lại vết ố trên các chi tiết da, nỉ bên trong xe.", service5));

        // ===== SERVICE 6 =====
        stepRepository.save(new Step(null, 1L, "Tiếp nhận xe, cắm máy đọc lỗi OBD-II kiểm tra hệ thống điều khiển điện tử.", service6));
        stepRepository.save(new Step(null, 2L, "Kiểm tra mức và chất lượng dầu động cơ, dầu phanh, nước làm mát, nước rửa kính.", service6));
        stepRepository.save(new Step(null, 3L, "Tháo dỡ vệ sinh bugi đánh lửa, lọc gió động cơ, lọc gió điều hòa.", service6));
        stepRepository.save(new Step(null, 4L, "Nâng xe kiểm tra độ mòn má phanh, độ mòn lốp và đo điện áp bình ắc quy.", service6));
        stepRepository.save(new Step(null, 5L, "Lập biên bản ghi nhận kết quả bảo dưỡng, bàn giao phiếu check-list cho chủ xe.", service6));
        hightlightRepository.save(new Highlight(null, "Kiểm tra nhanh 12 hạng mục an toàn quan trọng của xe.", service6));
        hightlightRepository.save(new Highlight(null, "Hỗ trợ thay nhớt động cơ, lọc nhớt và bảo dưỡng nhanh hệ thống phanh.", service6));
        hightlightRepository.save(new Highlight(null, "Vệ sinh bugi đánh lửa, cổ hút ga và lọc gió động cơ chuyên nghiệp.", service6));
        hightlightRepository.save(new Highlight(null, "Đọc lỗi điện tử hộp đen xe bằng thiết bị chẩn đoán chuyên dụng OBD-II.", service6));

        // ===== SERVICE 7 =====
        stepRepository.save(new Step(null, 1L, "Tiếp nhận xe, đo đạc thông số kính nguyên bản và vệ sinh chuyên sâu bề mặt kính trong/ngoài.", service7));
        stepRepository.save(new Step(null, 2L, "Đo đạc, cắt phom phim cách nhiệt chính xác theo kích thước từng ô kính bằng máy cắt CNC.", service7));
        stepRepository.save(new Step(null, 3L, "Sử dụng máy khò nhiệt chuyên dụng để sấy tạo phom phim bo tròn theo độ cong của kính xe.", service7));
        stepRepository.save(new Step(null, 4L, "Tiến hành dán phim vào mặt trong kính bằng dung dịch bôi trơn chuyên dụng và gạt sạch bọt khí.", service7));
        stepRepository.save(new Step(null, 5L, "Sấy khô cố định các mép góc kính, kiểm tra lại độ trong suốt từ bên trong cabin và bàn giao.", service7));
        hightlightRepository.save(new Highlight(null, "Sử dụng dòng phim cách nhiệt đa lớp gốc gốm (Ceramic) hoặc phản xạ dòng điện cao cấp.", service7));
        hightlightRepository.save(new Highlight(null, "Cản tới 99% tia cực tím (UV) độc hại và hơn 90% tia hồng ngoại (IR) gây nóng.", service7));
        hightlightRepository.save(new Highlight(null, "Tăng sự riêng tư cho không gian cabin nhưng vẫn đảm bảo độ truyền sáng an toàn khi lái đêm.", service7));
        hightlightRepository.save(new Highlight(null, "Chính sách bảo hành bong tróc, bọt khí và thông số cách nhiệt chính hãng lên đến 10 năm.", service7));
    }
}