import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Row, Col, Card, Statistic, Button,
    Timeline, Tag, Typography, Badge, message, Spin, Divider, Tooltip,
    Modal, Form, Input, Select,
} from 'antd';
import {
    CarOutlined, DollarCircleOutlined, CheckCircleOutlined, ScanOutlined,
    CalendarOutlined, UserAddOutlined, ArrowRightOutlined, BellOutlined,
    UserOutlined, CreditCardOutlined,
} from '@ant-design/icons';
import {
    getAllBays, getUpcomingBookings, getTodayBookings, completeSession,
    createWalkInCustomer, getVehicleTypes, getServices, getAvailableSlots,
    createBooking, confirmBooking,
} from '../../../service/staffService';
import './StaffDashboard.css';

const { Title, Text } = Typography;

const getCurrentSession = (bay) => bay.currentSession || null;

const getBookingRevenue = (record) => {
    if (record.washSessionStatus !== 'PAID') return 0;
    return (record.bookingDetails || []).reduce(
        (sum, d) => sum + Number(d.finalPrice || 0), 0
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

    const [isWalkInModalVisible, setIsWalkInModalVisible] = useState(false);
    const [submittingWalkIn, setSubmittingWalkIn] = useState(false);
    const [walkInForm] = Form.useForm();
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [servicesList, setServicesList] = useState([]);

    const fetchBays = useCallback(async () => {
        try {
            const data = await getAllBays();
            setBays(data);
        } catch (error) {
            console.error('Failed to fetch bays', error);
        } finally {
            setLoadingBays(false);
        }
    }, []);

    const fetchTodayBookings = useCallback(async () => {
        try {
            const data = await getTodayBookings();
            setTodayBookings(data);
        } catch (error) {
            console.error('Failed to fetch today bookings', error);
        } finally {
            setLoadingTodayBookings(false);
        }
    }, []);

    const fetchUpcomingBookings = useCallback(async () => {
        try {
            const data = await getUpcomingBookings();
            setBookings(data);
        } catch (error) {
            console.error('Failed to fetch upcoming bookings', error);
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

    const stats = useMemo(() => {
        const activeCars = bays.filter(bay => getCurrentSession(bay)?.status === 'IN_PROGRESS').length;
        const completed = todayBookings.filter(b => b.washSessionStatus === 'PAID' || b.washSessionStatus === 'COMPLETED').length;
        const todayAppointments = todayBookings.length;
        const revenue = todayBookings.reduce((total, b) => total + getBookingRevenue(b), 0);
        return { activeCars, todayAppointments, completed, revenue };
    }, [bays, todayBookings]);

    const upcoming = useMemo(() => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        return bookings
            .filter(b => {
                if (b.status && b.status !== 'CONFIRMED') return false;
                if (!b.startTime) return false;
                return b.startTime.substring(0, 5) > currentTime;
            })
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

    const [notifications] = useState([
        { id: 1, message: 'Hệ thống hoạt động bình thường', type: 'info', time: 'Vừa xong' },
    ]);

    // Xử lý khi quay lại từ Payment
    const processedRef = useRef(false);
    useEffect(() => {
        if (location.state?.paidBayId && !processedRef.current) {
            processedRef.current = true;
            setBays(prev => prev.map(bay =>
                bay.id === location.state.paidBayId
                    ? { ...bay, currentSession: null }
                    : bay
            ));
            if (location.state.paidBookingId) {
                setBookings(prev => prev.map(b =>
                    b.id === location.state.paidBookingId
                        ? {
                            ...b,
                            washSessions: b.washSessions?.map(ws =>
                                (ws.status === 'COMPLETED' || ws.status === 'COMPLETE')
                                    ? { ...ws, status: 'PAID' }
                                    : ws
                            ),
                        }
                        : b
                ));
            }
            message.success('Khoang đã được giải phóng và sẵn sàng phục vụ!');
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const formatCurrency = (value) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

    // === Bay helpers ===
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

    const getBayEmptyText = (displayStatus) => {
        if (displayStatus === 'AVAILABLE') return 'Sẵn sàng nhận xe';
        if (displayStatus === 'MAINTENANCE') return 'Đang tạm ngưng sửa chữa';
        return 'Không hoạt động';
    };

    // === Walk-in handlers ===
    const handleWalkinCustomer = async () => {
        setIsWalkInModalVisible(true);
        walkInForm.resetFields();
        if (vehicleTypes.length === 0) {
            try { setVehicleTypes(await getVehicleTypes()); } catch (err) { console.error(err); }
        }
        if (servicesList.length === 0) {
            try {
                const svcs = await getServices();
                setServicesList(svcs.data || []);
            } catch (err) { console.error(err); }
        }
    };

    const handleWalkInSubmit = async (values) => {
        try {
            setSubmittingWalkIn(true);

            const servicePriceIds = values.services.map(svcId => {
                const svc = servicesList.find(s => s.serviceId === svcId);
                const priceItem = svc?.servicePrices?.find(p => p.vehicleType.id === values.vehicleTypeId);
                return priceItem ? priceItem.servicePriceId : null;
            }).filter(id => id != null);

            if (servicePriceIds.length === 0) {
                message.error('Vui lòng chọn ít nhất 1 dịch vụ hợp lệ cho loại xe này!');
                setSubmittingWalkIn(false);
                return;
            }

            const customerRes = await createWalkInCustomer(
                values.fullName,
                values.phoneNumber,
                values.email || '',
                values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
                values.vehicleTypeId,
                values.licensePlate,
                values.brand || '',
                values.model || '',
                values.color || ''
            );

            const cData = customerRes.data || customerRes;
            const customerId = cData.customerId;
            const vehicleId = cData.vehicleId;

            const todayStr = new Date().toISOString().split('T')[0];
            const slotsRes = await getAvailableSlots(todayStr);
            const slotData = slotsRes.data || slotsRes;
            const availableSlots = (slotData.timeSlotAvailabilityResponses || []).filter(s => s.available || s.isAvailable);

            if (availableSlots.length === 0) {
                message.error('Hôm nay đã hết khung giờ trống! Đã tạo hồ sơ khách nhưng chưa thể check-in.');
                setIsWalkInModalVisible(false);
                setSubmittingWalkIn(false);
                return;
            }

            const bookingRes = await createBooking({
                customerId,
                vehicleId,
                timeSlotId: availableSlots[0].timeSlotId,
                bookingDate: todayStr,
                servicePriceIds,
                notes: 'Khách vãng lai',
            });
            const bData = bookingRes.data || bookingRes;
            const bookingId = bData.id;

            await confirmBooking(bookingId);

            message.success('Tạo khách vãng lai và check-in thành công!');
            setIsWalkInModalVisible(false);
            fetchBays();
            fetchTodayBookings();
            fetchUpcomingBookings();
        } catch (error) {
            console.error('Failed to process walk-in', error);
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tiếp nhận khách vãng lai!');
        } finally {
            setSubmittingWalkIn(false);
        }
    };

    const handleCompleteService = async (bookingId) => {
        try {
            await completeSession(bookingId);
            message.success('Đã đánh dấu hoàn thành dịch vụ!');
            setBookings(prev => prev.filter(b => b.id !== bookingId));
            setBays(prev => prev.map(bay => {
                const session = getCurrentSession(bay);
                if (session?.bookingId === bookingId) {
                    return { ...bay, currentSession: { ...bay.currentSession, status: 'COMPLETED' } };
                }
                return bay;
            }));
        } catch (error) {
            console.error('Failed to complete session', error);
            message.error('Lỗi khi hoàn thành dịch vụ!');
        }
    };

    const handleGoToPayment = (bay) => {
        const session = getCurrentSession(bay);
        navigate('/staff/payment', {
            state: { bayId: bay.id, bookingId: session?.bookingId },
        });
    };

    return (
        <div className="staff-dashboard">
            <Row gutter={[24, 24]}>
                {/* CỘT TRÁI (70%) */}
                <Col xs={24} lg={17}>
                    {/* THỐNG KÊ */}
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
                                    formatter={formatCurrency}
                                    prefix={<DollarCircleOutlined className="stat-icon text-gold" />}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* TÌNH TRẠNG KHOANG */}
                    <Card
                        title={<Title level={4} className="dashboard__bays-card-title">Tình trạng Khoang (Bays)</Title>}
                        className="dashboard__bays-card"
                    >
                        {loadingBays ? (
                            <div className="dashboard__bays-loading">
                                <Spin size="large" />
                            </div>
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
                                                                    <CarOutlined className="bay-card__vehicle-label" />
                                                                    {`${session.vehicle?.brand || ''} ${session.vehicle?.model || ''}`.trim() || 'N/A'}
                                                                </Text>
                                                                <br />
                                                                <Text type="secondary">
                                                                    <UserOutlined className="bay-card__customer-label" />
                                                                    {session.customer?.fullName || 'N/A'}
                                                                </Text>
                                                            </div>
                                                            <div className="bay-card__service-tag">
                                                                {session.services?.length > 0 ? (
                                                                    <>
                                                                        {session.services.slice(0, 2).map((service, index) => (
                                                                            <Tag color="blue" key={index} className="bay-card__tag">
                                                                                {service}
                                                                            </Tag>
                                                                        ))}
                                                                        {session.services.length > 2 && (
                                                                            <Tooltip title={session.services.slice(2).join(', ')}>
                                                                                <Tag color="default" className="bay-card__tag--more">
                                                                                    +{session.services.length - 2}
                                                                                </Tag>
                                                                            </Tooltip>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <Tag color="blue" className="bay-card__tag">Dịch vụ</Tag>
                                                                )}
                                                            </div>
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
                                                            {getBayEmptyText(displayStatus)}
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
                    <div className="dashboard__quick-actions">
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
                                    onClick={handleWalkinCustomer}
                                >
                                    Khách vãng lai
                                </Button>
                            </Col>
                        </Row>
                    </div>

                    {/* LỊCH TRÌNH SẮP TỚI */}
                    <Card
                        title={<Title level={4} className="dashboard__card-title">Lịch hẹn sắp tới</Title>}
                        extra={
                            <Button type="link" onClick={() => navigate('/staff/queue')} icon={<ArrowRightOutlined />}>
                                Xem hàng chờ
                            </Button>
                        }
                        className="dashboard__timeline-card"
                    >
                        {loadingUpcomingBookings ? (
                            <div className="dashboard__timeline-loading"><Spin /></div>
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
                                    ),
                                }))}
                            />
                        ) : (
                            <Text type="secondary">Không có lịch hẹn sắp tới</Text>
                        )}
                    </Card>

                    {/* THÔNG BÁO */}
                    <Card
                        title={<Title level={4} className="dashboard__card-title"><BellOutlined /> Thông báo</Title>}
                        className="dashboard__notifications-card"
                    >
                        <div className="notifications-list">
                            {notifications.map(item => (
                                <div key={item.id} className="notifications-list__item">
                                    <div className="notifications-list__message">
                                        <Text
                                            type={item.type === 'warning' ? 'danger' : 'default'}
                                            className="notifications-list__message-text"
                                        >
                                            {item.message}
                                        </Text>
                                    </div>
                                    <Text type="secondary" className="notifications-list__time">
                                        {item.time}
                                    </Text>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Modal Khách Vãng Lai */}
            <Modal
                title={<Title level={4} style={{ margin: 0 }}>Tiếp nhận Khách vãng lai</Title>}
                open={isWalkInModalVisible}
                onCancel={() => setIsWalkInModalVisible(false)}
                onOk={() => walkInForm.submit()}
                confirmLoading={submittingWalkIn}
                okText="Tạo & Check-in"
                cancelText="Hủy"
                width={700}
                centered
                maskClosable={false}
            >
                <div className="walkin-modal__body">
                    <Form form={walkInForm} layout="vertical" onFinish={handleWalkInSubmit}>
                        <Row gutter={24}>
                            <Col span={12}>
                                <Divider orientation="left" plain>Thông tin Khách hàng</Divider>
                                <Form.Item
                                    name="fullName"
                                    label="Họ tên"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập họ tên' },
                                        { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự' },
                                    ]}
                                >
                                    <Input placeholder="Ví dụ: Nguyễn Văn A" />
                                </Form.Item>
                                <Form.Item
                                    name="phoneNumber"
                                    label="Số điện thoại"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập số điện thoại' },
                                        { pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/, message: 'Số điện thoại không hợp lệ (Ví dụ: 0987654321)' },
                                    ]}
                                >
                                    <Input placeholder="Ví dụ: 0987654321" />
                                </Form.Item>
                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập email' },
                                        { type: 'email', message: 'Email không đúng định dạng' },
                                    ]}
                                >
                                    <Input placeholder="Ví dụ: email@example.com" />
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Divider orientation="left" plain>Thông tin Xe & Dịch vụ</Divider>
                                <Form.Item
                                    name="licensePlate"
                                    label="Biển số xe"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập biển số xe' },
                                        { min: 5, message: 'Biển số xe không hợp lệ' },
                                    ]}
                                >
                                    <Input placeholder="Ví dụ: 30A-123.45" />
                                </Form.Item>
                                <Form.Item
                                    name="vehicleTypeId"
                                    label="Loại xe"
                                    rules={[{ required: true, message: 'Vui lòng chọn loại xe' }]}
                                >
                                    <Select placeholder="Chọn loại xe">
                                        {vehicleTypes.map(vt => (
                                            <Select.Option key={vt.id} value={vt.id}>{vt.typeName}</Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    name="services"
                                    label="Dịch vụ yêu cầu"
                                    rules={[{ required: true, message: 'Vui lòng chọn dịch vụ' }]}
                                >
                                    <Select mode="multiple" placeholder="Chọn dịch vụ" optionFilterProp="children">
                                        {servicesList.map(svc => (
                                            <Select.Option key={svc.serviceId} value={svc.serviceId}>
                                                {svc.serviceName}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </div>
            </Modal>
        </div>
    );
}