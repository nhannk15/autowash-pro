import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Tag, Progress, Button, Empty, Space, Typography, Badge, Spin, Modal, message } from 'antd';
import { CalendarOutlined, TrophyOutlined, CrownOutlined, ArrowRightOutlined, GiftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getMembershipTier, getUpcomingBooking, getReward, exchangeVoucher } from '../../../service/customerService';

import './Overview.css';

const { Title, Text } = Typography;

export default function Overview() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State cho dữ liệu từ API
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [tierData, setTierData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State cho reward
    const [rewards, setRewards] = useState([])
    const [isRewardModalOpen, setIsRewardModalOpen] = useState(false)
    const [exchanging, setExchanging] = useState(false)

    // hàm xử lí đổi điểm
    // THÊM HÀM NÀY ĐỂ XỬ LÝ ĐỔI ĐIỂM:
    const handleExchange = (reward) => {
        Modal.confirm({
            title: 'Xác nhận đổi phần thưởng',
            content: `Bạn có chắc chắn muốn dùng ${reward.pointCost} điểm để đổi lấy voucher "${reward.rewardName}" không?`,
            okText: 'Đổi điểm',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    setExchanging(true);
                    const payload = {
                        customerId: user.id,
                        rewardId: reward.id
                    };
                    await exchangeVoucher(payload);
                    message.success(`Đổi voucher "${reward.rewardName}" thành công!`);

                    // Gọi lại API lấy thông tin Membership Tier để cập nhật điểm mới trên giao diện
                    const tier = await getMembershipTier();
                    setTierData(tier);
                    setIsRewardModalOpen(false);
                } catch (error) {
                    console.error("Lỗi đổi voucher:", error);
                    message.error(error.response?.data?.message || "Đổi voucher thất bại, vui lòng thử lại!");
                } finally {
                    setExchanging(false);
                }
            }
        });
    };

    useEffect(() => {
        let isMounted = true;
        async function fetchDashboardData() {
            try {
                setLoading(true);
                const [bookings, tier] = await Promise.all([
                    getUpcomingBooking(),
                    getMembershipTier()
                ]);
                if (isMounted) {
                    setUpcomingBookings(bookings || []);
                    setTierData(tier);
                }
            } catch (err) {
                console.error("Lỗi khi tải thông tin dashboard:", err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }
        fetchDashboardData();
        return () => {
            isMounted = false;
        };
    }, []);

    // Lịch đặt gần nhất (sắp diễn ra đầu tiên)
    const nearestBooking = upcomingBookings.length > 0 ? upcomingBookings[0] : null;
    // Số lượng lịch đặt khác
    const otherBookingsCount = upcomingBookings.length > 1 ? upcomingBookings.length - 1 : 0;

    // Chi tiết lịch đặt gần nhất
    const nearestBookingServiceName = nearestBooking?.bookingDetails
        ? nearestBooking.bookingDetails.map(d => d.serviceName).join(', ')
        : 'Chưa chọn dịch vụ';
    const nearestBookingDate = nearestBooking?.slotDate
        ? nearestBooking.slotDate.split('-').reverse().join('/')
        : '';
    const nearestBookingTime = nearestBooking?.startTime
        ? nearestBooking.startTime.substring(0, 5)
        : '';
    const nearestBookingLicensePlate = nearestBooking?.vehicle?.licensePlate || 'N/A';

    // Điểm tích lũy & hạng thành viên từ API
    const points = tierData?.customerCurrentPoints || 0;
    const nextTierPoints = tierData?.membershipTierSummaryResponse?.minPointsForNextTier || 0;
    const percentToNextTier = nextTierPoints > 0 ? Math.min(Math.round((points / nextTierPoints) * 100), 100) : 100;
    const currentTierName = tierData?.membershipTierSummaryResponse?.currentTierName || 'Đồng';
    const nextTierName = tierData?.membershipTierSummaryResponse?.nextTierName || 'Hạng tiếp theo';

    // Phân tích quyền lợi thành viên từ API (Động hoàn toàn, không hardcode)
    const buildTierBenefits = () => {
        const list = [];
        const summary = tierData?.membershipTierSummaryResponse;
        if (!summary) return list;

        // 1. Phân tách và thêm các đặc quyền từ perksDescription
        if (summary.perksDescription) {
            const perks = summary.perksDescription
                .split(',')
                .map(item => item.trim())
                .filter(Boolean);
            list.push(...perks);
        }

        // 2. Thêm đặc quyền thời gian đặt lịch trước (bookingWindowDays)
        if (summary.bookingWindowDays > 0) {
            list.push(`Bạn có thể đặt lịch trước tối đa ${summary.bookingWindowDays} ngày`);
        }

        // 3. Thêm quy tắc tích điểm (pointEarnRate)
        if (summary.pointEarnRate) {
            list.push(`Quy đổi điểm thưởng: 1 point = ${(summary.pointEarnRate * 1000).toLocaleString('en-US')} VND`);
        }

        return list;
    };

    const tierBenefits = buildTierBenefits();

    const getTierClass = (tierName) => {
        const name = tierName?.toLowerCase() || '';
        if (name.includes('bạc') || name.includes('silver')) return 'silver';
        if (name.includes('vàng') || name.includes('gold')) return 'gold';
        if (name.includes('kim cương') || name.includes('diamond')) return 'diamond';
        return 'bronze';
    };

    // Định nghĩa các cột cho bảng hiển thị tất cả lịch đặt sắp tới trong Modal
    const upcomingTableColumns = [
        {
            title: 'MÃ ĐẶT LỊCH',
            dataIndex: 'bookingCode',
            key: 'bookingCode',
            render: (text) => <Text strong style={{ color: '#002b7f' }}>{text}</Text>,
        },
        {
            title: 'GIỜ HẸN',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (time) => time ? time.substring(0, 5) : '',
        },
        {
            title: 'NGÀY HẸN',
            dataIndex: 'slotDate',
            key: 'slotDate',
            render: (date) => date ? date.split('-').reverse().join('/') : '',
        },
        {
            title: 'DỊCH VỤ',
            key: 'services',
            render: (_, record) => (
                <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '12px' }}>
                    {record.bookingDetails?.map((detail, index) => (
                        <li key={index}>
                            {detail.serviceName} ({detail.finalPrice.toLocaleString()}đ)
                        </li>
                    ))}
                </ul>
            ),
        },
        {
            title: 'TẠM TÍNH (GIÁ CUỐI)',
            key: 'totalPrice',
            render: (_, record) => {
                const total = record.bookingDetails
                    ? record.bookingDetails.reduce((sum, d) => sum + d.finalPrice, 0)
                    : 0;
                return <Text strong style={{ color: '#52c41a' }}>{total.toLocaleString()} VND</Text>;
            },
        },
        {
            title: 'HÀNH ĐỘNG',
            key: 'action',
            render: (_, record) => (
                <Button
                    danger
                    type="primary"
                    size="small"
                    onClick={() => {
                        Modal.confirm({
                            title: 'Xác nhận hủy lịch',
                            content: `Bạn có chắc chắn muốn hủy lịch đặt xe ${record.bookingCode} không?`,
                            okText: 'Xác nhận hủy',
                            okType: 'danger',
                            cancelText: 'Quay lại',
                            onOk: () => {
                                // Hủy lịch tượng trưng ở FrontEnd
                                setUpcomingBookings(prev => prev.filter(b => b.id !== record.id));
                                message.success(`Hủy lịch đặt xe ${record.bookingCode} thành công (FE Mockup)!`);
                            }
                        });
                    }}
                >
                    Hủy lịch
                </Button>
            ),
        },
    ];

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
                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                                    <Spin size="small" />
                                </div>
                            ) : nearestBooking ? (
                                <div className="booking-info">
                                    <div className="booking-service">{nearestBookingServiceName}</div>
                                    <div className="booking-detail">
                                        📅 {nearestBookingDate} | 🕒 {nearestBookingTime}
                                    </div>
                                    <div className="booking-car">
                                        🚗 Biển số: <strong>{nearestBookingLicensePlate}</strong>
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
                                        onClick={() => setIsModalOpen(true)}
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
                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                                    <Spin size="small" />
                                </div>
                            ) : (
                                <>
                                    <div className="points-display">
                                        <span className="points-number">{points}</span>
                                        <span className="points-unit">điểm</span>
                                    </div>
                                    <div className="progress-section">
                                        <div className="progress-text">
                                            <span>Tiến trình lên {nextTierName}</span>
                                            <span>{points}/{nextTierPoints}</span>
                                        </div>
                                        <Progress
                                            percent={percentToNextTier}
                                            strokeColor="#faad14"
                                            trailColor="#f0f0f0"
                                            showInfo={false}
                                        />
                                        <div className="progress-tip">
                                            {nextTierPoints > points
                                                ? `Còn ${nextTierPoints - points} điểm để thăng hạng`
                                                : 'Bạn đã đạt mức điểm tối đa'}
                                        </div>
                                    </div>
                                    <Button
                                        type="primary"
                                        icon={<GiftOutlined />}
                                        onClick={async () => {
                                            try {
                                                const data = await getReward();
                                                setRewards(data.data || []);
                                                setIsRewardModalOpen(true);
                                            } catch (error) {
                                                message.error("Không thể tải danh sách phần thưởng!");
                                            }
                                        }}
                                        style={{ marginTop: '16px', width: '100%', backgroundColor: '#faad14', borderColor: '#faad14' }}
                                    >
                                        Đổi voucher
                                    </Button>
                                </>
                            )}
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
                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                                    <Spin size="small" />
                                </div>
                            ) : (
                                <>
                                    <div className="tier-display">
                                        <div className={`tier-badge ${getTierClass(currentTierName)}`}>
                                            {currentTierName.toUpperCase()}
                                        </div>
                                    </div>
                                    <ul className="tier-benefits">
                                        {tierBenefits.map((benefit, index) => (
                                            <li key={index}>✨ {benefit}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
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

            {/* Modal hiển thị danh sách tất cả các lịch đặt sắp tới */}
            <Modal
                title={<span style={{ color: '#002b7f', fontWeight: 700, fontSize: '18px' }}>DANH SÁCH LỊCH ĐẶT SẮP TỚI</span>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={850}
            >
                <Table
                    columns={upcomingTableColumns}
                    dataSource={upcomingBookings}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    className="custom-table"
                    style={{ marginTop: '16px' }}
                    locale={{ emptyText: <Empty description="Bạn không có lịch đặt sắp tới" /> }}
                />
            </Modal>
            <Modal
                title={<span style={{ color: '#002b7f', fontWeight: 700, fontSize: '18px' }}>DANH SÁCH VOUCHER QUY ĐỔI</span>}
                open={isRewardModalOpen}
                onCancel={() => setIsRewardModalOpen(false)}
                footer={null}
                width={800}
            >
                <Table
                    dataSource={rewards}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    style={{ marginTop: '16px' }}
                    className="custom-table"
                    columns={[
                        {
                            title: 'TÊN PHẦN THƯỞNG',
                            dataIndex: 'rewardName',
                            key: 'rewardName',
                            render: (text) => <Text strong style={{ color: '#002b7f' }}>{text}</Text>
                        },
                        {
                            title: 'MÔ TẢ',
                            dataIndex: 'description',
                            key: 'description',
                        },
                        {
                            title: 'ĐIỂM CẦN ĐỔI',
                            dataIndex: 'pointCost',
                            key: 'pointCost',
                            render: (pts) => <Text strong style={{ color: '#faad14' }}>{pts} điểm</Text>
                        },
                        {
                            title: 'HÀNH ĐỘNG',
                            key: 'action',
                            render: (_, record) => (
                                <Button
                                    type="primary"
                                    onClick={() => handleExchange(record)}
                                    disabled={points < record.pointCost || exchanging}
                                    style={{ backgroundColor: points >= record.pointCost ? '#faad14' : undefined, borderColor: points >= record.pointCost ? '#faad14' : undefined }}
                                >
                                    Đổi điểm
                                </Button>
                            )
                        }
                    ]}
                />
            </Modal>
        </div >
    );
}
