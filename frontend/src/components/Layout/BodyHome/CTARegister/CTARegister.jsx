import ctaBg from '../../../../assets/CTARegister/CTARegister.jpg'
import './CTARegister.css'

const benefits = [
    { icon: '📅', text: 'Đặt lịch rửa xe nhanh chóng, tiện lợi' },
    { icon: '📋', text: 'Theo dõi lịch sử dịch vụ toàn bộ xe' },
    { icon: '🎁', text: 'Nhận ưu đãi & khuyến mãi độc quyền' },
    { icon: '🔔', text: 'Nhắc lịch tự động, không bỏ lỡ bảo dưỡng' },
    { icon: '⭐', text: 'Tích điểm đổi quà với mỗi lần sử dụng' },
]

export default function CTARegister() {
    return (
        <section className="cta-register" style={{ backgroundImage: `url(${ctaBg})` }}>
            {/* Decorative blobs */}
            <div className="cta-register__blob cta-register__blob--1" />
            <div className="cta-register__blob cta-register__blob--2" />

            <div className="cta-register__inner">

                {/* ── CỘT TRÁI: nội dung ──────────────────── */}
                <div className="cta-register__content">
                    <span className="cta-register__badge">THAM GIA NGAY HÔM NAY</span>

                    <h2 className="cta-register__title">
                        Đăng Ký Miễn Phí —<br />
                        Mở Khoá Toàn Bộ Dịch Vụ
                    </h2>

                    <p className="cta-register__desc">
                        Tạo tài khoản trong vòng 30 giây và trải nghiệm hệ thống đặt lịch
                        thông minh của Car Wash Centre.
                    </p>

                    {/* Danh sách lợi ích */}
                    <ul className="cta-register__benefits">
                        {benefits.map((b, i) => (
                            <li key={i} className="cta-register__benefit">
                                <span className="cta-register__benefit-icon">{b.icon}</span>
                                <span>{b.text}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Buttons */}
                    <div className="cta-register__actions">
                        <a href="/signup" className="cta-register__btn cta-register__btn--primary">
                            Đăng Ký Miễn Phí
                        </a>
                        <a href="/login" className="cta-register__btn cta-register__btn--secondary">
                            Đã Có Tài Khoản? Đăng Nhập
                        </a>
                    </div>
                </div>

                {/* ── CỘT PHẢI: visual card ────────────────── */}
                <div className="cta-register__visual">
                    <div className="cta-register__card">
                        {/* Card header */}
                        <div className="cta-card__header">
                            <div className="cta-card__logo">
                                <span className="cta-card__logo-bold">CARWASH</span>
                                <span className="cta-card__logo-accent">Centre</span>
                            </div>
                            <span className="cta-card__member-badge">MEMBER</span>
                        </div>

                        {/* Fake avatar + greeting */}
                        <div className="cta-card__user">
                            <div className="cta-card__avatar">👤</div>
                            <div>
                                <div className="cta-card__greeting">Chào mừng trở lại,</div>
                                <div className="cta-card__username">Thành Viên Mới ✨</div>
                            </div>
                        </div>

                        {/* Stats mini */}
                        <div className="cta-card__stats">
                            <div className="cta-card__stat">
                                <span className="cta-card__stat-value">0</span>
                                <span className="cta-card__stat-label">Lịch đặt</span>
                            </div>
                            <div className="cta-card__stat-divider" />
                            <div className="cta-card__stat">
                                <span className="cta-card__stat-value">0đ</span>
                                <span className="cta-card__stat-label">Điểm tích lũy</span>
                            </div>
                            <div className="cta-card__stat-divider" />
                            <div className="cta-card__stat">
                                <span className="cta-card__stat-value">Silver</span>
                                <span className="cta-card__stat-label">Hạng thành viên</span>
                            </div>
                        </div>

                        {/* CTA mini */}
                        <div className="cta-card__action">
                            <span className="cta-card__action-text">🚗 Đặt lịch ngay →</span>
                        </div>
                    </div>

                    {/* Floating badges */}
                    <div className="cta-register__float cta-register__float--top">
                        ✅ Đăng ký miễn phí
                    </div>
                    <div className="cta-register__float cta-register__float--bottom">
                        🔒 Bảo mật thông tin
                    </div>
                </div>

            </div>
        </section>
    )
}
