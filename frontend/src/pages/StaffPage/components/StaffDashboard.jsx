import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Row, Col, Card, Statistic, Button,
    Timeline, Tag, Typography, Badge, message, Spin
} from 'antd';
import {
    CarOutlined, DollarCircleOutlined, CheckCircleOutlined, ScanOutlined,
    CalendarOutlined, UserAddOutlined, ArrowRightOutlined, BellOutlined, UserOutlined,
    CreditCardOutlined
} from '@ant-design/icons';
import { getAllBays, getAllBookings, completeSession } from '../../../service/staffService';
import './StaffDashboard.css';

const { Title, Text } = Typography;

// Helper: tìm session hiện tại (IN_PROGRESS hoặc COMPLETED) trên 1 bay
const getCurrentSession = (bay) => {
    if (!bay.washSessions?.length) return null;
    // Ưu tiên IN_PROGRESS trước
    return bay.washSessions.find(s => s.status === 'IN_PROGRESS')
        || bay.washSessions.find(s => s.status === 'COMPLETED' || s.status === 'COMPLETE');
};

export default function StaffDashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    const [bays, setBays] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loadingBays, setLoadingBays] = useState(true);
    const [loadingBookings, setLoadingBookings] = useState(true);

    // Fetch bays
    useEffect(() => {
        async function fetchBays() {
            try {
                const response = await getAllBays();
                // Xử lý cả trường hợp ApiResponse wrapper hoặc trả mảng trực tiếp
                const data = Array.isArray(response) ? response : (response?.data || []);
                setBays(data);
            } catch (error) {
                console.error("Failed to fetch bays", error);
            } finally {
                setLoadingBays(false);
            }
        }
        fetchBays();
    }, []);

    // Fetch bookings
    useEffect(() => {
        async function fetchBookings() {
            try {
                const response = await getAllBookings();
                const data = Array.isArray(response) ? response : (response?.data || []);
                setBookings(data);
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            } finally {
                setLoadingBookings(false);
            }
        }
        fetchBookings();
    }, []);

    // === Tính stats tự động từ data đã fetch ===
    const stats = useMemo(() => {
        const activeCars = bays.filter(bay => getCurrentSession(bay)?.status === 'IN_PROGRESS').length;
        const completed = bays.filter(bay => {
            const s = getCurrentSession(bay);
            return s?.status === 'COMPLETED' || s?.status === 'COMPLETE';
        }).length;
        const todayAppointments = bookings.length;
        // Doanh thu: tính sau khi có billing data, tạm để 0
        return { activeCars, todayAppointments, completed, revenue: 0 };
    }, [bays, bookings]);

    // === Lịch hẹn sắp tới: filter từ bookings ===
    const upcoming = useMemo(() => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        return bookings
            .filter(b => {
                // Chỉ lấy booking CONFIRMED
                if (b.status !== 'CONFIRMED') return false;
                // Lấy time slot
                const slot = b.availableSlots?.[0];
                if (!slot?.timeSlot?.startTime) return false;
                // So sánh startTime với thời gian hiện tại
                const slotTime = slot.timeSlot.startTime.substring(0, 5); // "HH:mm"
                return slotTime > currentTime;
            })
            .sort((a, b) => {
                const timeA = a.availableSlots?.[0]?.timeSlot?.startTime || '';
                const timeB = b.availableSlots?.[0]?.timeSlot?.startTime || '';
                return timeA.localeCompare(timeB);
            })
            .slice(0, 5)
            .map(b => ({
                id: b.id,
                time: b.availableSlots?.[0]?.timeSlot?.startTime?.substring(0, 5) || '--:--',
                plate: b.vehicle?.licensePlate || 'N/A',
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
            // Refetch bays sau khi thanh toán
            async function refetch() {
                try {
                    const response = await getAllBays();
                    const data = Array.isArray(response) ? response : (response?.data || []);
                    setBays(data);
                } catch (error) {
                    console.error("Failed to refetch bays", error);
                }
            }
            refetch();
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
    const handleCompleteService = async (sessionId) => {
        try {
            await completeSession(sessionId);
            message.success('Đã đánh dấu hoàn thành dịch vụ!');
            // Cập nhật lại bays state
            setBays(prev => prev.map(bay => {
                const session = getCurrentSession(bay);
                if (session?.id === sessionId) {
                    return {
                        ...bay,
                        washSessions: bay.washSessions.map(s =>
                            s.id === sessionId ? { ...s, status: 'COMPLETED' } : s
                        )
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
                sessionId: session?.id,
                bookingId: session?.booking?.id,
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
                                                                <Tag color="blue">
                                                                    {session.servicePrice?.service?.name || 'Dịch vụ'}
                                                                </Tag>
                                                            </div>
                                                            {/* Nút hành động */}
                                                            <div className="bay-card__actions">
                                                                {displayStatus === 'OCCUPIED' ? (
                                                                    <Button
                                                                        type="primary"
                                                                        block
                                                                        size="small"
                                                                        className="bay-card__complete-btn"
                                                                        onClick={() => handleCompleteService(session.id)}
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
                        {loadingBookings ? (
                            <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>
                        ) : upcoming.length > 0 ? (
                            <Timeline
                                items={upcoming.map(item => ({
                                    color: 'blue',
                                    children: (
                                        <div className="timeline-item-content" key={item.id}>
                                            <Text strong>{item.time}</Text> - <Text>{item.brand}</Text>
                                            <br />
                                            <Text type="secondary">
                                                Xe: <Tag color="blue">{item.plate}</Tag>
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