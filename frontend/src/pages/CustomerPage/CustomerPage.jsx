import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    AppstoreOutlined, 
    CarOutlined, 
    CalendarOutlined, 
    CreditCardOutlined, 
    UserOutlined, 
    LogoutOutlined 
} from '@ant-design/icons';
import Sidebar from '../../components/Layout/Sidebar/Sidebar';

export default function CustomerPage() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return <div style={{ padding: '40px', textAlign: 'center', fontSize: '18px', color: '#002b7f', fontWeight: 'bold' }}>Đang tải...</div>;
    }

    if (!user) {
        return null;
    }

    const menuItems = [
        { key: '/ca-nhan/tong-quan', label: 'Tổng quan', icon: <AppstoreOutlined /> },
        { key: '/ca-nhan/xe-cua-toi', label: 'Xe của tôi', icon: <CarOutlined /> },
        { key: '/ca-nhan/dat-lich', label: 'Đặt lịch rửa xe', icon: <CalendarOutlined /> },
        { key: '/ca-nhan/thanh-toan', label: 'Thanh toán', icon: <CreditCardOutlined /> },
        { key: '/ca-nhan/ho-so', label: 'Hồ sơ cá nhân', icon: <UserOutlined /> },
        { type: 'divider' },
        { key: 'logout', label: 'Đăng xuất', icon: <LogoutOutlined />, danger: true },
    ];

    return (
        <Sidebar menuItems={menuItems} theme="light">
            <Outlet />
        </Sidebar>
    );
}
