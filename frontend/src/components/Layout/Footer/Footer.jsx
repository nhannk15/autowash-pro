import './Footer.css'

export default function Footer() {
    return (
        <footer className="footer">
            {/* Decorative top gradient divider */}
            <div className="footer__divider" />

            <div className="footer__inner">

                {/* Navigation Row */}
                <nav className="footer__nav">
                    <a href="/" className="footer__nav-link footer__nav-link--active">Trang Chủ</a>
                    <a href="/services" className="footer__nav-link">Dịch Vụ</a>
                    <a href="/system" className="footer__nav-link">Hệ Thống</a>
                    <a href="/blog" className="footer__nav-link">Blog</a>
                </nav>

                {/* Contact + Hours */}
                <div className="footer__body">

                    {/* Contact Section */}
                    <div className="footer__contact">
                        <h4 className="footer__contact-title">Liên hệ với chúng tôi</h4>

                        <div className="footer__contact-item">
                            <span className="footer__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.079 3.218-4.402 3.218-7.327a7.5 7.5 0 10-15 0c0 2.925 1.274 5.248 3.218 7.327a19.58 19.58 0 002.683 2.282 16.975 16.975 0 001.144.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                            </span>
                            <div className="footer__contact-text">
                                <p>Số 1A Phú Thuận, Quận 7, Tp.Hồ Chí Minh.</p>
                                <p>Chăm sóc khách hàng: <a href="mailto:info@carwashcentre.vn" className="footer__email">info@carwashcentre.vn</a></p>
                            </div>
                        </div>

                        <div className="footer__contact-item">
                            <span className="footer__icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                                </svg>
                            </span>
                            <p className="footer__phone">07 64 64 64 16</p>
                        </div>
                    </div>

                    {/* Vertical separator */}
                    <div className="footer__separator" />

                    {/* Business Hours */}
                    <div className="footer__hours">
                        <h4 className="footer__contact-title">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{marginRight: '6px', verticalAlign: 'middle'}}>
                                <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                            </svg>
                            Giờ hoạt động
                        </h4>
                        <div className="footer__hours-list">
                            <div className="footer__hours-row">
                                <span className="footer__hours-day">Thứ 2 – Thứ 6</span>
                                <span className="footer__hours-time">07:00 – 21:00</span>
                            </div>
                            <div className="footer__hours-row">
                                <span className="footer__hours-day">Thứ 7 – Chủ Nhật</span>
                                <span className="footer__hours-time">07:00 – 22:00</span>
                            </div>
                            <div className="footer__hours-badge">
                                <span className="footer__badge-dot" />
                                Đang mở cửa
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* Copyright bottom bar */}
            <div className="footer__bottom">
                <p>© 2026 Car Wash Centre. All rights reserved.</p>
            </div>
        </footer>
    )
}
