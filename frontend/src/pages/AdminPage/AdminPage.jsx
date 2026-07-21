import Sidebar from "../../components/Layout/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import {
    ProductOutlined,
    UserOutlined,
    LogoutOutlined,
    TeamOutlined,
    ContainerOutlined,
    TagOutlined,
    RubyOutlined,
    GiftOutlined,
    AuditOutlined
} from '@ant-design/icons';

export default function AdminPage() {

    function getItem(label, key, icon, children, className) {
        return {
            key,
            icon,
            children,
            label,
            className,
        };
    }

    const adminItems = [
        getItem('Dashboard', '/admin/dashboard', <ProductOutlined />),
        getItem('Khách hàng', '/admin/customer', <TeamOutlined />),
        getItem('Nhân viên', '/admin/staff', <AuditOutlined />),
        getItem('Dịch vụ', '/admin/service', <ContainerOutlined />),
        getItem('Hạng thành viên', '/admin/membership', <RubyOutlined />),
        getItem('Đổi thưởng', '/admin/rewards', <GiftOutlined />),
        getItem('Khuyến mãi', '/admin/promotion', <TagOutlined />),
        getItem('Hồ sơ', '/admin/profile', <UserOutlined />),
        getItem('Đăng xuất', 'logout', <LogoutOutlined />, null, 'sidebar__menu-item--logout'),
    ];

    return (
        <Sidebar menuItems={adminItems}>
            <Outlet />
        </Sidebar>
    )
}