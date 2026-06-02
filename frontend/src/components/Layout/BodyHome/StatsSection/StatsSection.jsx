import { useEffect, useRef, useState } from 'react'
import './StatsSection.css'

// ─── SVG ICONS ────────────────────────────────────────────────────
const IconCar = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 01-2-2v-4l2.5-6h13L19 11v4a2 2 0 01-2 2h-2" />
        <circle cx="7.5" cy="17.5" r="1.5" />
        <circle cx="16.5" cy="17.5" r="1.5" />
        <path d="M5 11h14" />
    </svg>
)

const IconStar = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
)

const IconClock = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
)

const IconAward = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" />
    </svg>
)

// ─── DỮ LIỆU STATS ───────────────────────────────────────────────
const stats = [
    { id: 1, value: 2000, suffix: '+', label: 'Xe đã phục vụ',         Icon: IconCar   },
    { id: 2, value: 4.9,  suffix: '/5', label: 'Đánh giá trung bình', Icon: IconStar  },
    { id: 3, value: 30,   suffix: ' phút', label: 'Thời gian hoàn thành', Icon: IconClock },
    { id: 4, value: 5,    suffix: ' năm', label: 'Kinh nghiệm',        Icon: IconAward },
]

// ─── DỮ LIỆU TESTIMONIALS ────────────────────────────────────────
const testimonials = [
    {
        id: 1,
        name: 'Nguyễn Văn An',
        role: 'Khách hàng thân thiết',
        avatar: 'A',
        avatarColor: '#0d1b4b',
        rating: 5,
        text: 'Dịch vụ tuyệt vời! Xe tôi sạch bóng như mới sau khi rửa tại đây. Nhân viên nhiệt tình, chuyên nghiệp. Chắc chắn sẽ quay lại!',
    },
    {
        id: 2,
        name: 'Trần Thị Bích',
        role: 'Thành viên Gold',
        avatar: 'B',
        avatarColor: '#c8a400',
        rating: 5,
        text: 'Gói Detailing cao cấp thực sự xứng đáng với từng đồng tiền. Xe của tôi trông như vừa ra khỏi showroom. Rất hài lòng!',
    },
    {
        id: 3,
        name: 'Lê Minh Khoa',
        role: 'Khách hàng mới',
        avatar: 'K',
        avatarColor: '#1a6b3a',
        rating: 5,
        text: 'Lần đầu đến thử nhưng ấn tượng ngay từ đầu. Quy trình rửa xe bài bản, an toàn cho sơn xe. Đã đặt lịch tháng tới rồi!',
    },
    {
        id: 4,
        name: 'Phạm Hoàng Nam',
        role: 'Thành viên Platinum',
        avatar: 'N',
        avatarColor: '#5a3d8a',
        rating: 5,
        text: 'Dùng dịch vụ Platinum đã 2 năm, không có gì để chê. Xe đưa đón tận nơi, ưu đãi 25%, chăm sóc khách hàng xuất sắc.',
    },
]

// ─── COUNTER HOOK ─────────────────────────────────────────────────
function useCounter(target, duration = 1800, started) {
    const [count, setCount] = useState(0)
    const isDecimal = target % 1 !== 0

    useEffect(() => {
        if (!started) return
        let startTime = null
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(isDecimal ? parseFloat((eased * target).toFixed(1)) : Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }, [started, target, duration, isDecimal])

    return count
}

// ─── STAT CARD ────────────────────────────────────────────────────
function StatCard({ stat, started }) {
    const count = useCounter(stat.value, 1800, started)
    const { Icon } = stat
    return (
        <div className="stat-card">
            <div className="stat-card__icon-wrap">
                <Icon />
            </div>
            <div className="stat-card__body">
                <div className="stat-card__number">
                    {count}{stat.suffix}
                </div>
                <div className="stat-card__label">{stat.label}</div>
            </div>
        </div>
    )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────
export default function StatsSection() {
    const [statsStarted, setStatsStarted] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)
    const sectionRef = useRef(null)

    // IntersectionObserver cho counter animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStatsStarted(true) },
            { threshold: 0.3 }
        )
        if (sectionRef.current) observer.observe(sectionRef.current)
        return () => observer.disconnect()
    }, [])

    // Auto-slide testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex(i => (i + 1) % testimonials.length)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    const prev = () => setActiveIndex(i => (i - 1 + testimonials.length) % testimonials.length)
    const next = () => setActiveIndex(i => (i + 1) % testimonials.length)

    return (
        <section className="stats-section" ref={sectionRef}>

            {/* ── STATS COUNTER ─────────────────────────── */}
            <div className="stats-section__header">
                <span className="stats-section__badge">CON SỐ BIẾT NÓI</span>
                <h2 className="stats-section__title">Tại Sao Khách Hàng Tin Tưởng Chúng Tôi?</h2>
                <p className="stats-section__subtitle">
                    Hơn 5 năm kinh nghiệm, hàng nghìn lượt khách hài lòng là minh chứng rõ nhất.
                </p>
            </div>

            <div className="stats-grid">
                {stats.map(stat => (
                    <StatCard key={stat.id} stat={stat} started={statsStarted} />
                ))}
            </div>

            {/* ── DIVIDER ───────────────────────────────── */}
            <div className="stats-section__divider" />

            {/* ── TESTIMONIALS ──────────────────────────── */}
            <div className="stats-section__header">
                <span className="stats-section__badge">ĐÁNH GIÁ THỰC TẾ</span>
                <h2 className="stats-section__title">Khách Hàng Nói Gì Về Chúng Tôi?</h2>
            </div>

            <div className="testimonials">
                {/* Nút prev */}
                <button className="testimonials__arrow testimonials__arrow--prev" onClick={prev} aria-label="Trước">
                    ‹
                </button>

                {/* Slider wrapper */}
                <div className="testimonials__wrapper">
                    <div
                        className="testimonials__track"
                        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                    >
                        {testimonials.map(t => (
                            <div key={t.id} className="testimonial-card">
                                {/* Stars */}
                                <div className="testimonial-card__stars">
                                    {'★'.repeat(t.rating)}
                                </div>

                                {/* Quote */}
                                <p className="testimonial-card__text">"{t.text}"</p>

                                {/* Author */}
                                <div className="testimonial-card__author">
                                    <div
                                        className="testimonial-card__avatar"
                                        style={{ backgroundColor: t.avatarColor }}
                                    >
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div className="testimonial-card__name">{t.name}</div>
                                        <div className="testimonial-card__role">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Nút next */}
                <button className="testimonials__arrow testimonials__arrow--next" onClick={next} aria-label="Tiếp">
                    ›
                </button>
            </div>

            {/* Dots */}
            <div className="testimonials__dots">
                {testimonials.map((_, i) => (
                    <button
                        key={i}
                        className={`testimonials__dot ${i === activeIndex ? 'testimonials__dot--active' : ''}`}
                        onClick={() => setActiveIndex(i)}
                        aria-label={`Slide ${i + 1}`}
                    />
                ))}
            </div>

        </section>
    )
}
