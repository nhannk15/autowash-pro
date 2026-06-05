package com.autowashpro.backend.seeder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.Highlight;
import com.autowashpro.backend.model.entity.Service;
import com.autowashpro.backend.model.entity.Step;
import com.autowashpro.backend.repository.HightlightRepository;
import com.autowashpro.backend.repository.ServiceRepository;
import com.autowashpro.backend.repository.StepRepository;

@Component
public class StepAndHighlightSeeder {
    
    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private StepRepository stepRepository;

    @Autowired
    private HightlightRepository hightlightRepository;

    public void seed() {
        Service serivce1 = serviceRepository.findById(1L).get();
        Service serivce2 = serviceRepository.findById(2L).get();

        /**
         * Steps & Highlights for Service 1.
         */
        Step step1Service1 = new Step(null, 1L, "Nhận xe, kiểm tra tình trạng tổng quát và xịt gầm bằng vòi phun áp lực.", serivce1);
        Step step2Service1 = new Step(null, 2L, "Phun bọt tuyết lần 1, dùng cọ mềm vệ sinh logo, lưới tản nhiệt, khe kẽ.", serivce1);
        Step step3Service1 = new Step(null, 3L, "Xả nước, phun bọt tuyết lần 2 và sử dụng găng tay microfiber lau thân xe.", serivce1);
        Step step4Service1 = new Step(null, 4L, "Lau khô bằng khăn chuyên dụng, xịt dưỡng bóng bề mặt sơn và dưỡng lốp", serivce1);
        Step step5Service1 = new Step(null, 5L, "Kiểm tra lại chất lượng toàn bộ xe và bàn giao cho khách hàng.", serivce1);
        Highlight hightlight1Service1 = new Highlight(null, "Rửa xe 3 bước tiêu chuẩn chuyên sâu loại bỏ bụi bẩn tối đa.", serivce1);
        Highlight hightlight2Service1 = new Highlight(null, "Sử dụng hóa chất rửa xe pH trung tính an toàn cho sơn và lớp phủ.", serivce1);
        Highlight hightlight3Service1 = new Highlight(null, "Dưỡng lốp và các viền nhựa ngoài xe bằng dung dịch cao cấp.", serivce1);
        Highlight hightlight4Service1 = new Highlight(null, "Hút bụi sàn xe và vệ sinh thảm lót chân cơ bản.", serivce1);

        /**
         * Steps & Highlights for Service 2.
         */
        Step step1Service2 = new Step(null, 1L, "Thu dọn đồ đạc cá nhân, hút bụi sơ bộ trần, sàn, cốp xe", serivce2);
        Step step2Service2 = new Step(null, 2L, "Vệ sinh trần xe và hệ thống tấm che nắng bằng hóa chất chuyên dụng.", serivce2);
        Step step3Service2 = new Step(null, 3L, "Lau sạch táp lô, táp li, các nút bấm điều khiển bằng cọ mềm.", serivce2);
        Step step4Service2 = new Step(null, 4L, "Giặt sâu ghế ngồi (da/nỉ) bằng máy phun hút và hơi nước nóng 100°C.", serivce2);
        Step step5Service2 = new Step(null, 5L, "Lau sạch sàn xe, cốp xe, sấy khô hoàn toàn cabin và xịt dưỡng bóng da, nhựa.", serivce2);
        Highlight hightlight1Service2 = new Highlight(null, "Hút bụi và dọn dẹp chi tiết từ trần xe đến sàn xe và cốp sau.", serivce2);
        Highlight hightlight2Service2 = new Highlight(null, "Giặt hơi nước nóng diệt khuẩn bề mặt ghế ngồi và thảm nỉ.", serivce2);
        Highlight hightlight3Service2 = new Highlight(null, "Tẩy ố, làm sạch táp lô, táp li và các gioăng cao su cửa.", serivce2);
        Highlight hightlight4Service2 = new Highlight(null, "Dưỡng mềm bề mặt da, nhựa bằng dung dịch cao cấp ngăn lão hóa.", serivce2);

        /**
         * Persist all down to the database.
         */
        stepRepository.save(step1Service1);
        stepRepository.save(step2Service1);
        stepRepository.save(step3Service1);
        stepRepository.save(step4Service1);
        stepRepository.save(step5Service1);
        stepRepository.save(step1Service2);
        stepRepository.save(step2Service2);
        stepRepository.save(step3Service2);
        stepRepository.save(step4Service2);
        stepRepository.save(step5Service2);

        hightlightRepository.save(hightlight1Service1);
        hightlightRepository.save(hightlight2Service1);
        hightlightRepository.save(hightlight3Service1);
        hightlightRepository.save(hightlight4Service1);
        hightlightRepository.save(hightlight1Service2);
        hightlightRepository.save(hightlight2Service2);
        hightlightRepository.save(hightlight3Service2);
        hightlightRepository.save(hightlight4Service2);

    }
    
}
