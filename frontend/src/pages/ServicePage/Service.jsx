import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Service.css'
import { useAuth } from '../../context/AuthContext';
// Import các hình ảnh cục bộ từ assets
import exteriorImg from '../../assets/Service/RuaXeNgoaiThat.jpg';
import interiorImg from '../../assets/Service/VeSinhNoiThat.jpg';
import ceramicImg from '../../assets/Service/PhuCeramic.png';
import engineImg from '../../assets/Service/VeSinhKhoangMay.png';
import odorImg from '../../assets/Service/KhuMui.png';
import baoDuong from '../../assets/Service/baoDuong.jpg';
import cachNhiet from '../../assets/Service/cachNhiet.jpg';
import { getService } from '../../service/CustomerService';

// Bản đồ mapping tên dịch vụ -> hình ảnh cục bộ tương ứng
const localImages = {
    'Rửa xe ngoại thất cao cấp': exteriorImg,
    'Vệ sinh nội thất chuyên sâu': interiorImg,
    'Phủ Ceramic bảo vệ sơn': ceramicImg,
    'Vệ sinh khoang máy chuyên sâu': engineImg,
    'Khử mùi và diệt khuẩn cabin': odorImg,
    'Bảo dưỡng nhanh tổng quát': baoDuong,
    'Dán phim cách nhiệt chống nóng cao cấp': cachNhiet
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
            const result = await getService()
            const serviceList = result?.data || [];

            if (Array.isArray(serviceList)) {
                const apiServices = serviceList.map(item => {
                    const priceSedanItem = item.servicePrices?.find(sp => sp.vehicleType?.typeName === 'SEDAN');
                    const priceSuvItem = item.servicePrices?.find(sp => sp.vehicleType?.typeName === 'SUV');

                    // Lấy ảnh từ mapping cục bộ hoặc link API hoặc dùng ảnh rửa xe làm mặc định
                    const serviceImage = localImages[item.serviceName] || item.image || exteriorImg;

                    // Lấy danh sách ưu thế nổi bật từ API
                    const highlights = item.highlights
                        ? item.highlights.map(h => h.highlightDescription)
                        : [];

                    // Lấy quy trình thực hiện từ API, sắp xếp theo thứ tự bước tăng dần
                    const steps = item.steps
                        ? [...item.steps].sort((a, b) => a.step - b.step).map(s => s.stepDescription)
                        : [];

                    const durationMinutes = item.duration || 0;
                    const durationText = durationMinutes < 60
                        ? `${durationMinutes} phút`
                        : (durationMinutes % 60 === 0
                            ? `${durationMinutes / 60} giờ`
                            : `${Math.floor(durationMinutes / 60)} giờ ${durationMinutes % 60} phút`);

                    return {
                        id: item.serviceId,
                        name: item.serviceName,
                        type: item.category ? item.category.toLowerCase() : 'basic',
                        shortDesc: item.description || '',
                        image: serviceImage,
                        duration: durationText,
                        priceSedan: priceSedanItem
                            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceSedanItem.price)
                            : 'Liên hệ',
                        priceSuv: priceSuvItem
                            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceSuvItem.price)
                            : 'Liên hệ',
                        highlights: highlights,
                        steps: steps
                    };
                });
                setServices(apiServices);
            } else {
                throw new Error("Dữ liệu dịch vụ không đúng định dạng.");
            }
        } catch (err) {
            setError(err.response?.data.message || err.message || 'không thể tải danh sách dịch vụ')
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchServices();
        }, 0);
        return () => clearTimeout(timer);
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
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('service-modal-overlay')) {
            onClose();
        }
    };

    const handleBookingClick = () => {
        onClose();
        if (user) {
            navigate('/ca-nhan/dat-lich');
        } else {
            navigate('/signup');
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
                    {service.highlights && service.highlights.length > 0 && (
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
                    )}

                    {/* Quy trình */}
                    {service.steps && service.steps.length > 0 && (
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
                    )}
                </div>

                {/* Footer Đặt lịch */}
                <div className="service-modal__footer">
                    <button
                        className="service-modal__booking-btn"
                        onClick={handleBookingClick}
                    >
                        {user ? "ĐẶT LỊCH NGAY" : "ĐĂNG KÝ ĐẶT LỊCH NGAY"}
                    </button>
                </div>
            </div>
        </div>
    );
}
