import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ProductOutlined,
    TableOutlined,
    ScanOutlined,
    CreditCardOutlined,
    HistoryOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined
} from '@ant-design/icons';
import { Menu } from 'antd';
import { useAuth } from '../../../context/AuthContext';
import './Sidebar.css';

function getItem(label, key, icon, children, className) {
    return {
        key,
        icon,
        children,
        label,
        className,
    };
}

const items = [
    getItem('Dashboard', '/staff/dashboard', <ProductOutlined />),
    getItem('Hàng chờ', '/staff/queue', <TableOutlined />),
    getItem('Check-in', '/staff/checkin', <ScanOutlined />),
    getItem('Thanh toán', '/staff/payment', <CreditCardOutlined />),
    getItem('Lịch sử', '/staff/history', <HistoryOutlined />),
    getItem('Hồ sơ', '/staff/profile', <UserOutlined />),
    getItem('Đăng xuất', 'logout', <LogoutOutlined />, null, 'sidebar__menu-item--logout'),
];

export default function Sidebar({ menuItems, children }) {
    const [collapsed, setCollapsed] = useState(false);

    // Nếu được truyền menuItems từ ngoài vào thì dùng nó, không thì dùng mặc định (của Staff)
    const renderItems = menuItems || items;

    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    // Lấy tên hiển thị và role
    const displayName = user?.fullname || 'Người dùng';
    const displayRole = user?.role || 'Staff';
    const avatarLetter = displayName.charAt(0).toUpperCase();

    const handleMenuClick = async (e) => {
        if (e.key === 'logout') {
            try {
                await logout();
                navigate('/login');
            } catch (error) {
                console.error('Logout error:', error);
            }
        } else {
            // Chuyển hướng đến URL tương ứng với key
            navigate(e.key);
        }
    };

    return (
        <div className="dashboard-layout">
            <div className="dashboard-layout__body">
                {/* Sidebar */}
                <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
                    {/* Profile Card */}
                    <div className="sidebar__profile">
                        <div className="sidebar__avatar">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Avatar" />
                            ) : (
                                <span className="sidebar__avatar-placeholder">
                                    {avatarLetter}
                                </span>
                            )}
                        </div>
                        <div className="sidebar__user-info">
                            <span className="sidebar__username">{displayName}</span>
                            <span className="sidebar__role">{displayRole}</span>
                        </div>
                    </div>

                    {/* Menu */}
                    <div className="sidebar__menu">
                        <Menu
                            selectedKeys={[location.pathname]}
                            mode="inline"
                            items={renderItems}
                            inlineCollapsed={collapsed}
                            onClick={handleMenuClick}
                        />
                    </div>

                    {/* Toggle Button */}
                    <div
                        className="sidebar__toggle"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="dashboard-layout__content">
                    {children}
                </main>
            </div>
        </div>
    );
}
