import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Row, Col, Card, Statistic, Button,
    Timeline, Tag, Typography, Badge
} from 'antd';
import {
    CarOutlined, DollarCircleOutlined, CheckCircleOutlined, CarryOutOutlined,
    CalendarOutlined, UserAddOutlined, ArrowRightOutlined, BellOutlined, UserOutlined
} from '@ant-design/icons';
import './StaffDashboard.css';

const { Title, Text } = Typography;

export default function StaffDashboard() {
    const navigate = useNavigate();

    // Mock data
    const [stats] = useState({
        activeCars: 3,
        todayAppointments: 12,
        completed: 8,
        revenue: 2500000
    });

    // Mock data Bays - Đã thêm tên xe, tên chủ xe
    const [bays] = useState([
        { id: 1, name: 'Khoang 1', status: 'OCCUPIED', carPlate: '51G-123.45', carName: 'Mazda CX-5', ownerName: 'Nguyễn Văn A', service: 'Rửa VIP', progress: 33 }, // 15/45 phút
        { id: 2, name: 'Khoang 2', status: 'AVAILABLE', carPlate: null, carName: null, ownerName: null, service: null, progress: 0 },
        { id: 3, name: 'Khoang 3', status: 'OCCUPIED', carPlate: '30A-999.99', carName: 'Toyota Camry', ownerName: 'Trần Thị B', service: 'Dọn nội thất', progress: 75 },
        { id: 4, name: 'Khoang 4', status: 'AVAILABLE', carPlate: null, carName: null, ownerName: null, service: null, progress: 0 },
        { id: 5, name: 'Khoang 5', status: 'OCCUPIED', carPlate: '51H-111.22', carName: 'Honda CR-V', ownerName: 'Lê Văn C', service: 'Rửa bọt tuyết', progress: 10 },
        { id: 6, name: 'Khoang 6', status: 'MAINTENANCE', carPlate: null, carName: null, ownerName: null, service: null, progress: 0 }
    ]);

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

    const getBayStatusColor = (status) => {
        switch (status) {
            case 'AVAILABLE': return 'success';
            case 'OCCUPIED': return 'processing';
            case 'MAINTENANCE': return 'error';
            default: return 'default';
        }
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
                                    <div className={`bay-card bay-card--${bay.status.toLowerCase()}`}>
                                        <div className="bay-card__header">
                                            <span className="bay-card__name">{bay.name}</span>
                                            <Badge status={getBayStatusColor(bay.status)} text={
                                                bay.status === 'AVAILABLE' ? 'Trống' :
                                                    bay.status === 'OCCUPIED' ? 'Đang phục vụ' : 'Bảo trì'
                                            } />
                                        </div>
                                        {/* Card Content luôn có độ cao cố định */}
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
                                                    <div className="bay-card__progress">
                                                        <div className="progress-bar" style={{ width: `${bay.progress}%` }}></div>
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
                    {/* THAO TÁC NHANH (Không có Card bao quanh) */}
                    <div style={{ marginBottom: 24 }}>
                        <Row gutter={12}>
                            <Col span={12}>
                                <Button
                                    type="primary"
                                    icon={<CarryOutOutlined />}
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