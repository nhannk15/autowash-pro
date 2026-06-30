import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import {
    Row, Col, Card, Statistic, Table, DatePicker, Segmented,
    Tag, Badge, Alert, Typography, Space, Spin, Timeline, Divider,
    Tooltip as AntTooltip,
} from 'antd';
import {
    DollarCircleOutlined, CalendarOutlined, UserAddOutlined, CarOutlined,
    UnorderedListOutlined, CrownOutlined, WarningOutlined, BellOutlined,
    CheckCircleOutlined, UserOutlined, FallOutlined,
    ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
    getAllBays, getUpcomingBookings, getTodayBookings,
} from '../../../service/staffService';
import {
    getDashboardSummary, getServiceDistribution, getRevenueChart,
    getPeakHours, getRecentTransactions,
    getDeductionChart, getPromotionPerformance, getDeductionSummary,
} from '../../../service/adminService';
import './AdminDashboard.css';

const { Title, Text } = Typography;

// ─── Helpers ───────────────────────────────────────────
const getCurrentSession = (bay) => bay.currentSession ?? null;

const getBookingRevenue = (record) => {
    if (record.washSessionStatus !== 'PAID') return 0;
    return (record.bookingDetails || []).reduce((sum, d) => sum + Number(d.finalPrice || 0), 0);
};

const getBayDisplayStatus = (bay) => {
    const session = getCurrentSession(bay);
    if (session?.status === 'IN_PROGRESS') return 'OCCUPIED';
    if (session?.status === 'COMPLETED' || session?.status === 'COMPLETE') return 'COMPLETED';
    if (bay.status === 'MAINTENANCE') return 'MAINTENANCE';
    if (bay.status === 'INACTIVE') return 'INACTIVE';
    return 'AVAILABLE';
};

const getBayStatusColor = (s) => ({ COMPLETED: 'success', AVAILABLE: 'success', OCCUPIED: 'processing', MAINTENANCE: 'error', INACTIVE: 'default' }[s] ?? 'default');
const getBayStatusText = (s) => ({ COMPLETED: 'Hoàn thành', AVAILABLE: 'Trống', OCCUPIED: 'Đang phục vụ', MAINTENANCE: 'Bảo trì', INACTIVE: 'Không hoạt động' }[s] ?? '');

const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const ALERT_ICON = { info: <CrownOutlined />, warning: <BellOutlined />, error: <WarningOutlined /> };

// ─── Transaction table columns ──────────────────────────
const transactionColumns = [
    {
        title: 'Thời gian',
        dataIndex: 'createdAt',
        width: 90,
        render: (v) => {
            if (!v) return '—';
            const d = new Date(v);
            return (
                <div>
                    <span className="admin-txn-date">
                        {`${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`}
                    </span>
                    <br />
                    <span className="admin-txn-time">
                        {`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`}
                    </span>
                </div>
            );
        },
    },
    {
        title: 'Khách',
        dataIndex: 'customer',
        render: (v) => <span className="admin-txn-customer">{v || '—'}</span>,
    },
    {
        title: 'Số tiền',
        dataIndex: 'totalAmount',
        align: 'right',
        render: (v) => <span className="admin-txn-amount">{formatCurrency(v)}</span>,
    },
];

