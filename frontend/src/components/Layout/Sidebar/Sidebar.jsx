import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { useAuth } from '../../../context/AuthContext';
import './Sidebar.css';

export default function Sidebar({ menuItems, children, theme = 'dark' }) {
    const [collapsed, setCollapsed] = useState(true);
    // Trên mobile, sidebar hoạt động như drawer off-canvas, tách riêng khỏi
    // trạng thái collapsed (thu gọn icon) dùng cho desktop/tablet.
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth <= 576 : false
    );
    const [mobileOpen, setMobileOpen] = useState(false);
    const renderItems = menuItems;
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 576;
            setIsMobile(mobile);
            if (!mobile) setMobileOpen(false);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Đóng drawer mobile mỗi khi chuyển trang
    useEffect(() => {
        if (isMobile) setMobileOpen(false);
    }, [location.pathname, isMobile]);

    const handleToggleClick = () => {
        if (isMobile) {
            setMobileOpen(prev => !prev);
        } else {
            setCollapsed(prev => !prev);
        }
    };

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

    // Trên mobile: sidebar ẩn/hiện qua mobileOpen (dùng class sidebar--collapsed để ẩn).
    // Trên desktop/tablet: dùng collapsed như cũ để thu gọn icon.
    const sidebarHiddenClass = isMobile
        ? (mobileOpen ? '' : 'sidebar--collapsed')
        : (collapsed ? 'sidebar--collapsed' : '');
    const inlineCollapsed = isMobile ? false : collapsed;
    const toggleIcon = isMobile
        ? (mobileOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />)
        : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />);

    return (
        <div className="dashboard-layout">
            {/* Thanh trigger mở sidebar trên mobile - nằm trong luồng bình thường,
                ngay dưới Navbar, không dùng fixed để tránh đè lên Navbar */}
            {isMobile && (
                <div className="sidebar__mobile-topbar">
                    <button
                        type="button"
                        className="sidebar__mobile-trigger"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Mở menu"
                    >
                        <MenuUnfoldOutlined />
                        <span>Menu</span>
                    </button>
                </div>
            )}

            <div className="dashboard-layout__body">
                {/* Sidebar */}
                <aside className={`sidebar ${sidebarHiddenClass} sidebar--${theme}`}>
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
                            inlineCollapsed={inlineCollapsed}
                            onClick={handleMenuClick}
                        />
                    </div>

                    {/* Toggle Button */}
                    <div
                        className="sidebar__toggle"
                        onClick={handleToggleClick}
                    >
                        {toggleIcon}
                    </div>
                </aside>

                {/* Overlay nền tối khi drawer mở trên mobile */}
                {isMobile && mobileOpen && (
                    <div
                        className="sidebar__overlay"
                        onClick={() => setMobileOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="dashboard-layout__content">
                    {children}
                </main>
            </div>
        </div>
    );
}