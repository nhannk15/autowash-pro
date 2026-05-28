import { NavLink } from 'react-router-dom'
import './Navbar.css'

const navLinks = [
    { label: 'Trang Chủ', to: '/' },
    { label: 'Dịch Vụ',   to: '/dich-vu' },
    { label: 'Blog',       to: '/blog' },
]

export default function NavBar() {
    return (
        <nav className="navbar">
            <div className="navbar__container">
                <div className="navbar__logo">
                    <span className="navbar__logo--bold">CARWASH</span>
                    <span className="navbar__logo--accent">Centre</span>

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

                <div className="navbar__auth">
                    <NavLink to="/login" className="navbar__btn navbar__btn--login">Login</NavLink>
                    <a href="#" className="navbar__btn navbar__btn--signup">Sign Up</a>
                </div>
            </div>
        </nav>
    )
}