import { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Tag, Progress, Button, Empty, Space, Typography, Badge, Spin, Modal, message, Tooltip } from 'antd';
import { CalendarOutlined, TrophyOutlined, CrownOutlined, ArrowRightOutlined, GiftOutlined, StarOutlined, WalletOutlined, RiseOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getMembershipTier, getUpcomingBooking, getReward, exchangeVoucher, getVoucher, getRecentActivities, getPendingDeposit } from '../../../service/customerService';
import axios from 'axios';
import './Overview.css';

const { Title, Text } = Typography;

const CountdownCell = ({ expiryTime, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!expiryTime) return;

        const updateTimer = () => {
            const difference = new Date(expiryTime) - new Date();
            if (difference <= 0) {
                setTimeLeft('Đã hết hạn');
                if (onExpire) onExpire();
                return;
            }

            const minutes = Math.floor(difference / 1000 / 60);
            const seconds = Math.floor((difference / 1000) % 60);
            setTimeLeft(`${minutes}p ${seconds}s`);
        };

        updateTimer();
        const timerId = setInterval(updateTimer, 1000);

        return () => clearInterval(timerId);
    }, [expiryTime, onExpire]);

    const isExpired = timeLeft === 'Đã hết hạn';

    return (
        <span style={{ 
            fontWeight: '600', 
            color: isExpired ? '#ff4d4f' : '#faad14',
            padding: '2px 6px',
            backgroundColor: isExpired ? '#fff1f0' : '#fffbe6',
            borderRadius: '4px',
            border: `1px solid ${isExpired ? '#ffccc7' : '#ffe58f'}`,
            whiteSpace: 'nowrap'
        }}>
            {timeLeft}
        </span>
    );
};


