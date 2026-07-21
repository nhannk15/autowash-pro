import Sidebar from "../../components/Layout/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import {
    ProductOutlined,
    TableOutlined,
    ScanOutlined,
    CreditCardOutlined,
    HistoryOutlined,
    UserOutlined,
    LogoutOutlined,
} from '@ant-design/icons';

function getItem(label, key, icon, children, className) {
    return {
        key,
        icon,
        children,
        label,
        className,
    };
}

const staffItems = [
    getItem('Dashboard', '/staff/dashboard', <ProductOutlined />),
    getItem('Hàng chờ', '/staff/queue', <TableOutlined />),
    getItem('Check-in', '/staff/checkin', <ScanOutlined />),
    getItem('Thanh toán', '/staff/payment', <CreditCardOutlined />),
    getItem('Lịch sử', '/staff/history', <HistoryOutlined />),
    getItem('Hồ sơ', '/staff/profile', <UserOutlined />),
    getItem('Đăng xuất', 'logout', <LogoutOutlined />, null, 'sidebar__menu-item--logout'),
];


export default function StaffPage() {
    return (
        <Sidebar menuItems={staffItems}>
            <Outlet />
        </Sidebar>
    )
}