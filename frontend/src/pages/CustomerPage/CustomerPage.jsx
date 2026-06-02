import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    AppstoreOutlined, 
    CarOutlined, 
    CalendarOutlined, 
    CreditCardOutlined, 
    UserOutlined, 
    LogoutOutlined 
} from '@ant-design/icons';
import './CustomerPage.css';

export default function CustomerPage() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center', fontSize: '18px', color: '#002b7f', fontWeight: 'bold' }}>Đang tải...</div>;
    }

    if (!user) {
        return null;
    }

    const menuItems = [
        { label: 'Tổng quan', to: '/ca-nhan/tong-quan', icon: <AppstoreOutlined /> },
        { label: 'Xe của tôi', to: '/ca-nhan/xe-cua-toi', icon: <CarOutlined /> },
        { label: 'Đặt lịch rửa xe', to: '/ca-nhan/dat-lich', icon: <CalendarOutlined /> },
        { label: 'Thanh toán', to: '/ca-nhan/thanh-toan', icon: <CreditCardOutlined /> },
        { label: 'Hồ sơ cá nhân', to: '/ca-nhan/ho-so', icon: <UserOutlined /> },
    ];

    return (
        <div className="customer-page-container">
            {/* Sidebar Left */}
            <aside className="customer-sidebar">
                <ul className="customer-sidebar__menu">
                    {menuItems.map((item) => (
                        <li key={item.to} className="customer-sidebar__item">
                            <NavLink 
                                to={item.to} 
                                className={({ isActive }) => 
                                    `customer-sidebar__link${isActive ? ' customer-sidebar__link--active' : ''}`
                                }
                            >
                                <span className="customer-sidebar__icon">{item.icon}</span>
                                <span className="customer-sidebar__label">{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                    <li className="customer-sidebar__item customer-sidebar__item--logout">
                        <button onClick={handleLogout} className="customer-sidebar__btn-logout">
                            <span className="customer-sidebar__icon"><LogoutOutlined /></span>
                            <span className="customer-sidebar__label">Đăng xuất</span>
                        </button>
                    </li>
                </ul>
            </aside>

            {/* Content Right */}
            <main className="customer-content">
                <Outlet />
            </main>
        </div>
    );
}