export default function Overview() {
    const { user } = useAuth();
    const navigate = useNavigate();

    //State cho dữ liệu deposit pending
    const [depositPending, setDepositPending] = useState([])

    // State cho dữ liệu từ API
    const [upcomingBookings, setUpcomingBookings] = useState([]);
    const [tierData, setTierData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);

    // State cho reward
    const [rewards, setRewards] = useState([])
    const [isRewardModalOpen, setIsRewardModalOpen] = useState(false)
    const [exchanging, setExchanging] = useState(false)

    // State cho voucher
    const [myVouchers, setMyVouchers] = useState([])
    const [isMyVoucherModalOpen, setIsMyVoucherModalOpen] = useState(false)

    // State cho lịch sử điểm
    const [recentActivities, setRecentActivities] = useState([])

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

    const handlePayDeposit = async (booking) => {
        try {
            const billingId = booking.billing?.id || booking.billingId;
            if (!billingId) {
                message.error("Không tìm thấy thông tin hóa đơn đặt cọc!");
                return;
            }
            const response = await axios.post("/api/payment/vnpay/create", {
                billingId: billingId,
                orderInfo: `Dat coc lich hen ${booking.bookingCode}`
            });
            if (response.data && response.data.paymentUrl) {
                window.location.href = response.data.paymentUrl;
            } else {
                message.error("Không nhận được link thanh toán từ hệ thống!");
            }
        } catch (error) {
            console.error("Lỗi khi thanh toán đặt cọc:", error);
            message.error(error.response?.data?.message || "Không thể khởi tạo thanh toán VNPay!");
        }
    };

    useEffect(() => {
        let isMounted = true;
        let isFirstLoad = true;

        async function fetchDashboardData() {
            try {
                // Chỉ hiện loading spinner lần đầu, tránh flicker khi poll
                if (isFirstLoad) setLoading(true);

                const [bookings, tier, activities, pending] = await Promise.all([
                    getUpcomingBooking(),
                    getMembershipTier(),
                    getRecentActivities(),
                    getPendingDeposit()
                ]);
                if (isMounted) {
                    setUpcomingBookings(bookings || []);
                    setTierData(tier);
                    setRecentActivities(activities || []);
                    setDepositPending(pending || []);
                }
            } catch (err) {
                console.error("Lỗi khi tải thông tin dashboard:", err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    isFirstLoad = false;
                }
            }
        }

        fetchDashboardData();
        // Tự động cập nhật mỗi 5 giây
        const intervalId = setInterval(fetchDashboardData, 5000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
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

    // Lịch đặt chờ cọc gần nhất
    const nearestPending = depositPending.length > 0 ? depositPending[0] : null;
    // Số lượng lịch chờ cọc khác
    const otherPendingCount = depositPending.length > 1 ? depositPending.length - 1 : 0;

    // Chi tiết lịch đặt chờ cọc gần nhất
    const nearestPendingServiceName = nearestPending?.bookingDetails
        ? nearestPending.bookingDetails.map(d => d.serviceName).join(', ')
        : 'Chưa chọn dịch vụ';
    const nearestPendingDate = nearestPending?.slotDate
        ? nearestPending.slotDate.split('-').reverse().join('/')
        : '';
    const nearestPendingTime = nearestPending?.startTime
        ? nearestPending.startTime.substring(0, 5)
        : '';
    const nearestPendingLicensePlate = nearestPending?.vehicle?.licensePlate || 'N/A';
    const nearestPendingDeposit = nearestPending?.billing?.depositAmount || 0;

    // Điểm tích lũy & hạng thành viên từ API
    const currentPoints = tierData?.customerCurrentPoints || 0;
    const lifetimePoints = tierData?.lifetimePoints || 0;
    const deltaPoints = tierData?.deltaPoints || 0;
    const nextTierPoints = tierData?.membershipTierSummaryResponse?.minPointsForNextTier || 0;
    const minPointsToMaintain = tierData?.membershipTierSummaryResponse?.minPointsToMaintain || 0;
    const currentTierName = tierData?.membershipTierSummaryResponse?.currentTierName || 'Đồng';
    const nextTierName = tierData?.membershipTierSummaryResponse?.nextTierName || 'Hạng tiếp theo';

    // Tính % delta so với ngưỡng duy trì và nâng hạng
    const deltaPercentMaintain = minPointsToMaintain > 0 ? Math.min(Math.round((deltaPoints / minPointsToMaintain) * 100), 100) : 100;
    const deltaPercentUpgrade = nextTierPoints > 0 ? Math.min(Math.round((deltaPoints / nextTierPoints) * 100), 100) : 100;


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

    // Định nghĩa các cột cho Bảng lịch sử điểm
    const columns = [
        {
            title: 'HOẠT ĐỘNG',
            dataIndex: 'transactionType',
            key: 'transactionType',
            render: (type) => {
                let color = 'default';
                let text = type;
                if (type === 'EARN') {
                    color = 'success';
                    text = 'Tích điểm';
                } else if (type === 'REDEEM') {
                    color = 'warning';
                    text = 'Đổi voucher';
                } else if (type === 'EXPIRE') {
                    color = 'error';
                    text = 'Điểm hết hạn';
                } else if (type === 'ADJUST') {
                    color = 'blue';
                    text = 'Điều chỉnh';
                } else if (type === 'BONUS') {
                    color = 'purple';
                    text = 'Thưởng';
                }
                return <Tag color={color} className="status-tag">{text}</Tag>;
            }
        },
        {
            title: 'CHI TIẾT / MÔ TẢ',
            key: 'description',
            render: (_, record) => {
                if (record.transactionType === 'EARN' && record.services && record.services.length > 0) {
                    return `Tích điểm dịch vụ: ${record.services.join(', ')}`;
                } else if (record.transactionType === 'REDEEM' && record.voucherName) {
                    return `Đổi voucher: ${record.voucherName}`;
                }
                return record.description || 'N/A';
            }
        },
        {
            title: 'THỜI GIAN',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => date ? new Date(date).toLocaleString('vi-VN') : '',
        },
        {
            title: 'ĐIỂM GIAO DỊCH',
            key: 'pointsChange',
            render: (_, record) => {
                const isNegative = record.transactionType === 'REDEEM' || record.transactionType === 'EXPIRE';
                const sign = isNegative ? '-' : '+';
                const color = isNegative ? '#ef4444' : '#10b981';
                return (
                    <Text strong style={{ color }}>
                        {sign}{record.pointsChange?.toLocaleString()}
                    </Text>
                );
            }
        }
    ];
    const pendingTableColumns = [
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
            title: 'TIỀN ĐẶT CỌC',
            key: 'depositAmount',
            render: (_, record) => {
                const deposit = record.billing?.depositAmount || 0;
                return <Text strong style={{ color: '#ff4d4f' }}>{deposit.toLocaleString()} VND</Text>;
            },
        },
        {
            title: 'HẾT HẠN TRONG',
            key: 'depositExpiry',
            render: (_, record) => (
                <CountdownCell expiryTime={record.billing?.depositExpiry} />
            ),
        },
        {
            title: 'HÀNH ĐỘNG',
            key: 'action',
            render: (_, record) => {
                const isExpired = record.billing?.depositExpiry ? new Date(record.billing.depositExpiry) <= new Date() : false;
                return (
                    <Button
                        type="primary"
                        danger
                        size="small"
                        disabled={isExpired}
                        onClick={() => handlePayDeposit(record)}
                    >
                        Thanh toán
                    </Button>
                );
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
                <Col xs={24} sm={12} xl={6}>
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

                {/* Cột 2: Lịch chờ đặt cọc */}
                <Col xs={24} sm={12} xl={6}>
                    <Card className="dashboard-card pending-card" hoverable>
                        <Space className="card-header">
                            <WalletOutlined className="card-icon icon-red" />
                            <Text className="card-title">LỊCH CHỜ ĐẶT CỌC</Text>
                        </Space>
                        <div className="card-body">
                            {loading ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                                    <Spin size="small" />
                                </div>
                            ) : nearestPending ? (
                                <div className="booking-info">
                                    <div className="booking-service">{nearestPendingServiceName}</div>
                                    <div className="booking-detail">
                                        📅 {nearestPendingDate} | 🕒 {nearestPendingTime}
                                    </div>
                                    <div className="booking-car">
                                        🚗 Biển số: <strong>{nearestPendingLicensePlate}</strong>
                                    </div>
                                                                    <div className="booking-deposit" style={{ margin: '4px 0', fontSize: '13px', fontWeight: 'bold', color: '#ff4d4f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>💵 Tiền cọc: {nearestPendingDeposit.toLocaleString()} VND</span>
                                        <CountdownCell expiryTime={nearestPending?.billing?.depositExpiry} />
                                    </div>
                                    {otherPendingCount > 0 && (
                                        <div className="other-bookings-alert">
                                            <Badge status="warning" text={`Bạn có thêm ${otherPendingCount} lịch chờ cọc khác`} />
                                        </div>
                                    )}
                                    <Space style={{ width: '100%', marginTop: '8px' }} direction="vertical" size={8}>
                                        <Button
                                            type="primary"
                                            danger
                                            block
                                            style={{ height: '36px', fontWeight: '600', borderRadius: '6px' }}
                                            disabled={nearestPending?.billing?.depositExpiry ? new Date(nearestPending.billing.depositExpiry) <= new Date() : false}
                                            onClick={() => handlePayDeposit(nearestPending)}
                                        >
                                            Đặt cọc ngay
                                        </Button>
                                        <Button
                                            type="default"
                                            block
                                            style={{ height: '36px', fontWeight: '600', borderRadius: '6px', borderColor: '#d9d9d9', color: '#595959' }}
                                            onClick={() => setIsPendingModalOpen(true)}
                                        >
                                            Xem tất cả ({depositPending.length})
                                        </Button>
                                    </Space>
                                </div>
                            ) : (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description="Bạn không có lịch chờ cọc"
                                    className="compact-empty"
                                />
                            )}
                        </div>
                    </Card>
                </Col>

                {/* Cột 3: Điểm tích lũy (Lifetime + Current) */}
                <Col xs={24} sm={12} xl={6}>
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
                                    {/* Lifetime Point */}
                                    <div className="point-row lifetime-row">
                                        <div className="point-row-header">
                                            <StarOutlined className="point-row-icon lifetime-icon" />
                                            <Text className="point-row-label">Tổng điểm tích lũy</Text>
                                            <Tooltip title="Tổng điểm bạn đã đạt được từ trước đến nay, chỉ tăng, không giảm">
                                                <InfoCircleOutlined className="point-info-icon" />
                                            </Tooltip>
                                        </div>
                                        <div className="point-row-value lifetime-value">
                                            {lifetimePoints.toLocaleString()}
                                            <span className="point-row-unit">điểm</span>
                                        </div>
                                    </div>

                                    <div className="points-divider" />

                                    {/* Current Point */}
                                    <div className="point-row current-row">
                                        <div className="point-row-header">
                                            <WalletOutlined className="point-row-icon current-icon" />
                                            <Text className="point-row-label">Điểm hiện có</Text>
                                            <Tooltip title="Điểm dùng để đổi voucher. Có hạn 6 tháng nếu không đặt lịch">
                                                <InfoCircleOutlined className="point-info-icon" />
                                            </Tooltip>
                                        </div>
                                        <div className="point-row-value current-value">
                                            {currentPoints.toLocaleString()}
                                            <span className="point-row-unit">điểm</span>
                                        </div>
                                    </div>

                                    <div className="points-actions">
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
                                            className="exchange-voucher-btn-custom"
                                        >
                                            Đổi voucher
                                        </Button>
                                        <Button
                                            type="default"
                                            icon={<GiftOutlined />}
                                            onClick={async () => {
                                                try {
                                                    const data = await getVoucher();
                                                    setMyVouchers(data || []);
                                                    setIsMyVoucherModalOpen(true);
                                                } catch (error) {
                                                    message.error("Không thể tải danh sách voucher!");
                                                }
                                            }}
                                            className="my-voucher-btn-custom"
                                        >
                                            Voucher của tôi
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>
                </Col>

                {/* Cột 4: Hạng thành viên + Delta Point */}
                <Col xs={24} sm={12} xl={6}>
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

                                    {/* Delta Point Section */}
                                    <div className="delta-section">
                                        <div className="delta-header">
                                            <RiseOutlined className="delta-icon" />
                                            <Text className="delta-label">Điểm quý hiện tại</Text>
                                            <Tooltip title="Điểm được tính theo quý, quyết định duy trì hoặc nâng hạng thành viên">
                                                <InfoCircleOutlined className="point-info-icon" />
                                            </Tooltip>
                                        </div>
                                        <div className="delta-value">
                                            {deltaPoints.toLocaleString()}
                                            <span className="delta-unit">điểm</span>
                                        </div>

                                        {/* Progress: Duy trì rank */}
                                        <div className="delta-progress-group">
                                            <div className="delta-progress-label">
                                                <span>🛡️ Duy trì {currentTierName}</span>
                                                <span className={deltaPoints >= minPointsToMaintain ? 'delta-status-ok' : 'delta-status-warn'}>
                                                    {deltaPoints}/{minPointsToMaintain}
                                                </span>
                                            </div>
                                            <Progress
                                                percent={deltaPercentMaintain}
                                                strokeColor={deltaPoints >= minPointsToMaintain ? '#52c41a' : '#ff4d4f'}
                                                trailColor="#f0f0f0"
                                                showInfo={false}
                                                size="small"
                                            />
                                        </div>

                                        {/* Progress: Nâng rank */}
                                        {nextTierPoints > 0 && (
                                            <div className="delta-progress-group">
                                                <div className="delta-progress-label">
                                                    <span>🚀 Lên {nextTierName}</span>
                                                    <span className={deltaPoints >= nextTierPoints ? 'delta-status-ok' : 'delta-status-neutral'}>
                                                        {deltaPoints}/{nextTierPoints}
                                                    </span>
                                                </div>
                                                <Progress
                                                    percent={deltaPercentUpgrade}
                                                    strokeColor={{
                                                        '0%': '#faad14',
                                                        '100%': '#52c41a',
                                                    }}
                                                    trailColor="#f0f0f0"
                                                    showInfo={false}
                                                    size="small"
                                                />
                                            </div>
                                        )}
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

            {/* Hàng 2: Bảng LỊCH SỬ GIAO DỊCH ĐIỂM */}
            <div className="activity-section">
                <div className="activity-header">
                    <Title level={4} className="activity-title">
                        <GiftOutlined style={{ marginRight: '8px', color: '#002b7f' }} /> LỊCH SỬ GIAO DỊCH ĐIỂM
                    </Title>
                </div>
                <Card className="table-card">
                    <Table
                        columns={columns}
                        dataSource={recentActivities}
                        rowKey={(record, index) => record.createdAt + index}
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
            {/* Modal hiển thị danh sách tất cả các lịch đặt chờ cọc */}
            <Modal
                title={<span style={{ color: '#002b7f', fontWeight: 700, fontSize: '18px' }}>DANH SÁCH LỊCH CHỜ ĐẶT CỌC</span>}
                open={isPendingModalOpen}
                onCancel={() => setIsPendingModalOpen(false)}
                footer={null}
                width={950}
            >
                <Table
                    columns={pendingTableColumns}
                    dataSource={depositPending}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    className="custom-table"
                    style={{ marginTop: '16px' }}
                    locale={{ emptyText: <Empty description="Bạn không có lịch chờ cọc" /> }}
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
                                    disabled={currentPoints < record.pointCost || exchanging}
                                    style={{ backgroundColor: currentPoints >= record.pointCost ? '#faad14' : undefined, borderColor: currentPoints >= record.pointCost ? '#faad14' : undefined }}
                                >
                                    Đổi điểm
                                </Button>
                            )
                        }
                    ]}
                />
            </Modal>
            <Modal
                title={<span style={{ color: '#002b7f', fontWeight: 700, fontSize: '18px' }}>DANH SÁCH VOUCHER CỦA BẠN</span>}
                open={isMyVoucherModalOpen}
                onCancel={() => setIsMyVoucherModalOpen(false)}
                footer={null}
                width={800}
            >
                <Table
                    dataSource={myVouchers}
                    rowKey="voucherCode"
                    pagination={{ pageSize: 5 }}
                    style={{ marginTop: '16px' }}
                    className="custom-table"
                    columns={[
                        {
                            title: 'MÃ VOUCHER',
                            dataIndex: 'voucherCode',
                            key: 'voucherCode',
                            render: (text) => <Text copyable strong style={{ color: '#002b7f' }}>{text}</Text>
                        },
                        {
                            title: 'TÊN PHẦN THƯỞNG',
                            dataIndex: ['reward', 'rewardName'],
                            key: 'rewardName',
                            render: (text) => <Text strong>{text}</Text>
                        },
                        {
                            title: 'MÔ TẢ',
                            dataIndex: ['reward', 'description'],
                            key: 'description',
                        },
                        {
                            title: 'HẠN SỬ DỤNG',
                            dataIndex: 'expiresAt',
                            key: 'expiresAt',
                            render: (date) => {
                                if (!date) return 'N/A';
                                const expDate = new Date(date);
                                const now = new Date();
                                const diffTime = expDate - now;
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                if (diffDays < 0) {
                                    return <Tag color="error">Đã hết hạn</Tag>;
                                }
                                return <span style={{ fontWeight: '500' }}>{expDate.toLocaleDateString('vi-VN')} ({diffDays} ngày còn lại)</span>;
                            }
                        },
                        {
                            title: 'TRẠNG THÁI',
                            dataIndex: 'status',
                            key: 'status',
                            render: (status) => {
                                let color = 'default';
                                let text = status;
                                if (status === 'ACTIVE') {
                                    color = 'success';
                                    text = 'Chưa sử dụng';
                                } else if (status === 'USED') {
                                    color = 'default';
                                    text = 'Đã sử dụng';
                                } else if (status === 'EXPIRED') {
                                    color = 'error';
                                    text = 'Đã hết hạn';
                                }
                                return <Tag color={color}>{text}</Tag>;
                            }
                        }
                    ]}
                />
            </Modal>
        </div >
    );
}
