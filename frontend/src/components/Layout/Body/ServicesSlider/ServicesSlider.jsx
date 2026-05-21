import { useState } from 'react'
import './ServicesSlider.css'
import ceramicImg from '../../../../assets/Service/PhuCeramic.png';
import exteriorImg from '../../../../assets/Service/RuaXeNgoaiThat.jpg';
import interiorImg from '../../../../assets/Service/VeSinhNoiThat.jpg';
import khuMui from '../../../../assets/Service/khuMui.png';
import baoDuongNhanh from '../../../../assets/Service/baoDuongNhanh.png';


// Dữ liệu 5 dịch vụ - dùng màu tạm, thay ảnh sau
const services = [
    {
        id: 1,
        name: 'Bảo dưỡng nhanh',
        desc: 'Bugi, lọc gió, dầu phanh,...',
        bgImage: baoDuongNhanh, // Cập nhật từ bgColor sang bgImage
        icon: '🔧',
    },
    {
        id: 2,
        name: 'Khử mùi',
        desc: 'Các loại mùi ẩm mốc',
        bgImage: khuMui,
        icon: '🏠',
    },
    {
        id: 3,
        name: 'Rửa xe đúng cách',
        desc: 'Sạch bóng, an toàn sơn xe',
        bgImage: exteriorImg,
        icon: '🚿',
    },
    {
        id: 4,
        name: 'Vệ sinh nội thất',
        desc: 'Khử mùi, hút bụi chuyên sâu',
        bgImage: interiorImg,
        icon: '✨',
    },
    {
        id: 5,
        name: 'Phủ ceramic',
        desc: 'Bảo vệ sơn lâu dài',
        bgImage: ceramicImg,
        icon: '💎',
    },
]

// Số card hiển thị cùng lúc
const VISIBLE = 4
// Chiều rộng mỗi card (px) + gap → tính bước trượt
const CARD_WIDTH = 276
const GAP = 16
const STEP = CARD_WIDTH + GAP

export default function ServicesSlider() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const maxIndex = services.length - VISIBLE // = 1 (chỉ có 1 bước trượt)

    const prev = () => setCurrentIndex(i => Math.max(0, i - 1))
    const next = () => setCurrentIndex(i => Math.min(maxIndex, i + 1))

    // TODO: khi tích hợp React Router → thay bằng navigate('/dich-vu')
    const handleViewMore = () => {
        alert('Trang dịch vụ đang được phát triển!')
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
                            {services.map((service) => (
                                <div
                                    key={service.id}
                                    className="service-card"
                                    style={{
                                        backgroundImage: `url(${service.bgImage})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                >
                                    {/* Vùng ảnh */}
                                    <div className="service-card__visual">
                                    </div>



                                    {/* Nhãn tên dịch vụ */}
                                    <div className="service-card__label">
                                        <h3 className="service-card__name">{service.name}</h3>
                                    </div>
                                </div>
                            ))}
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
                        Xem Thêm
                    </button>
                </div>

            </div>
        </section>
    )
}
