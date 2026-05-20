import { useState, useEffect } from 'react'
import './HeroSlider.css'
import heroImage from '../../../../assets/HeroSlider/HeroSlider.png'

const slides = [
    {
        id: 1,
        bgImage: heroImage,
        tag: '🚗 Dịch Vụ Rửa Xe Chuyên Nghiệp',
        title: 'Đặt Lịch Rửa Xe\nNgay Hôm Nay',
        desc: 'Nhanh chóng - Tận tâm - Chuyên nghiệp. Xe sạch bóng trong 30 phút!',
        btn1: 'Đặt Lịch Ngay',
        btn2: 'Gọi Ngay: 0909 123 456',
    },
    {
        id: 2,
        bgImage: heroImage,
        tag: '🎉 Ưu Đãi Đặc Biệt Tháng 5',
        title: 'Giảm 30% Tất Cả\nGói Dịch Vụ',
        desc: 'Áp dụng từ 18/05 - 31/05. Đừng bỏ lỡ cơ hội tiết kiệm chi phí!',
        btn1: 'Xem Ưu Đãi',
        btn2: 'Tìm Hiểu Thêm',
    },
]

export default function HeroSlider() {
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex(prev =>
                prev === slides.length - 1 ? 0 : prev + 1
            )
        }, 4000)

        return () => clearInterval(timer)
    }, [])

    const goToSlide = (index) => setCurrentIndex(index)

    return (
        <div className="hero-slider">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`hero-slide ${index === currentIndex ? 'hero-slide--active' : ''}`}
                    style={{ backgroundImage: `url(${slide.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                    <div className="hero-slide__content">
                        <span className="hero-slide__tag">{slide.tag}</span>
                        <h1 className="hero-slide__title">{slide.title}</h1>
                        <p className="hero-slide__desc">{slide.desc}</p>
                        <div className="hero-slide__buttons">
                            <button className="hero-btn hero-btn--primary">{slide.btn1}</button>
                            <button className="hero-btn hero-btn--outline">{slide.btn2}</button>
                        </div>
                    </div>
                </div>
            ))}

            {/* DOTS */}
            <div className="hero-dots">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`hero-dot ${index === currentIndex ? 'hero-dot--active' : ''}`}
                        onClick={() => goToSlide(index)}
                    />
                ))}
            </div>
        </div>
    )
}
