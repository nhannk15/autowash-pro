import { useState, useEffect } from 'react'
import './Service.css'
import exteriorImg from '../../assets/Service/RuaXeNgoaiThat.jpg';
import interiorImg from '../../assets/Service/VeSinhNoiThat.jpg';
import ceramicImg from '../../assets/Service/PhuCeramic.png';
import engineImg from '../../assets/Service/VeSinhKhoangMay.png';
import odorImg from '../../assets/Service/KhuMui.png';
import tintingImg from '../../assets/Service/DanPhimCachNhiet.png';
import baoDuong from '../../assets/Service/baoDuong.jpg';
import cachNhiet from '../../assets/Service/cachNhiet.jpg';

const serviceStaticDetails = {
    'Rửa xe ngoại thất cao cấp': {
        image: exteriorImg,
        highlights: [
            'Rửa xe 3 bước tiêu chuẩn chuyên sâu loại bỏ bụi bẩn tối đa.',
            'Sử dụng hóa chất rửa xe pH trung tính an toàn cho sơn và lớp phủ.',
            'Dưỡng lốp và các viền nhựa ngoài xe bằng dung dịch cao cấp.',
            'Hút bụi sàn xe và vệ sinh thảm lót chân cơ bản.'
        ],
        steps: [
            'Nhận xe, kiểm tra tình trạng tổng quát và xịt gầm bằng vòi phun áp lực.',
            'Phun bọt tuyết lần 1, dùng cọ mềm vệ sinh logo, lưới tản nhiệt, khe kẽ.',
            'Xả nước, phun bọt tuyết lần 2 và sử dụng găng tay microfiber lau thân xe.',
            'Lau khô bằng khăn chuyên dụng, xịt dưỡng bóng bề mặt sơn và dưỡng lốp.',
            'Kiểm tra lại chất lượng toàn bộ xe và bàn giao cho khách hàng.'
        ]
    },
    'Vệ sinh nội thất chuyên sâu': {
        image: interiorImg,
        highlights: [
            'Hút bụi và dọn dẹp chi tiết từ trần xe đến sàn xe và cốp sau.',
            'Giặt hơi nước nóng diệt khuẩn bề mặt ghế ngồi và thảm nỉ.',
            'Tẩy ố, làm sạch táp lô, táp li và các gioăng cao su cửa.',
            'Dưỡng mềm bề mặt da, nhựa bằng dung dịch cao cấp ngăn lão hóa.'
        ],
        steps: [
            'Thu dọn đồ đạc cá nhân, hút bụi sơ bộ trần, sàn, cốp xe.',
            'Vệ sinh trần xe và hệ thống tấm che nắng bằng hóa chất chuyên dụng.',
            'Lau sạch táp lô, táp li, các nút bấm điều khiển bằng cọ mềm.',
            'Giặt sâu ghế ngồi (da/nỉ) bằng máy phun hút và hơi nước nóng 100°C.',
            'Lau sạch sàn xe, cốp xe, sấy khô hoàn toàn cabin và xịt dưỡng bóng da, nhựa.'
        ]
    },
    'Phủ Ceramic bảo vệ sơn': {
        image: ceramicImg,
        highlights: [
            'Đánh bóng hiệu chỉnh bề mặt sơn giúp xóa mờ các vết xước quầng, xước dăm.',
            'Phủ 2 lớp Ceramic 9H độ cứng cao bảo vệ sơn bền vững trước môi trường.',
            'Tạo chiều sâu cho màu sơn và giữ hiệu ứng lá sen chống bám nước vượt trội.',
            'Chính sách bảo hành độ bóng và hỗ trợ bảo dưỡng định kỳ lên đến 2 năm.'
        ],
        steps: [
            'Rửa xe chuyên sâu, tẩy bụi sắt và nhựa đường bám trên bề mặt sơn.',
            'Đánh bóng 3 bước hiệu chỉnh sơn xe, khôi phục độ bóng nguyên bản.',
            'Vệ sinh tẩy dầu mỡ bề mặt sơn bằng dung dịch chuyên dụng trước khi phủ.',
            'Tiến hành phủ lớp Ceramic thứ nhất, sấy khô bằng đèn hồng ngoại.',
            'Phủ lớp Ceramic thứ hai tăng cường độ dày và dưỡng bóng bề mặt hoàn thiện.'
        ]
    },
    'Vệ sinh khoang máy chuyên sâu': {
        image: engineImg,
        highlights: [
            'Làm sạch dầu mỡ cứng đầu bám lâu ngày an toàn cho các cảm biến.',
            'Sử dụng hóa chất vệ sinh khoang máy chuyên dụng không gây ăn mòn kim loại.',
            'Phục hồi và dưỡng bóng bảo vệ các đường ống cao su, giắc cắm nhựa.',
            'Phun phủ dung dịch chống chuột cắn phá dây điện và làm tổ.'
        ],
        steps: [
            'Chờ khoang máy nguội, dùng băng dính chuyên dụng bọc các chi tiết điện nhạy cảm.',
            'Dùng súng lốc xoáy xịt sạch bụi bẩn khoang khô, lá cây bám trong khoang máy.',
            'Phun dung dịch làm sạch khoang động cơ chuyên sâu, cọ rửa chi tiết bằng cọ mềm.',
            'Rửa lại bằng nước áp lực thấp, xì khô hoàn toàn các khe kẽ và đầu giắc cắm.',
            'Tháo bọc bảo vệ, xịt dung dịch dưỡng bóng nhựa/cao su và dung dịch chống chuột.'
        ]
    },
    'Khử mùi và diệt khuẩn cabin': {
        image: odorImg,
        highlights: [
            'Khử mùi ẩm mốc máy lạnh, mùi thuốc lá, mùi da mới hiệu quả triệt để.',
            'Diệt 99.9% vi khuẩn, nấm mốc ẩn sâu trong đường ống điều hòa.',
            'Dung dịch xông khói chiết xuất sinh học tự nhiên, an toàn với trẻ nhỏ.',
            'Không để lại vết ố trên các chi tiết da, nỉ bên trong xe.'
        ],
        steps: [
            'Kiểm tra lọc gió điều hòa, vệ sinh hoặc đề xuất thay thế nếu quá bẩn.',
            'Đặt máy xông khói sinh học chuyên dụng vào khu vực để chân hành khách phía trước.',
            'Bật hệ thống điều hòa xe ở chế độ gió trong (Recirculation) công suất tối đa.',
            'Đóng kín cửa xe chạy máy xông khói trong 15 phút để tuần hoàn hệ thống gió.',
            'Mở toàn bộ cửa xe thông gió trong 10 phút, kiểm tra chất lượng mùi hương và bàn giao.'
        ]
    },
    'Bảo dưỡng nhanh tổng quát': {
        image: baoDuong,
        highlights: [
            'Kiểm tra nhanh 12 hạng mục an toàn quan trọng của xe.',
            'Hỗ trợ thay nhớt động cơ, lọc nhớt và bảo dưỡng nhanh hệ thống phanh.',
            'Vệ sinh bugi đánh lửa, cổ hút ga và lọc gió động cơ chuyên nghiệp.',
            'Đọc lỗi điện tử hộp đen xe bằng thiết bị chẩn đoán chuyên dụng OBD-II.'
        ],
        steps: [
            'Tiếp nhận xe, cắm máy đọc lỗi OBD-II kiểm tra hệ thống điều khiển điện tử.',
            'Kiểm tra mức và chất lượng dầu động cơ, dầu phanh, nước làm mát, nước rửa kính.',
            'Tháo dỡ vệ sinh bugi đánh lửa, lọc gió động cơ, lọc gió điều hòa.',
            'Nâng xe kiểm tra độ mòn má phanh, độ mòn lốp và đo điện áp bình ắc quy.',
            'Lập biên bản ghi nhận kết quả bảo dưỡng, bàn giao phiếu check-list cho chủ xe.'
        ]
    },
    'Dán phim cách nhiệt chống nóng cao cấp': {
        image: cachNhiet,
        highlights: [
            'Sử dụng dòng phim cách nhiệt đa lớp gốc gốm (Ceramic) hoặc phản xạ dòng điện cao cấp.',
            'Cản tới 99% tia cực tím (UV) độc hại và hơn 90% tia hồng ngoại (IR) gây nóng.',
            'Tăng sự riêng tư cho không gian cabin nhưng vẫn đảm bảo độ truyền sáng an toàn khi lái đêm.',
            'Chính sách bảo hành bong tróc, bọt khí và thông số cách nhiệt chính hãng lên đến 10 năm.'
        ],
        steps: [
            'Tiếp nhận xe, đo đạc thông số kính nguyên bản và vệ sinh chuyên sâu bề mặt kính trong/ngoài.',
            'Đo đạc, cắt phom phim cách nhiệt chính xác theo kích thước từng ô kính bằng máy cắt CNC.',
            'Sử dụng máy khò nhiệt chuyên dụng để sấy tạo phom phim bo tròn theo độ cong của kính xe.',
            'Tiến hành dán phim vào mặt trong kính bằng dung dịch bôi trơn chuyên dụng và gạt sạch bọt khí.',
            'Sấy khô cố định các mép góc kính, kiểm tra lại độ trong suốt từ bên trong cabin và bàn giao.'
        ]
    }
};

