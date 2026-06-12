import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Row, Col, Card, Statistic, Button,
    Timeline, Tag, Typography, Badge, message
} from 'antd';
import {
    CarOutlined, DollarCircleOutlined, CheckCircleOutlined, ScanOutlined,
    CalendarOutlined, UserAddOutlined, ArrowRightOutlined, BellOutlined, UserOutlined,
    CreditCardOutlined
} from '@ant-design/icons';
import './StaffDashboard.css';

const { Title, Text } = Typography;

export default function StaffDashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    // Mock data
    const [stats, setStats] = useState({
        activeCars: 3,
        todayAppointments: 12,
        completed: 8,
        revenue: 2500000
    });

    // Mock data Bays - Thêm serviceStatus và billData
    const [bays, setBays] = useState([
        {
            id: 1, name: 'Khoang 1', status: 'OCCUPIED', serviceStatus: 'IN_PROGRESS',
            carPlate: '51G-123.45', carName: 'Mazda CX-5', ownerName: 'Nguyễn Văn A',
            service: 'Rửa VIP',
            billData: {
                id: 'INV-2026-0612-001',
                customer: { name: 'Nguyễn Văn A', phone: '0901234567', email: 'nguyenvana@gmail.com', licensePlate: '51G-123.45', vehicleModel: 'Mazda CX-5' },
                services: [{ id: 's1', name: 'Rửa VIP', price: 150000 }],
                promotions: [],
                bay: 'Khoang 1',
                checkinTime: '13:00 - 12/06/2026',
                staffNote: ''
            }
        },
        {
            id: 2, name: 'Khoang 2', status: 'AVAILABLE', serviceStatus: null,
            carPlate: null, carName: null, ownerName: null, service: null, billData: null
        },
        {
            id: 3, name: 'Khoang 3', status: 'OCCUPIED', serviceStatus: 'COMPLETED',
            carPlate: '30A-999.99', carName: 'Toyota Camry', ownerName: 'Trần Thị B',
            service: 'Dọn nội thất',
            billData: {
                id: 'INV-2026-0612-002',
                customer: { name: 'Trần Thị B', phone: '0919999999', email: 'tranthib@gmail.com', licensePlate: '30A-999.99', vehicleModel: 'Toyota Camry' },
                services: [{ id: 's2', name: 'Dọn nội thất', price: 350000 }],
                promotions: [{ id: 'p1', name: 'Khách hàng thân thiết', discount: 35000 }],
                bay: 'Khoang 3',
                checkinTime: '11:30 - 12/06/2026',
                staffNote: 'Khách yêu cầu lau kỹ taplo'
            }
        },
        {
            id: 4, name: 'Khoang 4', status: 'AVAILABLE', serviceStatus: null,
            carPlate: null, carName: null, ownerName: null, service: null, billData: null
        },
        {
            id: 5, name: 'Khoang 5', status: 'OCCUPIED', serviceStatus: 'IN_PROGRESS',
            carPlate: '51H-111.22', carName: 'Honda CR-V', ownerName: 'Lê Văn C',
            service: 'Rửa bọt tuyết',
            billData: {
                id: 'INV-2026-0612-003',
                customer: { name: 'Lê Văn C', phone: '0931112233', email: 'levanc@gmail.com', licensePlate: '51H-111.22', vehicleModel: 'Honda CR-V' },
                services: [{ id: 's3', name: 'Rửa bọt tuyết', price: 80000 }, { id: 's4', name: 'Hút bụi nội thất', price: 50000 }],
                promotions: [],
                bay: 'Khoang 5',
                checkinTime: '12:45 - 12/06/2026',
                staffNote: ''
            }
        },
        {
            id: 6, name: 'Khoang 6', status: 'MAINTENANCE', serviceStatus: null,
            carPlate: null, carName: null, ownerName: null, service: null, billData: null
        }
    ]);

    // Xử lý khi quay lại từ Payment (bay đã thanh toán xong)
    const processedRef = useRef(false);
    useEffect(() => {
        if (location.state?.paidBayId && !processedRef.current) {
            processedRef.current = true;
            setBays(prev => prev.map(bay =>
                bay.id === location.state.paidBayId
                    ? { ...bay, status: 'AVAILABLE', serviceStatus: null, carPlate: null, carName: null, ownerName: null, service: null, billData: null }
                    : bay
            ));
            setStats(prev => ({
                ...prev,
                activeCars: prev.activeCars - 1,
                completed: prev.completed + 1
            }));
            message.success('Khoang đã được giải phóng và sẵn sàng phục vụ!');
            // Xóa state để tránh re-trigger khi refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const [upcoming] = useState([
        { id: 1, time: '14:30', name: 'Anh Tuấn', service: 'Rửa bọt tuyết', plate: '51F-555.55' },
        { id: 2, time: '15:00', name: 'Chị Mai', service: 'Đánh bóng', plate: '60A-111.22' },
        { id: 3, time: '16:00', name: 'Anh Hùng', service: 'Rửa VIP', plate: '61A-333.44' },
    ]);

    const [notifications] = useState([
        { id: 1, message: 'Xe 51G-123.45 sắp hoàn thành', type: 'info', time: '5 phút trước' },
        { id: 2, message: 'Khoang 6 cần bảo trì vòi áp lực', type: 'warning', time: '1 tiếng trước' },
    ]);

    // Format tiền VNĐ
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const getBayStatusColor = (status, serviceStatus) => {
        if (status === 'OCCUPIED' && serviceStatus === 'COMPLETED') return 'success';
        switch (status) {
            case 'AVAILABLE': return 'success';
            case 'OCCUPIED': return 'processing';
            case 'MAINTENANCE': return 'error';
            default: return 'default';
        }
    };

    const getBayStatusText = (status, serviceStatus) => {
        if (status === 'OCCUPIED' && serviceStatus === 'COMPLETED') return 'Hoàn thành';
        switch (status) {
            case 'AVAILABLE': return 'Trống';
            case 'OCCUPIED': return 'Đang phục vụ';
            case 'MAINTENANCE': return 'Bảo trì';
            default: return '';
        }
    };

    // Hoàn thành dịch vụ
    const handleCompleteService = (bayId) => {
        setBays(prev => prev.map(bay =>
            bay.id === bayId ? { ...bay, serviceStatus: 'COMPLETED' } : bay
        ));
        message.success('Đã đánh dấu hoàn thành dịch vụ!');
    };

    // Chuyển sang trang thanh toán
    const handleGoToPayment = (bay) => {
        navigate('/staff/payment', {
            state: {
                bayId: bay.id,
                billData: bay.billData
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
                        <Row gutter={[16, 16]}>
                            {bays.map(bay => (
                                <Col xs={24} sm={12} md={8} key={bay.id}>
                                    <div className={`bay-card bay-card--${bay.status.toLowerCase()} ${bay.serviceStatus === 'COMPLETED' ? 'bay-card--completed' : ''}`}>
                                        <div className="bay-card__header">
                                            <span className="bay-card__name">{bay.name}</span>
                                            <Badge
                                                status={getBayStatusColor(bay.status, bay.serviceStatus)}
                                                text={getBayStatusText(bay.status, bay.serviceStatus)}
                                            />
                                        </div>
                                        {/* Card Content */}
                                        <div className="bay-card__content">
                                            {bay.status === 'OCCUPIED' ? (
                                                <div className="bay-card__occupied-info">
                                                    <div className="bay-card__plate">{bay.carPlate}</div>
                                                    <div className="bay-card__details">
                                                        <Text strong><CarOutlined style={{ marginRight: 4 }} /> {bay.carName}</Text>
                                                        <br />
                                                        <Text type="secondary" style={{ fontSize: '13px' }}><UserOutlined style={{ marginRight: 4 }} /> {bay.ownerName}</Text>
                                                    </div>
                                                    <div className="bay-card__service-tag">
                                                        <Tag color="blue">{bay.service}</Tag>
                                                    </div>
                                                    {/* Nút hành động thay cho progress bar */}
                                                    <div className="bay-card__actions">
                                                        {bay.serviceStatus === 'IN_PROGRESS' ? (
                                                            <Button
                                                                type="primary"
                                                                block
                                                                size="small"
                                                                className="bay-card__complete-btn"
                                                                onClick={() => handleCompleteService(bay.id)}
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
                                                    {bay.status === 'AVAILABLE' ? 'Sẵn sàng nhận xe' : 'Đang tạm ngưng sửa chữa'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
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
                        <Timeline
                            items={upcoming.map(item => ({
                                color: 'blue',
                                content: (
                                    <div className="timeline-item-content" key={item.id}>
                                        <Text strong>{item.time}</Text> - <Text>{item.name}</Text>
                                        <br />
                                        <Text type="secondary">{item.service} | Xe: <Tag color="blue">{item.plate}</Tag></Text>
                                    </div>
                                )
                            }))}
                        />
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