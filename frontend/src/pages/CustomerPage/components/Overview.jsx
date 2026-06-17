import { useState } from 'react';
import { Row, Col, Card, Table, Tag, Progress, Button, Empty, Space, Typography, Badge } from 'antd';
import { CalendarOutlined, TrophyOutlined, CrownOutlined, ArrowRightOutlined, GiftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Overview.css';

const { Title, Text } = Typography;

export default function Overview() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // 1. Mockup Danh sách Lịch đặt sắp tới (Có thể có nhiều lịch đặt)
    const [upcomingBookings] = useState([
        {
            bookingId: 101,
            serviceName: "Rửa xe ngoại thất cao cấp",
            bookingDate: "2026-06-20",
            startTime: "09:00",
            licensePlate: "30F-123.45",
            status: "CONFIRMED"
        },
        {
            bookingId: 102,
            serviceName: "Vệ sinh khoang máy chuyên sâu",
            bookingDate: "2026-06-25",
            startTime: "14:00",
            licensePlate: "30F-123.45",
            status: "CONFIRMED"
        },
        {
            bookingId: 103,
            serviceName: "Khử mùi và diệt khuẩn cabin",
            bookingDate: "2026-07-02",
            startTime: "10:30",
            licensePlate: "30F-123.45",
            status: "CONFIRMED"
        }
    ]);

    // Lịch đặt gần nhất (sắp diễn ra đầu tiên)
    const nearestBooking = upcomingBookings.length > 0 ? upcomingBookings[0] : null;
    // Số lượng lịch đặt khác
    const otherBookingsCount = upcomingBookings.length > 1 ? upcomingBookings.length - 1 : 0;

    // 2. Mockup điểm tích lũy & hạng thành viên
    const points = 450;
    const nextTierPoints = 500;
    const percentToNextTier = Math.min(Math.round((points / nextTierPoints) * 100), 100);

    // 3. Mockup Bảng hoạt động gần đây
    const mockActivities = [
        {
            key: '1',
            serviceName: 'Rửa xe ngoại thất cao cấp',
            date: '15/06/2026 14:30',
            points: 50,
            status: 'COMPLETED' // COMPLETED, CANCELLED, PROCESSING
        },
        {
            key: '2',
            serviceName: 'Vệ sinh nội thất chuyên sâu',
            date: '10/06/2026 09:00',
            points: 120,
            status: 'COMPLETED'
        },
        {
            key: '3',
            serviceName: 'Khử mùi và diệt khuẩn cabin',
            date: '01/06/2026 16:15',
            points: 30,
            status: 'COMPLETED'
        },
        {
            key: '4',
            serviceName: 'Phủ Ceramic bảo vệ sơn',
            date: '25/05/2026 10:30',
            points: 0,
            status: 'CANCELLED'
        }
    ];

    // Định nghĩa các cột cho Bảng hoạt động gần đây
    const columns = [
        {
            title: 'DỊCH VỤ',
            dataIndex: 'serviceName',
            key: 'serviceName',
            render: (text) => <Text strong style={{ color: '#2d3748' }}>{text}</Text>,
        },
        {
            title: 'NGÀY',
            dataIndex: 'date',
            key: 'date',
            render: (text) => <Text type="secondary">{text}</Text>,
        },
        {
            title: 'ĐIỂM CỘNG',
            dataIndex: 'points',
            key: 'points',
            render: (pts) => (
                <Text strong style={{ color: pts > 0 ? '#52c41a' : '#8c8c8c' }}>
                    {pts > 0 ? `+${pts}` : '0'}
                </Text>
            ),
        },
        {
            title: 'TRẠNG THÁI',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                let text = 'Chờ xử lý';

                if (status === 'COMPLETED') {
                    color = 'success';
                    text = 'Hoàn thành';
                } else if (status === 'CANCELLED') {
                    color = 'error';
                    text = 'Đã hủy';
                } else if (status === 'PROCESSING') {
                    color = 'processing';
                    text = 'Đang xử lý';
                }

                return <Tag color={color} className="status-tag">{text}</Tag>;
            },
        },
    ];

    return (
        <div className="overview-container">
            {/* Tiêu đề chào mừng */}
            <div className="welcome-banner">
                <Title level={2} className="welcome-title">Xin chào, {user?.fullname || 'Khách hàng'} 👋</Title>
                <Text type="secondary" className="welcome-subtitle">Chào mừng bạn quay trở lại. Hãy quản lý lịch đặt và xe của bạn tại đây.</Text>
            </div>

            {/* Hàng 1: Thẻ tóm tắt thông tin */}
            <Row gutter={[24, 24]} className="summary-row">
                {/* Cột 1: Lịch đặt sắp tới */}
                <Col xs={24} md={8}>
                    <Card className="dashboard-card upcoming-card" hoverable>
                        <Space className="card-header">
                            <CalendarOutlined className="card-icon icon-blue" />
                            <Text className="card-title">LỊCH ĐẶT SẮP TỚI</Text>
                        </Space>
                        <div className="card-body">
                            {nearestBooking ? (
                                <div className="booking-info">
                                    <div className="booking-service">{nearestBooking.serviceName}</div>
                                    <div className="booking-detail">
                                        📅 {nearestBooking.bookingDate} | 🕒 {nearestBooking.startTime}
                                    </div>
                                    <div className="booking-car">
                                        🚗 Biển số: <strong>{nearestBooking.licensePlate}</strong>
                                    </div>
                                    {otherBookingsCount > 0 && (
                                        <div className="other-bookings-alert">
                                            <Badge status="processing" text={`Bạn có thêm ${otherBookingsCount} lịch đặt khác`} />
                                        </div>
                                    )}
                                    <Button 
                                        type="primary" 
                                        icon={<ArrowRightOutlined />} 
                                        className="action-btn"
                                        onClick={() => navigate('/ca-nhan/dat-lich')}
                                    >
                                        Xem tất cả ({upcomingBookings.length})
                                    </Button>
                                </div>
                            ) : (
                                <Empty 
                                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                    description="Bạn không có lịch đặt sắp tới"
                                    className="compact-empty"
                                >
                                    <Button type="primary" onClick={() => navigate('/ca-nhan/dat-lich')}>
                                        Đặt lịch ngay
                                    </Button>
                                </Empty>
                            )}
                        </div>
                    </Card>
                </Col>

                {/* Cột 2: Điểm tích lũy */}
                <Col xs={24} md={8}>
                    <Card className="dashboard-card points-card" hoverable>
                        <Space className="card-header">
                            <TrophyOutlined className="card-icon icon-gold" />
                            <Text className="card-title">ĐIỂM TÍCH LŨY</Text>
                        </Space>
                        <div className="card-body">
                            <div className="points-display">
                                <span className="points-number">{points}</span>
                                <span className="points-unit">điểm</span>
                            </div>
                            <div className="progress-section">
                                <div className="progress-text">
                                    <span>Tiến trình lên Hạng Vàng</span>
                                    <span>{points}/{nextTierPoints}</span>
                                </div>
                                <Progress 
                                    percent={percentToNextTier} 
                                    strokeColor="#faad14"
                                    trailColor="#f0f0f0"
                                    showInfo={false}
                                />
                                <div className="progress-tip">Còn {nextTierPoints - points} điểm để thăng hạng</div>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Cột 3: Hạng thành viên */}
                <Col xs={24} md={8}>
                    <Card className="dashboard-card tier-card" hoverable>
                        <Space className="card-header">
                            <CrownOutlined className="card-icon icon-silver" />
                            <Text className="card-title">HẠNG THÀNH VIÊN</Text>
                        </Space>
                        <div className="card-body">
                            <div className="tier-display">
                                <div className="tier-badge silver">BẠC</div>
                            </div>
                            <ul className="tier-benefits">
                                <li>✨ Giảm 5% cho tất cả các hóa đơn dịch vụ.</li>
                                <li>✨ Nhận thông báo sớm về các chương trình ưu đãi.</li>
                                <li>✨ Tích điểm gấp 1.2 lần vào dịp sinh nhật.</li>
                            </ul>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Hàng 2: Bảng hoạt động gần đây */}
            <div className="activity-section">
                <div className="activity-header">
                    <Title level={4} className="activity-title">
                        <GiftOutlined style={{ marginRight: '8px', color: '#002b7f' }} /> Hoạt động gần đây
                    </Title>
                </div>
                <Card className="table-card">
                    <Table 
                        columns={columns} 
                        dataSource={mockActivities} 
                        pagination={{ pageSize: 5 }}
                        className="custom-table"
                    />
                </Card>
            </div>
        </div>
    );
}
