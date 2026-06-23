import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Row, Col, Card, Statistic, Button,
    Timeline, Tag, Typography, Badge, message, Spin, Divider
} from 'antd';
import {
    CarOutlined, DollarCircleOutlined, CheckCircleOutlined, ScanOutlined,
    CalendarOutlined, UserAddOutlined, ArrowRightOutlined, BellOutlined, UserOutlined,
    CreditCardOutlined
} from '@ant-design/icons';
import { getAllBays, getUpcomingBookings, getTodayBookings, completeSession } from '../../../service/staffService';
import './StaffDashboard.css';

const { Title, Text } = Typography;

// Helper: tìm session hiện tại (IN_PROGRESS hoặc COMPLETED) trên 1 bay
const getCurrentSession = (bay) => {
    if (!bay.currentSession) return null;
    // Ưu tiên IN_PROGRESS trước
    return bay.currentSession;
};

const getBookingRevenue = (record) => {
    if (record.washSessionStatus !== 'PAID') return 0;
    return (record.bookingDetails || []).reduce(
        (sum, d) => sum + Number(d.finalPrice || 0),
        0
    );
};

export default function StaffDashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    const [bays, setBays] = useState([]);
    const [todayBookings, setTodayBookings] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loadingBays, setLoadingBays] = useState(true);
    const [loadingTodayBookings, setLoadingTodayBookings] = useState(true);
    const [loadingUpcomingBookings, setLoadingUpcomingBookings] = useState(true);

    const fetchBays = useCallback(async () => {
        try {
            const data = await getAllBays();
            setBays(data);
        } catch (error) {
            console.error("Failed to fetch bays", error);
        } finally {
            setLoadingBays(false);
        }
    }, []);

    const fetchTodayBookings = useCallback(async () => {
        try {
            const data = await getTodayBookings();
            setTodayBookings(data);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoadingTodayBookings(false);
        }
    }, []);

    const fetchUpcomingBookings = useCallback(async () => {
        try {
            const data = await getUpcomingBookings();
            setBookings(data);
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        } finally {
            setLoadingUpcomingBookings(false);
        }
    }, []);

    useEffect(() => {
        fetchBays();
        fetchTodayBookings();
        fetchUpcomingBookings();

        const interval = setInterval(() => {
            fetchBays();
            fetchTodayBookings();
            fetchUpcomingBookings();
        }, 5000);

        return () => clearInterval(interval);
    }, [fetchBays, fetchTodayBookings, fetchUpcomingBookings]);

    // === Tính stats tự động từ data đã fetch ===
    const stats = useMemo(() => {
        const activeCars = bays.filter(bay => getCurrentSession(bay)?.status === 'IN_PROGRESS').length;
        const completed = todayBookings.filter(booking => booking.washSessionStatus === 'PAID').length;
        const todayAppointments = todayBookings.length;
        // Doanh thu: tính sau khi có billing data, tạm để 0
        const revenue = todayBookings.reduce((total, booking) => total + getBookingRevenue(booking), 0);
        return { activeCars, todayAppointments, completed, revenue };
    }, [bays, todayBookings]);

    // === Lịch hẹn sắp tới: filter từ upcoming bookings ===
    const upcoming = useMemo(() => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        return bookings
            .filter(b => {
                // Chỉ lấy booking CONFIRMED (nếu API có trả về trường status)
                if (b.status && b.status !== 'CONFIRMED') return false;

                // Lấy time slot trực tiếp từ booking
                if (!b.startTime) return false;

                // So sánh startTime với thời gian hiện tại
                const slotTime = b.startTime.substring(0, 5); // "HH:mm"
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

    // Thông báo (mock - tính sau)
    const [notifications] = useState([
        { id: 1, message: 'Hệ thống hoạt động bình thường', type: 'info', time: 'Vừa xong' },
    ]);

    // Xử lý khi quay lại từ Payment (bay đã thanh toán xong)
    const processedRef = useRef(false);
    useEffect(() => {
        if (location.state?.paidBayId && !processedRef.current) {
            processedRef.current = true;
            // Xóa session khỏi bay để giải phóng khoang
            setBays(prev => prev.map(bay => {
                if (bay.id === location.state.paidBayId) {
                    return { ...bay, currentSession: null };
                }
                return bay;
            }));

            // Nếu có paidBookingId thì giả lập chuyển washSession đó thành PAID
            if (location.state.paidBookingId) {
                setBookings(prev => prev.map(b => {
                    if (b.id === location.state.paidBookingId) {
                        return {
                            ...b,
                            washSessions: b.washSessions?.map(ws =>
                                (ws.status === 'COMPLETED' || ws.status === 'COMPLETE')
                                    ? { ...ws, status: 'PAID' }
                                    : ws
                            )
                        };
                    }
                    return b;
                }));
            }

            message.success('Khoang đã được giải phóng và sẵn sàng phục vụ!');
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    // Format tiền VNĐ
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // === Bay card helpers ===
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

    // Hoàn thành dịch vụ
    const handleCompleteService = async (bookingId) => {
        try {
            await completeSession(bookingId);
            message.success('Đã đánh dấu hoàn thành dịch vụ!');

            // Xoá booking này khỏi danh sách "Lịch hẹn sắp tới"
            setBookings(prev => prev.filter(b => b.id !== bookingId));

            // Cập nhật lại bays state
            setBays(prev => prev.map(bay => {
                const session = getCurrentSession(bay);
                if (session?.bookingId === bookingId) {
                    return {
                        ...bay,
                        currentSession: {
                            ...bay.currentSession,
                            status: 'COMPLETED'
                        }
                    };
                }
                return bay;
            }));
        } catch (error) {
            console.error("Failed to complete session", error);
            message.error('Lỗi khi hoàn thành dịch vụ!');
        }
    };

    // Chuyển sang trang thanh toán
    const handleGoToPayment = (bay) => {
        const session = getCurrentSession(bay);
        navigate('/staff/payment', {
            state: {
                bayId: bay.id,
                bookingId: session?.bookingId,
            }
        });
    };

    return (
        <div className="staff-dashboard">
            <Row gutter={[24, 24]}>
                {/* CỘT TRÁI (70%) */}
                <Col xs={24} lg={17}>
                    {/* KHU VỰC THỐNG KÊ */}
                    <Row gutter={[16, 16]} className="dashboard__stats-row">
                        <Col xs={12} sm={6}>
                            <Card className="stat-card">
                                <Statistic
                                    title="Lịch hẹn hôm nay"
                                    value={stats.todayAppointments}
                                    prefix={<CalendarOutlined className="stat-icon text-orange" />}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Card className="stat-card">
                                <Statistic
                                    title="Đang xử lý"
                                    value={stats.activeCars}
                                    prefix={<CarOutlined className="stat-icon text-blue" />}
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
                        <Col xs={12} sm={6}>
                            <Card className="stat-card">
                                <Statistic
                                    title="Doanh thu"
                                    value={stats.revenue}
                                    formatter={value => formatCurrency(value)}
                                    prefix={<DollarCircleOutlined className="stat-icon text-gold" />}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* TÌNH TRẠNG KHOANG (BAYS) */}
                    <Card title={<Title level={4} style={{ margin: 0 }}>Tình trạng Khoang (Bays)</Title>} className="dashboard__bays-card">
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
                                                {/* Card Content */}
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
                                                                    session.services.map((service, index) => (
                                                                        <Tag color="blue" key={index} style={{ margin: 0 }}>
                                                                            {service}
                                                                        </Tag>
                                                                    ))
                                                                ) : (
                                                                    <Tag color="blue" style={{ margin: 0 }}>Dịch vụ</Tag>
                                                                )}
                                                            </div>
                                                            {/* Nút hành động */}
                                                            <div className="bay-card__actions">
                                                                {displayStatus === 'OCCUPIED' ? (
                                                                    <Button
                                                                        type="primary"
                                                                        block
                                                                        size="small"
                                                                        className="bay-card__complete-btn"
                                                                        onClick={() => handleCompleteService(session.bookingId)}
                                                                    >
                                                                        <CheckCircleOutlined /> Hoàn thành dịch vụ
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        type="primary"
                                                                        block
                                                                        size="small"
                                                                        className="bay-card__payment-btn"
                                                                        onClick={() => handleGoToPayment(bay)}
                                                                    >
                                                                        <CreditCardOutlined /> Thanh toán
                                                                    </Button>
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
                </Col>

                {/* CỘT PHẢI (30%) */}
                <Col xs={24} lg={7}>
                    {/* THAO TÁC NHANH */}
                    <div style={{ marginBottom: 24 }}>
                        <Row gutter={12}>
                            <Col span={12}>
                                <Button
                                    type="primary"
                                    icon={<ScanOutlined />}
                                    className="action-btn action-btn--checkin"
                                    onClick={() => navigate('/staff/checkin')}
                                    block
                                >
                                    Check-in
                                </Button>
                            </Col>
                            <Col span={12}>
                                <Button
                                    icon={<UserAddOutlined />}
                                    className="action-btn action-btn--walkin"
                                    block
                                >
                                    Khách vãng lai
                                </Button>
                            </Col>
                        </Row>
                    </div>

                    {/* LỊCH TRÌNH SẮP TỚI */}
                    <Card
                        title={<Title level={4} style={{ margin: 0 }}>Lịch hẹn sắp tới</Title>}
                        extra={<Button type="link" onClick={() => navigate('/staff/queue')} icon={<ArrowRightOutlined />}>Xem hàng chờ</Button>}
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
                                                {item.typeName}<Divider vertical />{item.licensePlate}
                                            </Text>
                                        </div>
                                    )
                                }))}
                            />
                        ) : (
                            <Text type="secondary">Không có lịch hẹn sắp tới</Text>
                        )}
                    </Card>

                    {/* THÔNG BÁO */}
                    <Card
                        title={<Title level={4} style={{ margin: 0 }}><BellOutlined /> Thông báo</Title>}
                        className="dashboard__notifications-card"
                    >
                        <div className="notifications-list">
                            {notifications.map(item => (
                                <div key={item.id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <div style={{ marginBottom: 4 }}>
                                        <Text type={item.type === 'warning' ? 'danger' : 'default'} style={{ fontSize: '13px', fontWeight: 500 }}>
                                            {item.message}
                                        </Text>
                                    </div>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>{item.time}</Text>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}