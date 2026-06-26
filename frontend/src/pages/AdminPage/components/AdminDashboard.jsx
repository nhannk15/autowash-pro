import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import {
    Row, Col, Card, Statistic, Table, DatePicker, Segmented,
    Tag, Badge, Alert, Typography, Space, Spin, message, Timeline, Divider, Tooltip as AntTooltip,
} from 'antd';
import {
    DollarCircleOutlined, CalendarOutlined, UserAddOutlined, CarOutlined, UnorderedListOutlined,
    CrownOutlined, WarningOutlined, BellOutlined, CheckCircleOutlined, UserOutlined, ScheduleOutlined, CalendarFilled
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
import {
    getDashboardSummary, getServiceDistribution, getRevenueChart, getPeakHours, getRecentTransactions
} from '../../../service/adminService';

const { Title, Text } = Typography;

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
// TABLE COLUMNS
// ─────────────────────────────────────────────

const transactionColumns = [
    {
        title: 'Thời gian',
        dataIndex: 'createdAt',
        width: 90,
        render: (v) => {
            if (!v) return '—';
            const d = new Date(v);
            const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
            const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
            return (
                <div>
                    <Text type="secondary" style={{ fontSize: 11 }}>{date}</Text>
                    <br />
                    <Text style={{ fontSize: 12 }}>{time}</Text>
                </div>
            );
        },
    },
    {
        title: 'Khách',
        dataIndex: 'customer', // ← đổi từ ['customer', 'fullName'] thành 'customer'
        render: (v) => <Text>{v || '—'}</Text>,
    },
    {
        title: 'Số tiền',
        dataIndex: 'totalAmount',
        align: 'right',
        render: (v) => (
            <Text style={{ color: '#27500A', fontWeight: 500 }}>
                {formatCurrency(v)}
            </Text>
        ),
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

    const [dashboardData, setDashboardData] = useState([]);
    const [revenueWeek, setRevenueWeek] = useState([]);
    const [servicesData, setServicesData] = useState([]);
    const [peakHours, setPeakHours] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [alerts, setAlerts] = useState([]);

    // ── Period filter ──
    const [filterMode, setFilterMode] = useState('range');
    const [dateRange, setDateRange] = useState([dayjs(), dayjs()]);
    const [monthYear, setMonthYear] = useState(dayjs());
    const [year, setYear] = useState(dayjs());

    // ── Loading states ──
    const [loadingBays, setLoadingBays] = useState(true);
    const [loadingTodayBookings, setLoadingTodayBookings] = useState(true);
    const [loadingUpcomingBookings, setLoadingUpcomingBookings] = useState(true);

    const apiParams = useMemo(() => {
        if (filterMode === 'range') {
            return {
                startDate: dateRange[0].format('YYYY-MM-DD'),
                endDate: dateRange[1].format('YYYY-MM-DD'),
            };
        }
        if (filterMode === 'month') {
            return {
                month: monthYear.format('MMMM').toUpperCase(), // "JUNE"
                year: monthYear.year(),
            };
        }
        if (filterMode === 'year') return { year: year.year() };
        return {}; // 'all'
    }, [filterMode, dateRange, monthYear, year]);

    const apiParamsKey = JSON.stringify(apiParams);

    const filterLabel = useMemo(() => {
        if (filterMode === 'all') return 'Tất cả';
        if (filterMode === 'range') return `${dateRange[0].format('DD/MM/YYYY')} – ${dateRange[1].format('DD/MM/YYYY')}`;
        if (filterMode === 'month') return monthYear.format('MM/YYYY');
        if (filterMode === 'year') return `Năm ${year.year()}`;
        return '';
    }, [filterMode, dateRange, monthYear, year]);

    // ── Fetch Bays ──
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

    useEffect(() => {
        async function fetchDashboardSummary() {
            try {
                const data = await getDashboardSummary(apiParams);
                setDashboardData(data);
            } catch (error) {
                console.error("Failed to fetch dashboard summary", error);
            }
        }
        fetchDashboardSummary();
    }, [apiParamsKey]);

    useEffect(() => {
        async function fetchServiceDistribution() {
            try {
                const data = await getServiceDistribution(apiParams);
                const COLORS = ['#378ADD', '#1D9E75', '#7F77DD', '#EF9F27', '#E05C5C', '#52c41a', '#fa8c16'];
                const total = data.reduce((sum, d) => sum + d.totalUsages, 0);
                const mapped = data.map((d, i) => ({
                    name: d.serviceName,
                    value: total > 0 ? Math.round((d.totalUsages / total) * 100) : 0,
                    color: COLORS[i % COLORS.length],
                }));
                setServicesData(mapped);
            } catch (error) {
                console.error("Failed to fetch service distribution", error);
            }
        }
        fetchServiceDistribution();
    }, [apiParamsKey]);

    useEffect(() => {
        async function fetchRevenueChart() {
            try {
                const data = await getRevenueChart(apiParams);
                setRevenueWeek(data);
            } catch (error) {
                console.error("Failed to fetch revenue chart", error);
            }
        }
        fetchRevenueChart();
    }, [apiParamsKey]);

    useEffect(() => {
        async function fetchPeakHours() {
            try {
                const data = await getPeakHours(apiParams);
                setPeakHours(data);
            } catch (error) {
                console.error("Failed to fetch peak hours", error);
            }
        }
        fetchPeakHours();
    }, [apiParamsKey]);

    useEffect(() => {
        async function fetchTransactions() {
            try {
                const data = await getRecentTransactions();
                const sorted = [...data].sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setTransactions(sorted);
            } catch (error) {
                console.error("Failed to fetch transactions", error);
            }
        }
        fetchTransactions();
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
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 24,
                flexWrap: 'wrap',
                gap: 12,
            }}>
                {/* Góc trái */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Title level={4} style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>Tổng quan</Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                        Dữ liệu:{' '}
                        <Text strong style={{ fontSize: 13 }}>{filterLabel}</Text>
                    </Text>
                </div>

                {/* Góc phải */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <Segmented
                        options={[
                            { label: <><UnorderedListOutlined style={{ marginRight: 4 }} />Tất cả</>, value: 'all' },
                            { label: <><CalendarOutlined style={{ marginRight: 4 }} />Khoảng ngày</>, value: 'range' },
                            { label: <>Tháng</>, value: 'month' },
                            { label: <>Năm</>, value: 'year' },
                        ]}
                        value={filterMode}
                        onChange={setFilterMode}
                    />
                    <div style={{ minHeight: 32, display: 'flex', alignItems: 'center' }}>
                        {filterMode === 'range' && (
                            <DatePicker.RangePicker
                                value={dateRange}
                                onChange={(dates) => dates && setDateRange(dates)}
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
                                        title={`Doanh thu`}
                                        value={dashboardData?.totalRevenue ?? 0}
                                        formatter={(v) => formatCurrency(v)}
                                        prefix={<DollarCircleOutlined className="stat-icon text-gold" />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card className="stat-card">
                                    <Statistic
                                        title={`Lịch hẹn`}
                                        value={dashboardData?.totalBookings ?? 0}
                                        prefix={<CalendarOutlined className="stat-icon text-orange" />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card className="stat-card">
                                    <Statistic
                                        title={`Khách mới`}
                                        value={dashboardData?.newCustomers ?? 0}
                                        prefix={<UserAddOutlined className="stat-icon text-blue" />}
                                    />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
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

                    {/* CHARTS */}
                    <>
                        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                            <Col xs={24} lg={15}>
                                <Card size="small" title={`Doanh thu - ${filterLabel}`}>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={revenueWeek}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                            <XAxis dataKey="day" tick={{ fontSize: 11 }} tickFormatter={(v) => {
                                                const parts = v.split('-');
                                                return `${parts[2]}/${parts[1]}`;
                                            }} />
                                            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                                            <Tooltip formatter={(v) => formatCurrency(v)} />
                                            <Line type="monotone" dataKey="revenue" stroke="#378ADD" strokeWidth={2} dot={{ r: 3, fill: '#378ADD' }} activeDot={{ r: 5 }} name="Doanh thu" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Card>
                            </Col>
                            <Col xs={24} lg={9}>
                                <Card size="small" title={`Tỉ lệ dịch vụ - ${filterLabel}`} style={{ height: '100%' }}>
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

                        <Card size="small" title={`Khung giờ cao điểm - ${filterLabel}`} style={{ marginTop: 16 }}>
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

                {/* ── CỘT PHẢI (30%) ── */}
                <Col xs={24} lg={7}>
                    <Card
                        title={<><BellOutlined style={{ marginRight: 6 }} />Thông báo</>}
                        className="dashboard__notifications-card"
                        bodyStyle={{ maxHeight: 320, overflowY: 'auto', padding: '12px' }}
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

                    <Card size="small" title="Giao dịch gần đây" style={{ marginTop: 20 }} bodyStyle={{ maxHeight: 280, overflowY: 'auto', padding: '0' }}>
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
        </div>
    );
}