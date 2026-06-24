import React, { useState, useEffect, useMemo } from 'react';
import {
    Row, Col, Card, Statistic, Table,
    Tag, Badge, Alert, Typography, Space, Spin, message, Timeline, Divider, Segmented, Tooltip as AntTooltip,
} from 'antd';
import {
    DollarCircleOutlined, CalendarOutlined, UserAddOutlined, CarOutlined,
    CrownOutlined, WarningOutlined, BellOutlined, CheckCircleOutlined, UserOutlined
} from '@ant-design/icons';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

import {
    getAllBays,
    getUpcomingBookings,
    getTodayBookings,
} from '../../../service/staffService';

// TODO: Khi backend có API dashboard, import từ adminService thay vì staffService
// import {
//     getAdminDashboardSummary,
//     getRevenueChart,
//     getServiceDistribution,
//     getPeakHours,
//     getRecentTransactions,
//     getAdminBays,
//     getAdminTodayBookings,
//     getAdminUpcomingBookings,
// } from '../../../service/adminService';

const { Title, Text } = Typography;

// ─────────────────────────────────────────────
// MOCK DATA (fallback khi API chưa có)
// ─────────────────────────────────────────────

const MOCK_REVENUE_WEEK = [
    { day: 'T2', revenue: 3400000 },
    { day: 'T3', revenue: 3800000 },
    { day: 'T4', revenue: 3300000 },
    { day: 'T5', revenue: 3900000 },
    { day: 'T6', revenue: 3700000 },
    { day: 'T7', revenue: 4200000 },
    { day: 'CN', revenue: 0 },
];

const MOCK_SERVICES = [
    { name: 'Rửa tiêu chuẩn', value: 45, color: '#378ADD' },
    { name: 'Rửa cao cấp', value: 28, color: '#1D9E75' },
    { name: 'Dọn nội thất', value: 17, color: '#7F77DD' },
    { name: 'Rửa khoang máy', value: 10, color: '#EF9F27' },
];

const MOCK_PEAK_HOURS = [
    { hour: '7h', count: 2 }, { hour: '8h', count: 7 }, { hour: '9h', count: 9 },
    { hour: '10h', count: 6 }, { hour: '11h', count: 5 }, { hour: '12h', count: 4 },
    { hour: '13h', count: 3 }, { hour: '14h', count: 5 }, { hour: '15h', count: 6 },
    { hour: '16h', count: 5 }, { hour: '17h', count: 8 }, { hour: '18h', count: 7 },
    { hour: '19h', count: 3 },
];

const MOCK_TRANSACTIONS = [
    { id: 1, createdAt: '13:12', customer: { fullName: 'Vũ Minh T.' }, totalAmount: 180000 },
    { id: 2, createdAt: '12:58', customer: { fullName: 'Đặng Hữu K.' }, totalAmount: 320000 },
    { id: 3, createdAt: '12:44', customer: { fullName: 'Bùi Thị L.' }, totalAmount: 150000 },
    { id: 4, createdAt: '12:30', customer: { fullName: 'Mai Quốc H.' }, totalAmount: 450000 },
    { id: 5, createdAt: '12:15', customer: { fullName: 'Cao Thị M.' }, totalAmount: 180000 },
];

