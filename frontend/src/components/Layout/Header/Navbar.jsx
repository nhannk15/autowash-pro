import './Navbar.css'

const navLinks = [
    { label: 'Trang Chủ', href: '#', active: true },
    { label: 'Dịch Vụ', href: '#', active: false },
    { label: 'Hệ Thống', href: '#', active: false },
    { label: 'Blog', href: '#', active: false },
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
                    {navLinks.map((value) => (<li key={value.label}><a className={`navbar__link ${value.active ? 'navbar_link--active' : undefined}`} href='#'>{value.label}</a></li>))}
                </ul>

                <div className="navbar__auth">
                    <a href="#" className="navbar__btn navbar__btn--login">Login</a>
                    <a href="#" className="navbar__btn navbar__btn--signup">Sign Up</a>
                </div>
            </div>
        </nav>
    )
}