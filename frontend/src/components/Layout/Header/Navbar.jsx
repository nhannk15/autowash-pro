import { NavLink } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import './Navbar.css'

export default function NavBar() {
    const { user, logout } = useAuth()

    const navLinks = [
        { label: 'Trang Chủ', to: '/' },
        { label: 'Dịch Vụ', to: '/dich-vu' },
        { label: 'Blog', to: '/blog' },
    ]

    if (user) {
        navLinks.push({ label: 'Cá nhân', to: '/ca-nhan/ho-so' })
    }

    return (
        <nav className="navbar">
            <div className="navbar__container">
                <div className="navbar__logo">
                    <span className="navbar__logo--bold">Autowash</span>
                    <span className="navbar__logo--accent">PRO</span>

                </div>

                <ul className="navbar__links">
                    {navLinks.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                end={item.to === '/'}
                                className={({ isActive }) =>
                                    `navbar__link${isActive ? ' navbar_link--active' : ''}`
                                }
                            >
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {user ? (
                    <div className="navbar__auth">
                        <span>Xin chào, {user.fullname}</span>
                        <button className="navbar__btn navbar__btn--logout" onClick={logout}>Logout</button>
                    </div>
                ) : (<div className="navbar__auth">
                    <NavLink to="/login" className="navbar__btn navbar__btn--login">Login</NavLink>
                    <NavLink to="/signup" className="navbar__btn navbar__btn--signup">Sign Up</NavLink>
                </div>)}
            </div>
        </nav>
    )
}