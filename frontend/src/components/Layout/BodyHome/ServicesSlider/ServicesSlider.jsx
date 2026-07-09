import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './ServicesSlider.css'
import ceramicImg from '../../../../assets/Service/PhuCeramic.png';
import exteriorImg from '../../../../assets/Service/RuaXeNgoaiThat.jpg';
import interiorImg from '../../../../assets/Service/VeSinhNoiThat.jpg';
import odorImg from '../../../../assets/Service/KhuMui.png';
import baoDuong from '../../../../assets/Service/baoDuong.jpg';
import engineImg from '../../../../assets/Service/VeSinhKhoangMay.png';
import cachNhiet from '../../../../assets/Service/cachNhiet.jpg';
import { getService } from '../../../../service/customerService';

const localImages = {
    'Rửa xe ngoại thất cao cấp': exteriorImg,
    'Vệ sinh nội thất chuyên sâu': interiorImg,
    'Phủ Ceramic bảo vệ sơn': ceramicImg,
    'Vệ sinh khoang máy chuyên sâu': engineImg,
    'Khử mùi và diệt khuẩn cabin': odorImg,
    'Bảo dưỡng nhanh tổng quát': baoDuong,
    'Dán phim cách nhiệt chống nóng cao cấp': cachNhiet
};

// Số card hiển thị cùng lúc
const VISIBLE = 4
// Chiều rộng mỗi card (px) + gap → tính bước trượt
const CARD_WIDTH = 252
const GAP = 16
const STEP = CARD_WIDTH + GAP

export default function ServicesSlider() {
    const navigate = useNavigate()
    const [currentIndex, setCurrentIndex] = useState(0)
    const [services, setServices] = useState([])

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await getService()
                const data = response?.data || []
                setServices(data)
            } catch (error) {
                console.error("Lỗi khi tải dịch vụ:", error)
            }
        }
        fetchServices()
    }, [])

    const maxIndex = Math.max(0, services.length - VISIBLE)

    const prev = () => setCurrentIndex(i => Math.max(0, i - 1))
    const next = () => setCurrentIndex(i => Math.min(maxIndex, i + 1))

    const handleViewMore = () => {
        navigate('/service')
    }

    return (
        <section className="services-section">
            <div className="services__container">

                {/* TIÊU ĐỀ */}
                <h2 className="services__title">
                    Các dịch vụ chăm sóc xe ô tô tại nhà của Car Wash Centre
                </h2>
                <hr className="services__divider" />

                {/* SLIDER */}
                <div className="services-slider">

                    {/* NÚT TRÁI */}
                    <button
                        className="services-arrow services-arrow--prev"
                        onClick={prev}
                        disabled={currentIndex === 0}
                    >
                        ‹
                    </button>

                    {/* VÙNG HIỂN THỊ CARD */}
                    <div className="services-wrapper">
                        <div
                            className="services-track"
                            style={{ transform: `translateX(-${currentIndex * STEP}px)` }}
                        >
                            {services.map((service) => {
                                // Lấy ảnh từ URL hoặc fallback sang localImages hoặc fallback mặc định
                                const imageSrc = service.imageUrl || localImages[service.serviceName] || exteriorImg;
                                return (
                                    <div
                                        key={service.serviceId}
                                        className="service-card"
                                        style={{
                                            backgroundImage: `url(${imageSrc})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}
                                    >
                                        {/* Vùng ảnh */}
                                        <div className="service-card__visual">
                                        </div>

                                        {/* Nhãn tên dịch vụ */}
                                        <div className="service-card__label">
                                            <h3 className="service-card__name">{service.serviceName}</h3>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* NÚT PHẢI */}
                    <button
                        className="services-arrow services-arrow--next"
                        onClick={next}
                        disabled={currentIndex === maxIndex}
                    >
                        ›
                    </button>

                </div>

                {/* DOTS */}
                <div className="services-dots">
                    {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                        <button
                            key={i}
                            className={`services-dot ${i === currentIndex ? 'services-dot--active' : ''}`}
                            onClick={() => setCurrentIndex(i)}
                        />
                    ))}
                </div>

                {/* NÚT XEM THÊM */}
                <div className="services__footer">
                    <button className="services__view-more" onClick={handleViewMore}>
                        Xem Chi Tiết
                    </button>
                </div>

            </div>
        </section>
    )
}