const MOCK_ALERTS = [
    { id: 1, type: 'info', title: 'Khách VIP vừa đặt lịch', desc: 'Trần Thị B (Gold) · 13:45 · Dọn nội thất' },
    { id: 2, type: 'warning', title: '3 voucher sắp hết hạn', desc: 'Hết hạn trong 2 ngày — cần thông báo khách' },
    { id: 3, type: 'warning', title: 'Khoang 5 đang bảo trì', desc: 'Công suất giảm 17% · Dự kiến xong 14:00' },
    { id: 4, type: 'error', title: 'Tỉ lệ hủy tăng bất thường', desc: '2 đơn bị hủy sáng nay — cao hơn trung bình' },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const getCurrentSession = (bay) => {
    if (!bay.currentSession) return null;
    return bay.currentSession;
};

const getBookingRevenue = (record) => {
    if (record.washSessionStatus !== 'PAID') return 0;
    return (record.bookingDetails || []).reduce(
        (sum, d) => sum + Number(d.finalPrice || 0),
        0
    );
};

const getBayDisplayStatus = (bay) => {
    const session = getCurrentSession(bay);
    if (session?.status === 'IN_PROGRESS') return 'OCCUPIED';
    if (session?.status === 'COMPLETED' || session?.status === 'COMPLETE') return 'COMPLETED';
    if (bay.status === 'MAINTENANCE') return 'MAINTENANCE';
    if (bay.status === 'INACTIVE') return 'INACTIVE';
    return 'AVAILABLE';
};

const getBayStatusColor = (displayStatus) => {
    switch (displayStatus) {
        case 'COMPLETED': return 'success';
        case 'AVAILABLE': return 'success';
        case 'OCCUPIED': return 'processing';
        case 'MAINTENANCE': return 'error';
        case 'INACTIVE': return 'default';
        default: return 'default';
    }
};

const getBayStatusText = (displayStatus) => {
    switch (displayStatus) {
        case 'COMPLETED': return 'Hoàn thành';
        case 'AVAILABLE': return 'Trống';
        case 'OCCUPIED': return 'Đang phục vụ';
        case 'MAINTENANCE': return 'Bảo trì';
        case 'INACTIVE': return 'Không hoạt động';
        default: return '';
    }
};

const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const ALERT_ICON = {
    info: <CrownOutlined />,
    warning: <BellOutlined />,
    error: <WarningOutlined />,
};

// ─────────────────────────────────────────────
// PERIOD FILTER OPTIONS
// ─────────────────────────────────────────────

const PERIOD_OPTIONS = [
    { label: 'Hôm nay', value: 'today' },
    { label: '7 ngày', value: 'week' },
    { label: '30 ngày', value: 'month' },
];

const PERIOD_LABEL = {
    today: 'hôm nay',
    week: '7 ngày qua',
    month: '30 ngày qua',
};

// ─────────────────────────────────────────────
// TABLE COLUMNS
// ─────────────────────────────────────────────

const transactionColumns = [
    {
        title: 'Thời gian', dataIndex: 'createdAt', width: 80,
        render: (v) => <Text type="secondary">{v}</Text>,
    },
    { title: 'Khách', dataIndex: ['customer', 'fullName'] },
    {
        title: 'Số tiền', dataIndex: 'totalAmount', align: 'right',
        render: (v) => <Text style={{ color: '#27500A', fontWeight: 500 }}>{formatCurrency(v)}</Text>,
    },
];

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function AdminDashboard() {

    // ── States — data từ API (bays, bookings) ──
    const [bays, setBays] = useState([]);
    const [todayBookings, setTodayBookings] = useState([]);
    const [bookings, setBookings] = useState([]);  // upcoming

    // ── States — data từ mock (chart/kpi/transactions/alerts) ──
    // TODO: Kết nối API khi backend sẵn sàng — thay mock bằng API call
    const [kpi] = useState({ newCustomersMonth: 12 });
    const [revenueWeek] = useState(MOCK_REVENUE_WEEK);
    const [servicesData] = useState(MOCK_SERVICES);
    const [peakHours] = useState(MOCK_PEAK_HOURS);
    const [transactions] = useState(MOCK_TRANSACTIONS);
    const [alerts] = useState(MOCK_ALERTS);

    // ── Period filter ──
    const [period, setPeriod] = useState('today');

    // ── Loading states ──
    const [loadingBays, setLoadingBays] = useState(true);
    const [loadingTodayBookings, setLoadingTodayBookings] = useState(true);
    const [loadingUpcomingBookings, setLoadingUpcomingBookings] = useState(true);

    // ── Fetch Bays ──
    // TODO: Đổi sang /api/admin/dashboard/bays khi backend có API
    useEffect(() => {
        async function fetchBays() {
            try {
                const data = await getAllBays();
                setBays(data);
            } catch (error) {
                console.error("Failed to fetch bays", error);
            } finally {
                setLoadingBays(false);
            }
        }
        fetchBays();
    }, []);

    // ── Fetch Today Bookings ──
    // TODO: Đổi sang /api/admin/dashboard/today-bookings khi backend có API
    useEffect(() => {
        async function fetchBookings() {
            try {
                const data = await getTodayBookings();
                setTodayBookings(data);
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setLoadingTodayBookings(false);
            }
        }
        fetchBookings();
    }, []);

    // ── Fetch Upcoming Bookings ──
    // TODO: Đổi sang /api/admin/dashboard/upcoming-bookings khi backend có API
    useEffect(() => {
        async function fetchUpcomingBookings() {
            try {
                const data = await getUpcomingBookings();
                setBookings(data);
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setLoadingUpcomingBookings(false);
            }
        }
        fetchUpcomingBookings();
    }, []);

    // ── Stats tính từ data thô ──
    const stats = useMemo(() => {
        const activeCars = bays.filter(bay => getCurrentSession(bay)?.status === 'IN_PROGRESS').length;
        const completed = todayBookings.filter(b => b.washSessionStatus === 'PAID').length;
        const todayAppointments = todayBookings.length;
        const revenue = todayBookings.reduce((total, b) => total + getBookingRevenue(b), 0);

        const pending = todayBookings.filter(b => b.washSessionStatus === 'CONFIRMED').length;
        const completionRate = todayAppointments > 0 ? Math.round((completed / todayAppointments) * 100) : 0;

        return { activeCars, completed, todayAppointments, revenue, pending, completionRate };
    }, [bays, todayBookings]);

    // ── Upcoming — filter + map ──
    const upcoming = useMemo(() => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        return bookings
            .filter(b => {
                if (b.status && b.status !== 'CONFIRMED') return false;
                if (!b.startTime) return false;
                const slotTime = b.startTime.substring(0, 5);
                return slotTime > currentTime;
            })
            .sort((a, b) => {
                const timeA = a.startTime || '';
                const timeB = b.startTime || '';
                return timeA.localeCompare(timeB);
            })
            .slice(0, 5)
            .map(b => ({
                id: b.id,
                time: b.startTime?.substring(0, 5) || '--:--',
                customerName: b.customer?.fullName || 'Khách hàng',
                licensePlate: b.vehicle?.licensePlate || 'N/A',
                typeName: b.vehicle?.typeName || 'Loại xe',
                brand: b.vehicle?.brand || '',
            }));
    }, [bookings]);

    // ─────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────

    return (
        <div className="staff-dashboard"> {/* dùng chung class với StaffDashboard để thừa kế CSS */}

            {/* ── BỘ LỌC THỜI GIAN ── */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4} style={{ margin: 0 }}>Tổng quan</Title>
                <Segmented
                    options={PERIOD_OPTIONS}
                    value={period}
                    onChange={setPeriod}
                />
            </div>

            <Row gutter={[24, 24]}>

                {/* ── CỘT TRÁI (70%) ── */}
                <Col xs={24} lg={17}>

                    {/* KPI CARDS */}
                    {loadingTodayBookings ? (
                        <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
                    ) : (
                        <Row gutter={[16, 16]} className="dashboard__stats-row">
                            <Col xs={12} sm={6}>
                                <Card className="stat-card">
                                    <Statistic
                                        title={`Doanh thu ${PERIOD_LABEL[period]}`}
                                        value={stats.revenue}
                                        formatter={(v) => formatCurrency(v)}
                                        prefix={<DollarCircleOutlined className="stat-icon text-gold" />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card className="stat-card">
                                    <Statistic
                                        title={`Lịch hẹn ${PERIOD_LABEL[period]}`}
                                        value={stats.todayAppointments}
                                        prefix={<CalendarOutlined className="stat-icon text-orange" />}
                                    />
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {stats.completed} hoàn thành · {stats.pending} chờ
                                    </Text>
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card className="stat-card">
                                    <Statistic
                                        title="Khách mới tháng này"
                                        value={kpi?.newCustomersMonth ?? '—'}
                                        prefix={<UserAddOutlined className="stat-icon text-blue" />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card className="stat-card">
                                    <Statistic
                                        title="Đã hoàn thành"
                                        value={stats.completed}
                                        prefix={<CheckCircleOutlined className="stat-icon text-green" />}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    )}

                    {/* CHARTS */}
                    <>
                        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                            <Col xs={24} lg={15}>
                                <Card size="small" title={`Doanh thu ${PERIOD_LABEL[period]}`}>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={revenueWeek}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                                            <Tooltip formatter={(v) => formatCurrency(v)} />
                                            <Line type="monotone" dataKey="revenue" stroke="#378ADD" strokeWidth={2} dot={{ r: 3, fill: '#378ADD' }} activeDot={{ r: 5 }} name="Doanh thu" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Col>
                            <Col xs={24} lg={9}>
                                <Card size="small" title="Tỉ lệ dịch vụ" style={{ height: '100%' }}>
                                    <ResponsiveContainer width="100%" height={155}>
                                        <PieChart>
                                            <Pie data={servicesData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                                                {servicesData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                            </Pie>
                                            <Tooltip formatter={(v) => `${v}%`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
                                        {servicesData.map((s) => (
                                            <span key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'rgba(0,0,0,0.6)' }}>
                                                <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                                                {s.name} {s.value}%
                                            </span>
                                        ))}
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        <Card size="small" title={`Khung giờ cao điểm — ${PERIOD_LABEL[period]}`} style={{ marginTop: 16 }}>
                            <ResponsiveContainer width="100%" height={130}>
                                <BarChart data={peakHours} barSize={22}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" name="Lượt xe" fill="#B5D4F4" stroke="#378ADD" strokeWidth={1} radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </>

                    {/* BAY STATUS — READ ONLY (Admin chỉ giám sát, không thao tác) */}
                    <Card style={{ marginTop: 16 }} title={<Title level={4}>Tình trạng Khoang (Bays)</Title>} className="dashboard__bays-card">
                        {loadingBays ? (
                            <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
                        ) : (
                            <Row gutter={[16, 16]}>
                                {bays.map(bay => {
                                    const session = getCurrentSession(bay);
                                    const displayStatus = getBayDisplayStatus(bay);
                                    const isOccupied = displayStatus === 'OCCUPIED' || displayStatus === 'COMPLETED';

                                    return (
                                        <Col xs={24} sm={12} md={8} key={bay.id}>
                                            <div className={`bay-card bay-card--${displayStatus.toLowerCase()} ${displayStatus === 'COMPLETED' ? 'bay-card--completed' : ''}`}>
                                                <div className="bay-card__header">
                                                    <span className="bay-card__name">{bay.name}</span>
                                                    <Badge
                                                        status={getBayStatusColor(displayStatus)}
                                                        text={getBayStatusText(displayStatus)}
                                                    />
                                                </div>
                                                <div className="bay-card__content">
                                                    {isOccupied && session ? (
                                                        <div className="bay-card__occupied-info">
                                                            <div className="bay-card__plate">
                                                                {session.vehicle?.licensePlate || 'N/A'}
                                                            </div>
                                                            <div className="bay-card__details">
                                                                <Text strong>
                                                                    <CarOutlined style={{ marginRight: 4 }} />
                                                                    {`${session.vehicle?.brand || ''} ${session.vehicle?.model || ''}`.trim() || 'N/A'}
                                                                </Text>
                                                                <br />
                                                                <Text type="secondary" style={{ fontSize: '13px' }}>
                                                                    <UserOutlined style={{ marginRight: 4 }} />
                                                                    {session.customer?.fullName || 'N/A'}
                                                                </Text>
                                                            </div>
                                                            <div className="bay-card__service-tag">
                                                                {(session.services && session.services.length > 0) ? (
                                                                    <>
                                                                        {session.services.slice(0, 2).map((service, index) => (
                                                                            <Tag color="blue" key={index} style={{ margin: '2px' }}>
                                                                                {service}
                                                                            </Tag>
                                                                        ))}
                                                                        {session.services.length > 2 && (
                                                                            <AntTooltip title={session.services.slice(2).join(', ')}>
                                                                                <Tag color="default" style={{ margin: '2px', cursor: 'pointer' }}>
                                                                                    +{session.services.length - 2}
                                                                                </Tag>
                                                                            </AntTooltip>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <Tag color="blue" style={{ margin: '2px' }}>Dịch vụ</Tag>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="bay-card__empty-info">
                                                            {displayStatus === 'AVAILABLE'
                                                                ? 'Sẵn sàng nhận xe'
                                                                : displayStatus === 'MAINTENANCE'
                                                                    ? 'Đang tạm ngưng sửa chữa'
                                                                    : 'Không hoạt động'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Col>
                                    );
                                })}
                            </Row>
                        )}
                    </Card>

                    {/* TABLES */}
                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col xs={24} lg={14}>
                            <Card
                                title={<Title level={4}>Lịch hẹn sắp tới</Title>}
                                className="dashboard__timeline-card"
                            >
                                {loadingUpcomingBookings ? (
                                    <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>
                                ) : upcoming.length > 0 ? (
                                    <Timeline
                                        items={upcoming.map(item => ({
                                            color: 'blue',
                                            children: (
                                                <div className="timeline-item-content" key={item.id}>
                                                    <Text strong>{item.time}</Text> - <Text strong>{item.customerName}</Text> - <Text strong>{item.brand}</Text>
                                                    <br />
                                                    <Text type="secondary">
                                                        {item.typeName}<Divider type="vertical" />{item.licensePlate}
                                                    </Text>
                                                </div>
                                            )
                                        }))}
                                    />
                                ) : (
                                    <Text type="secondary">Không có lịch hẹn sắp tới</Text>
                                )}
                            </Card>
                        </Col>
                        <Col xs={24} lg={10}>
                            <Card size="small" title="Giao dịch gần đây">
                                <Table
                                    dataSource={transactions}
                                    columns={transactionColumns}
                                    rowKey="id"
                                    pagination={false}
                                    size="small"
                                />
                            </Card>
                        </Col>
                    </Row>
                </Col>

                {/* ── CỘT PHẢI (30%) ── */}
                <Col xs={24} lg={7}>
                    <Card
                        title={<><BellOutlined style={{ marginRight: 6 }} />Thông báo</>}
                        className="dashboard__notifications-card"
                    >
                        <Space direction="vertical" style={{ width: '100%' }} size={8}>
                            {alerts.map((a) => (
                                <Alert
                                    key={a.id}
                                    type={a.type}
                                    icon={ALERT_ICON[a.type] || <BellOutlined />}
                                    showIcon
                                    message={<Text style={{ fontSize: 12, fontWeight: 500 }}>{a.title}</Text>}
                                    description={<Text type="secondary" style={{ fontSize: 11 }}>{a.desc}</Text>}
                                    style={{ padding: '6px 10px' }}
                                />
                            ))}
                        </Space>
                    </Card>
                </Col>

            </Row>
        </div>
    );
}