// ─── Main Component ─────────────────────────────────────
export default function AdminDashboard() {
    const [bays, setBays] = useState([]);
    const [todayBookings, setTodayBookings] = useState([]);
    const [bookings, setBookings] = useState([]);

    const [dashboardData, setDashboardData] = useState([]);
    const [revenueWeek, setRevenueWeek] = useState([]);
    const [servicesData, setServicesData] = useState([]);
    const [peakHours, setPeakHours] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [alerts, setAlerts] = useState([]);

    // ── Doanh thu khấu trừ states ──
    const [deductionChart, setDeductionChart] = useState([]);
    const [promotionPerformance, setPromotionPerformance] = useState([]);
    const [deductionSummary, setDeductionSummary] = useState(null);

    const [filterMode, setFilterMode] = useState('range');
    const [dateRange, setDateRange] = useState([dayjs(), dayjs()]);
    const [monthYear, setMonthYear] = useState(dayjs());
    const [year, setYear] = useState(dayjs());

    const [loadingBays, setLoadingBays] = useState(true);
    const [loadingTodayBookings, setLoadingTodayBookings] = useState(true);
    const [loadingUpcomingBookings, setLoadingUpcomingBookings] = useState(true);

    const apiParams = useMemo(() => {
        if (filterMode === 'range') return { startDate: dateRange[0].format('YYYY-MM-DD'), endDate: dateRange[1].format('YYYY-MM-DD') };
        if (filterMode === 'month') return { month: monthYear.format('MMMM').toUpperCase(), year: monthYear.year() };
        if (filterMode === 'year') return { year: year.year() };
        return {};
    }, [filterMode, dateRange, monthYear, year]);

    const apiParamsKey = JSON.stringify(apiParams);

    const filterLabel = useMemo(() => {
        if (filterMode === 'all') return 'Tất cả';
        if (filterMode === 'range') return `${dateRange[0].format('DD/MM/YYYY')} – ${dateRange[1].format('DD/MM/YYYY')}`;
        if (filterMode === 'month') return monthYear.format('MM/YYYY');
        if (filterMode === 'year') return `Năm ${year.year()}`;
        return '';
    }, [filterMode, dateRange, monthYear, year]);

    // Fetches
    useEffect(() => {
        getAllBays().then(setBays).catch(console.error).finally(() => setLoadingBays(false));
    }, []);

    useEffect(() => {
        getTodayBookings().then(setTodayBookings).catch(console.error).finally(() => setLoadingTodayBookings(false));
    }, []);

    useEffect(() => {
        getUpcomingBookings().then(setBookings).catch(console.error).finally(() => setLoadingUpcomingBookings(false));
    }, []);

    useEffect(() => {
        getDashboardSummary(apiParams).then(setDashboardData).catch(console.error);
    }, [apiParamsKey]);

    useEffect(() => {
        getServiceDistribution(apiParams).then((data) => {
            const COLORS = ['#378ADD', '#1D9E75', '#7F77DD', '#EF9F27', '#E05C5C', '#52c41a', '#fa8c16'];
            const total = data.reduce((s, d) => s + d.totalUsages, 0);
            setServicesData(data.map((d, i) => ({
                name: d.serviceName,
                value: total > 0 ? Math.round((d.totalUsages / total) * 100) : 0,
                color: COLORS[i % COLORS.length],
            })));
        }).catch(console.error);
    }, [apiParamsKey]);

    useEffect(() => { getRevenueChart(apiParams).then(setRevenueWeek).catch(console.error); }, [apiParamsKey]);
    useEffect(() => { getPeakHours(apiParams).then(setPeakHours).catch(console.error); }, [apiParamsKey]);
    useEffect(() => {
        getRecentTransactions().then((data) => {
            setTransactions([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }).catch(console.error);
    }, []);

    // ── Fetch dữ liệu khấu trừ (reactive theo filter) ──
    useEffect(() => { getDeductionChart(apiParams).then(setDeductionChart).catch(console.error); }, [apiParamsKey]);
    useEffect(() => { getPromotionPerformance(apiParams).then(setPromotionPerformance).catch(console.error); }, [apiParamsKey]);
    useEffect(() => { getDeductionSummary(apiParams).then(setDeductionSummary).catch(console.error); }, [apiParamsKey]);

    // Tính breakdown cho PieChart từ dữ liệu summary (màu do FE quản lý)
    const deductionBreakdown = useMemo(() => {
        if (!deductionSummary) return [];
        const { totalFinalRevenue = 0, totalPromotionDiscount = 0, totalVoucherDiscount = 0 } = deductionSummary;
        if (totalFinalRevenue === 0 && totalPromotionDiscount === 0 && totalVoucherDiscount === 0) return [];
        return [
            { name: 'Doanh thu thực', value: totalFinalRevenue, color: '#378ADD' },
            { name: 'Khấu trừ KM', value: totalPromotionDiscount, color: '#fa8c16' },
            { name: 'Khấu trừ Voucher', value: totalVoucherDiscount, color: '#7F77DD' },
        ].filter(item => item.value > 0);
    }, [deductionSummary]);

    // Computed stats
    const stats = useMemo(() => {
        const completed = todayBookings.filter(b => b.washSessionStatus === 'PAID').length;
        const todayAppointments = todayBookings.length;
        const revenue = todayBookings.reduce((t, b) => t + getBookingRevenue(b), 0);
        return { completed, todayAppointments, revenue };
    }, [bays, todayBookings]);

    // Upcoming bookings
    const upcoming = useMemo(() => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        return bookings
            .filter(b => b.status !== 'CONFIRMED' ? false : b.startTime && b.startTime.substring(0, 5) > currentTime)
            .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
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

    // ─── Render ─────────────────────────────────────────
    return (
        <div className="admin-dashboard">

            {/* ── Bộ lọc thời gian ── */}
            <div className="admin-dashboard__filter-bar">
                <div className="admin-dashboard__filter-left">
                    <Title level={4} className="admin-dashboard__title">Tổng quan</Title>
                    <Text className="admin-dashboard__filter-label">
                        Dữ liệu: <Text strong>{filterLabel}</Text>
                    </Text>
                </div>

                <div className="admin-dashboard__filter-right">
                    <Segmented
                        options={[
                            { label: <><UnorderedListOutlined style={{ marginRight: 4 }} />Tất cả</>, value: 'all' },
                            { label: <><CalendarOutlined style={{ marginRight: 4 }} />Khoảng ngày</>, value: 'range' },
                            { label: 'Tháng', value: 'month' },
                            { label: 'Năm', value: 'year' },
                        ]}
                        value={filterMode}
                        onChange={setFilterMode}
                    />
                    <div className="admin-dashboard__filter-picker">
                        {filterMode === 'range' && (
                            <DatePicker.RangePicker
                                value={dateRange}
                                onChange={(d) => d && setDateRange(d)}
                                format="DD/MM/YYYY"
                                allowClear={false}
                            />
                        )}
                        {filterMode === 'month' && (
                            <DatePicker
                                picker="month"
                                value={monthYear}
                                onChange={(d) => d && setMonthYear(d)}
                                format="MM/YYYY"
                                allowClear={false}
                            />
                        )}
                        {filterMode === 'year' && (
                            <DatePicker
                                picker="year"
                                value={year}
                                onChange={(d) => d && setYear(d)}
                                format="YYYY"
                                allowClear={false}
                            />
                        )}
                    </div>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                {/* ── Cột trái (70%) ── */}
                <Col xs={24} lg={17}>

                    {/* KPI Cards – 5 cột */}
                    {loadingTodayBookings ? (
                        <div className="admin-dashboard__loading-center"><Spin size="large" /></div>
                    ) : (
                        <Row gutter={[16, 16]} className="dashboard__stats-row">
                            <Col xs={12} sm={8} lg={5}>
                                <Card className="stat-card">
                                    <Statistic
                                        title="Doanh thu"
                                        value={dashboardData?.totalRevenue ?? 0}
                                        formatter={(v) => formatCurrency(v)}
                                        prefix={<DollarCircleOutlined className="stat-icon text-gold" />}
                                    />
                                    {(() => {
                                        const current = dashboardData?.totalRevenue ?? 0;
                                        const previous = dashboardData?.previousRevenue ?? 0;
                                        if (previous === 0 && current === 0) return null;
                                        if (previous === 0) return (
                                            <div className="stat-card__trend stat-card__trend--up">
                                                <ArrowUpOutlined /> Mới
                                            </div>
                                        );
                                        const pct = ((current - previous) / previous * 100).toFixed(1);
                                        const isUp = current >= previous;
                                        return (
                                            <div className={`stat-card__trend stat-card__trend--${isUp ? 'up' : 'down'}`}>
                                                {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                                                {' '}{isUp ? '+' : ''}{pct}% so với kỳ trước
                                            </div>
                                        );
                                    })()}
                                </Card>
                            </Col>
                            <Col xs={12} sm={8} lg={5}>
                                <Card className="stat-card">
                                    <Statistic
                                        title="Tổng khấu trừ"
                                        value={deductionSummary?.totalDiscount ?? 0}
                                        formatter={(v) => formatCurrency(v)}
                                        prefix={<FallOutlined className="stat-icon text-red" />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={8} lg={5}>
                                <Card className="stat-card">
                                    <Statistic
                                        title="Lịch hẹn"
                                        value={dashboardData?.totalBookings ?? 0}
                                        prefix={<CalendarOutlined className="stat-icon text-orange" />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={8} lg={5}>
                                <Card className="stat-card">
                                    <Statistic
                                        title="Khách mới"
                                        value={dashboardData?.newCustomers ?? 0}
                                        prefix={<UserAddOutlined className="stat-icon text-blue" />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={8} lg={4}>
                                <Card className="stat-card">
                                    <Statistic
                                        title="Đã hoàn thành"
                                        value={dashboardData?.completedBookings ?? 0}
                                        prefix={<CheckCircleOutlined className="stat-icon text-green" />}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    )}

                    {/* Charts */}
                    <Row gutter={[16, 16]} className="admin-dashboard__charts-row">
                        <Col xs={24} lg={15}>
                            <Card size="small" title={`Doanh thu - ${filterLabel}`} className="admin-dashboard__chart-card">
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={revenueWeek}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                        <XAxis dataKey="day" tick={{ fontSize: 11 }} tickFormatter={(v) => { const p = v.split('-'); return `${p[2]}/${p[1]}`; }} />
                                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                                        <Tooltip formatter={(v) => formatCurrency(v)} />
                                        <Line type="monotone" dataKey="revenue" stroke="#378ADD" strokeWidth={2} dot={{ r: 3, fill: '#378ADD' }} activeDot={{ r: 5 }} name="Doanh thu" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>
                        <Col xs={24} lg={9}>
                            <Card size="small" title={`Tỉ lệ dịch vụ - ${filterLabel}`} className="admin-dashboard__chart-card admin-dashboard__chart-card--full-height">
                                <ResponsiveContainer width="100%" height={155}>
                                    <PieChart>
                                        <Pie data={servicesData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                                            {servicesData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip formatter={(v) => `${v}%`} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="admin-dashboard__pie-legend">
                                    {servicesData.map((s) => (
                                        <span key={s.name} className="admin-dashboard__pie-legend-item">
                                            <span className="admin-dashboard__pie-dot" style={{ background: s.color }} />
                                            {s.name} {s.value}%
                                        </span>
                                    ))}
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {/* Peak hours */}
                    <Card size="small" title={`Khung giờ cao điểm - ${filterLabel}`} className="admin-dashboard__chart-card admin-dashboard__peak-card">
                        <ResponsiveContainer width="100%" height={130}>
                            <BarChart data={peakHours} barSize={22}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                <XAxis dataKey="hourOfDay" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" name="Lượt xe" fill="#B5D4F4" stroke="#378ADD" strokeWidth={1} radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    {/* ── BIỂU ĐỒ DOANH THU KHẤU TRỪ ── */}

                    {/* Stacked BarChart: Doanh thu thực vs Khấu trừ */}
                    <Card size="small" title={`Doanh thu & Khấu trừ - ${filterLabel}`} className="admin-dashboard__chart-card admin-dashboard__deduction-chart">
                        {deductionChart.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={deductionChart} barSize={20}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                    <XAxis
                                        dataKey="day"
                                        tick={{ fontSize: 11 }}
                                        tickFormatter={(v) => { const p = v.split('-'); return `${p[2]}/${p[1]}`; }}
                                    />
                                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                                    <Tooltip formatter={(v) => formatCurrency(v)} />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Bar dataKey="finalRevenue" stackId="revenue" name="Doanh thu thực" fill="#378ADD" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="promotionDiscount" stackId="revenue" name="KM khấu trừ" fill="#fa8c16" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="voucherDiscount" stackId="revenue" name="Voucher khấu trừ" fill="#7F77DD" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="admin-dashboard__empty-chart">
                                <Text type="secondary">Chưa có dữ liệu khấu trừ</Text>
                            </div>
                        )}
                    </Card>

                    {/* Row: Top Khuyến mãi + Cơ cấu khấu trừ */}
                    <Row gutter={[16, 16]} className="admin-dashboard__deduction-row">
                        {/* Horizontal BarChart – Top khuyến mãi hiệu quả */}
                        <Col xs={24} lg={14}>
                            <Card size="small" title={`Top khuyến mãi hiệu quả - ${filterLabel}`} className="admin-dashboard__chart-card admin-dashboard__chart-card--full-height">
                                {promotionPerformance.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={Math.max(180, promotionPerformance.length * 40)}>
                                        <BarChart data={promotionPerformance} layout="vertical" barSize={16} margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                                            <YAxis
                                                dataKey="promotionName"
                                                type="category"
                                                tick={{ fontSize: 11 }}
                                                width={120}
                                            />
                                            <Tooltip
                                                formatter={(v, name) => {
                                                    if (name === 'Tổng khấu trừ') return formatCurrency(v);
                                                    return v;
                                                }}
                                                labelFormatter={(label) => label}
                                            />
                                            <Bar dataKey="totalDiscountAmount" name="Tổng khấu trừ" fill="#E05C5C" radius={[0, 4, 4, 0]}>
                                                {promotionPerformance.map((entry, i) => (
                                                    <Cell key={i} fill={['#E05C5C', '#fa8c16', '#7F77DD', '#1D9E75', '#378ADD', '#52c41a', '#faad14'][i % 7]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="admin-dashboard__empty-chart">
                                        <Text type="secondary">Chưa có dữ liệu khuyến mãi</Text>
                                    </div>
                                )}
                            </Card>
                        </Col>

                        {/* Donut PieChart – Cơ cấu doanh thu & khấu trừ */}
                        <Col xs={24} lg={10}>
                            <Card size="small" title={`Cơ cấu doanh thu - ${filterLabel}`} className="admin-dashboard__chart-card admin-dashboard__chart-card--full-height">
                                {deductionBreakdown.length > 0 ? (
                                    <>
                                        <ResponsiveContainer width="100%" height={160}>
                                            <PieChart>
                                                <Pie
                                                    data={deductionBreakdown}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={45}
                                                    outerRadius={70}
                                                    dataKey="value"
                                                    paddingAngle={2}
                                                >
                                                    {deductionBreakdown.map((entry, i) => (
                                                        <Cell key={i} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(v) => formatCurrency(v)} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="admin-dashboard__pie-legend">
                                            {deductionBreakdown.map((item) => (
                                                <span key={item.name} className="admin-dashboard__pie-legend-item">
                                                    <span className="admin-dashboard__pie-dot" style={{ background: item.color }} />
                                                    {item.name}: {formatCurrency(item.value)}
                                                </span>
                                            ))}
                                        </div>
                                        {deductionSummary?.discountRate != null && (
                                            <div className="admin-dashboard__discount-rate">
                                                Tỷ lệ khấu trừ: <Text strong className="admin-dashboard__discount-rate-value">{deductionSummary.discountRate.toFixed(1)}%</Text>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="admin-dashboard__empty-chart">
                                        <Text type="secondary">Chưa có dữ liệu</Text>
                                    </div>
                                )}
                            </Card>
                        </Col>
                    </Row>

                    {/* Bay status */}
                    <Card
                        title={<Title level={4} className="admin-dashboard__section-title">Tình trạng Khoang (Bays)</Title>}
                        className="dashboard__bays-card admin-dashboard__bays-card"
                    >
                        {loadingBays ? (
                            <div className="admin-dashboard__loading-center"><Spin size="large" /></div>
                        ) : (
                            <Row gutter={[16, 16]}>
                                {bays.map((bay) => {
                                    const session = getCurrentSession(bay);
                                    const displayStatus = getBayDisplayStatus(bay);
                                    const isOccupied = displayStatus === 'OCCUPIED' || displayStatus === 'COMPLETED';

                                    return (
                                        <Col xs={24} sm={12} md={8} key={bay.id}>
                                            <div className={`bay-card bay-card--${displayStatus.toLowerCase()}${displayStatus === 'COMPLETED' ? ' bay-card--completed' : ''} admin-bay-card`}>
                                                <div className="bay-card__header">
                                                    <span className="bay-card__name">{bay.name}</span>
                                                    <Badge status={getBayStatusColor(displayStatus)} text={getBayStatusText(displayStatus)} />
                                                </div>
                                                <div className="bay-card__content">
                                                    {isOccupied && session ? (
                                                        <div className="bay-card__occupied-info">
                                                            <div className="bay-card__plate">{session.vehicle?.licensePlate || 'N/A'}</div>
                                                            <div className="bay-card__details">
                                                                <Text strong>
                                                                    <CarOutlined style={{ marginRight: 4 }} />
                                                                    {`${session.vehicle?.brand || ''} ${session.vehicle?.model || ''}`.trim() || 'N/A'}
                                                                </Text>
                                                                <br />
                                                                <Text type="secondary" style={{ fontSize: 13 }}>
                                                                    <UserOutlined style={{ marginRight: 4 }} />
                                                                    {session.customer?.fullName || 'N/A'}
                                                                </Text>
                                                            </div>
                                                            <div className="bay-card__service-tag">
                                                                {(session.services?.length > 0) ? (
                                                                    <>
                                                                        {session.services.slice(0, 2).map((s, i) => (
                                                                            <Tag color="blue" key={i} style={{ margin: 2 }}>{s}</Tag>
                                                                        ))}
                                                                        {session.services.length > 2 && (
                                                                            <AntTooltip title={session.services.slice(2).join(', ')}>
                                                                                <Tag color="default" style={{ margin: 2, cursor: 'pointer' }}>+{session.services.length - 2}</Tag>
                                                                            </AntTooltip>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <Tag color="blue" style={{ margin: 2 }}>Dịch vụ</Tag>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="bay-card__empty-info">
                                                            {displayStatus === 'AVAILABLE' ? 'Sẵn sàng nhận xe'
                                                                : displayStatus === 'MAINTENANCE' ? 'Đang tạm ngưng sửa chữa'
                                                                    : 'Không hoạt động'}
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Admin view: no action buttons */}
                                            </div>
                                        </Col>
                                    );
                                })}
                            </Row>
                        )}
                    </Card>

                    {/* Upcoming timeline */}
                    <Card
                        title={<Title level={4} className="admin-dashboard__section-title">Lịch hẹn sắp tới</Title>}
                        className="dashboard__timeline-card admin-dashboard__timeline-card"
                    >
                        {loadingUpcomingBookings ? (
                            <div className="admin-dashboard__loading-center"><Spin /></div>
                        ) : upcoming.length > 0 ? (
                            <Timeline
                                items={upcoming.map((item) => ({
                                    color: 'blue',
                                    children: (
                                        <div className="timeline-item-content" key={item.id}>
                                            <Text strong>{item.time}</Text> — <Text strong>{item.customerName}</Text> — <Text strong>{item.brand}</Text>
                                            <br />
                                            <Text type="secondary">
                                                {item.typeName}<Divider type="vertical" />{item.licensePlate}
                                            </Text>
                                        </div>
                                    ),
                                }))}
                            />
                        ) : (
                            <Text type="secondary">Không có lịch hẹn sắp tới</Text>
                        )}
                    </Card>
                </Col>

                {/* ── Cột phải (30%) ── */}
                <Col xs={24} lg={7}>
                    {/* Notifications */}
                    <Card
                        title={<><BellOutlined className="admin-dashboard__bell-icon" />Thông báo</>}
                        className="dashboard__notifications-card admin-dashboard__notifications-card"
                        bodyStyle={{ maxHeight: 320, overflowY: 'auto', padding: 12 }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }} size={8}>
                            {alerts.map((a) => (
                                <Alert
                                    key={a.id}
                                    type={a.type}
                                    icon={ALERT_ICON[a.type] || <BellOutlined />}
                                    showIcon
                                    message={<span className="admin-alert-title">{a.title}</span>}
                                    description={<span className="admin-alert-desc">{a.desc}</span>}
                                    className="admin-dashboard__alert-item"
                                />
                            ))}
                        </Space>
                    </Card>

                    {/* Recent transactions */}
                    <Card
                        size="small"
                        title="Giao dịch gần đây"
                        className="admin-dashboard__transactions-card"
                        bodyStyle={{ maxHeight: 280, overflowY: 'auto', padding: 0 }}
                    >
                        <Table
                            dataSource={transactions}
                            columns={transactionColumns}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            className="admin-txn-table"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}