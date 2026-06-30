import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { MenuOutlined, CloseOutlined } from '@ant-design/icons'
import NotificationDropdown from '../../Notification/NotificationDropdown'
import './Navbar.css'

export default function NavBar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const dropdownRef = useRef(null)

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Đóng mobile menu khi resize màn hình lớn hơn 768px
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setIsMobileMenuOpen(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleCLick = () => {
        if (user?.role?.toUpperCase() === "STAFF") {
            navigate('/staff')
        } else if (user?.role?.toUpperCase() === "ADMIN") {
            navigate('/admin')
        } else {
            navigate('/')
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
            setIsDropdownOpen(false)
            navigate('/')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const navLinks = [
        { label: 'Trang Chủ', to: '/' },
        { label: 'Dịch Vụ', to: '/service' },
        { label: 'Blog', to: '/blog' },
    ]

    // Hiển thị "Đặt xe" thay vì "Cá nhân" khi user đăng nhập với role customer
    if (user && user.role?.toUpperCase() === 'CUSTOMER') {
        navLinks.push({ label: 'Đặt lịch', to: '/ca-nhan/dat-lich' })
    }

    return (
        <nav className="navbar">
            <div className="navbar__container">
                <div className="navbar__logo" onClick={handleCLick} style={{ cursor: 'pointer' }}>
                    <span className="navbar__logo--bold">Autowash</span>
                    <span className="navbar__logo--accent">PRO</span>
                </div>

                {user?.role?.toUpperCase() !== "STAFF" && user?.role?.toUpperCase() !== "ADMIN" && (
                    <ul className={`navbar__links ${isMobileMenuOpen ? 'navbar__links--open' : ''}`}>
                        {navLinks.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    end={item.to === '/'}
                                    className={({ isActive }) =>
                                        `navbar__link${isActive ? ' navbar_link--active' : ''}`
                                    }
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                        {!user && (
                            <li className="navbar__auth-mobile">
                                <NavLink to="/login" className="navbar__btn navbar__btn--login" onClick={() => setIsMobileMenuOpen(false)}>Login</NavLink>
                                <NavLink to="/signup" className="navbar__btn navbar__btn--signup" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</NavLink>
                            </li>
                        )}
                    </ul>
                )}

                <div className="navbar__auth">
                    {user ? (
                        <>
                        {/* Bell thông báo - chỉ dành cho CUSTOMER */}
                        {user?.role?.toUpperCase() === 'CUSTOMER' && (
                            <NotificationDropdown />
                        )}
                        <div className="navbar__profile-container" ref={dropdownRef}>
                            <div
                                className="navbar__profile-trigger"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <span className="navbar__profile-name">{user.fullname}</span>
                                <div className="navbar__avatar">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="Avatar" className="navbar__avatar-img" />
                                    ) : (
                                        <span className="navbar__avatar-placeholder">
                                            {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {user?.role?.toUpperCase() === 'STAFF' || user?.role?.toUpperCase() === 'ADMIN' ? (isDropdownOpen && (
                                <div className="navbar__dropdown">
                                    <button
                                        className="navbar__dropdown-item navbar__dropdown-item--logout"
                                        onClick={handleLogout}
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            )) : (isDropdownOpen && (
                                <div className="navbar__dropdown">
                                    <NavLink
                                        to="/ca-nhan/tong-quan"
                                        className="navbar__dropdown-item"
                                        onClick={() => {
                                            setIsDropdownOpen(false)
                                            setIsMobileMenuOpen(false)
                                        }}
                                    >
                                        Trang cá nhân
                                    </NavLink>
                                    <hr className="navbar__dropdown-divider" />
                                    <button
                                        className="navbar__dropdown-item navbar__dropdown-item--logout"
                                        onClick={handleLogout}
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            ))}
                        </div>
                        </>
                    ) : (
                        <div className="navbar__auth-desktop" style={{ display: 'flex', gap: '5px' }}>
                            <NavLink to="/login" className="navbar__btn navbar__btn--login">Login</NavLink>
                            <NavLink to="/signup" className="navbar__btn navbar__btn--signup">Sign Up</NavLink>
                        </div>
                    )}
                </div>

                {user?.role?.toUpperCase() !== "STAFF" && user?.role?.toUpperCase() !== "ADMIN" && (
                    <button
                        className={`navbar__hamburger ${isMobileMenuOpen ? 'navbar__hamburger--open' : ''}`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <CloseOutlined /> : <MenuOutlined />}
                    </button>
                )}
            </div>
        </nav>
    )
}