export default function Service() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    const fetchServices = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("https://6a1e833ab79eec0d6cef6155.mockapi.io/services");
            if (!response.ok) {
                throw new Error("Không thể tải danh sách dịch vụ từ Mock API.");
            }
            const result = await response.json();
            
            if (Array.isArray(result)) {
                const apiServices = result.map(item => {
                    const priceSedanItem = item.servicePrices?.find(sp => sp.vehicleType?.typeName === 'SEDAN');
                    const priceSuvItem = item.servicePrices?.find(sp => sp.vehicleType?.typeName === 'SUV');

                    const staticInfo = serviceStaticDetails[item.serviceName] || {
                        image: null,
                        highlights: [],
                        steps: []
                    };

                    const durationText = item.durationMinutes >= 60
                        ? `${Math.floor(item.durationMinutes / 60)} - ${Math.ceil(item.durationMinutes / 60)} giờ`
                        : `${item.durationMinutes} phút`;

                    return {
                        id: item.id,
                        name: item.serviceName,
                        type: item.category ? item.category.toLowerCase() : 'basic',
                        shortDesc: item.description || '',
                        image: staticInfo.image,
                        duration: durationText,
                        priceSedan: priceSedanItem 
                            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceSedanItem.price) 
                            : 'Liên hệ',
                        priceSuv: priceSuvItem 
                            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceSuvItem.price) 
                            : 'Liên hệ',
                        highlights: staticInfo.highlights,
                        steps: staticInfo.steps
                    };
                });
                setServices(apiServices);
            } else {
                throw new Error("Dữ liệu Mock API không đúng định dạng mảng.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const filteredServices = services.filter(service => {
        if (activeTab === 'all') return true;
        if (activeTab === 'basic') {
            return service.type === 'basic' || service.type === 'addon';
        }
        return service.type === activeTab;
    });

    const premiumCount = services.filter(s => s.type === 'premium').length;
    const basicCount = services.filter(s => s.type === 'basic' || s.type === 'addon').length;

    return (
        <section className="dichvu-page">
            {/* BANNER HEADER */}
            <div className="dichvu-header">
                <div className="dichvu-header__overlay" />
                <div className="dichvu-header__content">
                    <h1 className="dichvu-header__title">
                        DỊCH VỤ CHĂM SÓC XE CHUYÊN NGHIỆP
                    </h1>
                    <p className="dichvu-header__subtitle">
                        Giữ gìn giá trị và vẻ đẹp bền vững cho xế yêu của bạn với quy trình đạt chuẩn quốc tế tại Car Wash Centre
                    </p>
                    <div className="dichvu-header__divider" />
                </div>
            </div>

            {/* BỘ LỌC DỊCH VỤ (TAB BAR) */}
            <div className="dichvu-filter-container">
                <div className="dichvu-filter-tabs">
                    <button
                        className={`dichvu-filter-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        Tất cả <span className="tab-count">{services.length}</span>
                    </button>
                    <button
                        className={`dichvu-filter-btn ${activeTab === 'premium' ? 'active' : ''}`}
                        onClick={() => setActiveTab('premium')}
                    >
                        ✨ Cao cấp <span className="tab-count">{premiumCount}</span>
                    </button>
                    <button
                        className={`dichvu-filter-btn ${activeTab === 'basic' ? 'active' : ''}`}
                        onClick={() => setActiveTab('basic')}
                    >
                        Cơ bản <span className="tab-count">{basicCount}</span>
                    </button>
                </div>
            </div>

            {/* LIST DỊCH VỤ CHƯNG BÀY */}
            <div className="dichvu-container">
                {loading ? (
                    <div className="dichvu-loading">
                        <div className="dichvu-spinner" />
                        <p className="dichvu-loading-text">Đang tải danh sách dịch vụ...</p>
                    </div>
                ) : error ? (
                    <div className="dichvu-error">
                        <div className="dichvu-error-icon">⚠️</div>
                        <h3 className="dichvu-error-title">Không thể tải dữ liệu</h3>
                        <p className="dichvu-error-desc">{error}</p>
                        <button className="dichvu-retry-btn" onClick={fetchServices}>
                            Tải lại
                        </button>
                    </div>
                ) : (
                    <div className="dichvu-list">
                        {filteredServices.map((service, index) => (
                        <div
                            key={service.id}
                            className={`dichvu-row dichvu-row--${service.type} ${index % 2 !== 0 ? 'dichvu-row--reverse' : ''}`}
                        >
                            {/* Ảnh dịch vụ */}
                            <div className="dichvu-row__image-wrapper">
                                <img
                                    src={service.image}
                                    alt={service.name}
                                    className="dichvu-row__image"
                                    loading="lazy"
                                />
                            </div>

                            {/* Nội dung giới thiệu */}
                            <div className="dichvu-row__content">
                                <div className="dichvu-row__badges">
                                    <span className="dichvu-row__badge-id">Dịch vụ #0{service.id}</span>
                                    {service.type === 'premium' ? (
                                        <span className="dichvu-row__badge-tag dichvu-row__badge-tag--premium">
                                            ✨ Dịch Vụ Cao Cấp
                                        </span>
                                    ) : (
                                        <span className="dichvu-row__badge-tag dichvu-row__badge-tag--basic">
                                            Dịch Vụ Cơ Bản
                                        </span>
                                    )}
                                </div>
                                <h2 className="dichvu-row__title">{service.name}</h2>
                                <p className="dichvu-row__desc">{service.shortDesc}</p>

                                <div className="dichvu-row__meta">
                                    <div className="dichvu-row__meta-item">
                                        <span className="icon">⏱</span>
                                        <span className="text">Thời gian: <strong>{service.duration}</strong></span>
                                    </div>
                                    <div className="dichvu-row__meta-item">
                                        <span className="icon">💵</span>
                                        <span className="text">Giá chỉ từ: <strong>{service.priceSedan}</strong></span>
                                    </div>
                                </div>

                                <button
                                    className="dichvu-row__btn"
                                    onClick={() => setSelectedService(service)}
                                >
                                    Tìm hiểu chi tiết <span className="arrow">▶</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                )}
            </div>

            {/* POPUP MODAL */}
            {selectedService && (
                <ServiceModal
                    service={selectedService}
                    onClose={() => setSelectedService(null)}
                />
            )}
        </section>
    );
}

/* COMPONENT MODAL CHI TIẾT DỊCH VỤ */
function ServiceModal({ service, onClose }) {
    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('service-modal-overlay')) {
            onClose();
        }
    };

    return (
        <div className="service-modal-overlay" onClick={handleOverlayClick}>
            <div className="service-modal">
                {/* Nút đóng */}
                <button className="service-modal__close" onClick={onClose} aria-label="Close modal">
                    &times;
                </button>

                {/* Phần Header Row: Chia 2 cột */}
                <div className="service-modal__header-row">
                    <div className="service-modal__header-image-wrapper">
                        <img
                            src={service.image}
                            alt={service.name}
                            className="service-modal__header-image"
                        />
                    </div>
                    <div className="service-modal__header-content">
                        <span className="service-modal__badge-top">CAR WASH CENTRE</span>
                        <h2 className="service-modal__title">{service.name}</h2>
                        <p className="service-modal__short-desc">{service.shortDesc}</p>

                        <div className="service-modal__duration-box">
                            <span className="icon">⏱</span>
                            <span className="text">
                                Thời gian thực hiện: <strong>{service.duration}</strong>
                            </span>
                        </div>
                    </div>
                </div>

                <hr className="service-modal__divider" />

                {/* Phần Body: Giá và Quy trình */}
                <div className="service-modal__body">
                    {/* Bảng giá dự kiến */}
                    <div className="service-modal__section">
                        <h3 className="service-modal__section-title">
                            <span className="icon">📊</span> Bảng giá dịch vụ dự kiến
                        </h3>
                        <div className="service-modal__price-table">
                            <div className="price-row">
                                <span className="vehicle-type">🚗 Xe 4 - 5 chỗ (Sedan / Hatchback)</span>
                                <span className="price-val">{service.priceSedan}</span>
                            </div>
                            <div className="price-row">
                                <span className="vehicle-type">🚙 Xe 7 chỗ / Bán tải (SUV / Crossover)</span>
                                <span className="price-val">{service.priceSuv}</span>
                            </div>
                        </div>
                        <p className="price-note">
                            * Lưu ý: Giá thực tế có thể dao động nhẹ tùy theo tình trạng vệ sinh và kích thước đặc thù của xe.
                        </p>
                    </div>

                    {/* Điểm nổi bật */}
                    <div className="service-modal__section">
                        <h3 className="service-modal__section-title">
                            <span className="icon">✨</span> Ưu thế vượt trội
                        </h3>
                        <ul className="service-modal__highlights">
                            {service.highlights.map((highlight, idx) => (
                                <li key={idx}>
                                    <span className="bullet">✓</span> {highlight}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Quy trình */}
                    <div className="service-modal__section">
                        <h3 className="service-modal__section-title">
                            <span className="icon">📝</span> Quy trình thực hiện tiêu chuẩn
                        </h3>
                        <div className="service-modal__steps">
                            {service.steps.map((step, idx) => (
                                <div key={idx} className="step-item">
                                    <div className="step-number">{idx + 1}</div>
                                    <div className="step-text">{step}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Đặt lịch */}
                <div className="service-modal__footer">
                    <button
                        className="service-modal__booking-btn"
                        onClick={() => {
                            onClose();
                            alert(`Cảm ơn bạn đã quan tâm dịch vụ ${service.name}. Vui lòng cuộn xuống phần Đặt Lịch (Booking) ở Trang Chủ hoặc liên hệ trực tiếp hotline để được phục vụ tốt nhất!`);
                        }}
                    >
                        ĐĂNG KÝ ĐẶT LỊCH NGAY
                    </button>
                </div>
            </div>
        </div>
    );
}
