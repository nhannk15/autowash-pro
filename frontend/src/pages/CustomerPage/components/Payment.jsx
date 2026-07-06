import { useState } from 'react';
import { Row, Col, Card, Table, Tag, Progress, Select, Space, Typography, Badge, Spin, Empty } from 'antd';
import { 
    WalletOutlined, 
    HistoryOutlined, 
    PayCircleOutlined,
    PieChartOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { getCustomerBillingHistory } from '../../../service/customerService';
import './Payment.css';

const { Title, Text } = Typography;
const { Option } = Select;

// ── Transform Utilities ───────────────────────────────────────────────────────

const PAYMENT_METHOD_LABEL = {
    CASH: 'Tiền mặt',
    BANK_TRANSFER: 'VNPAY',
    MOMO: 'Momo',
    ZALO_PAY: 'ZaloPay',
};

function getQuarter(month) {
    return `Q${Math.ceil(month / 3)}`;
}

function formatDateDisplay(isoString) {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}

/**
 * Transform raw BillingResponse[] → UI payment records.
 * - Filters out CONFIRMED bookings (chưa hoàn thành dịch vụ)
 * - Amount: COMPLETED = finalAmount + depositAmount | CANCELLED = depositAmount (mất cọc)
 * - paymentMethod: hardcode VNPAY nếu isForfeited
 * - quarter/year: derived from paidAt ?? depositPaidAt
 */
function transformBillings(rawList) {
    return (rawList ?? [])
        .filter(b => b.booking?.status !== 'CONFIRMED')
        .map((billing, idx) => {
            const booking       = billing.booking ?? {};
            const isCancelled   = booking.status === 'CANCELLED';
            const isForfeited   = isCancelled && billing.depositStatus === 'PAID';

            const depositAmount  = Number(billing.depositAmount)  || 0;
            const finalAmount    = Number(billing.finalAmount)    || 0;
            const originalAmount = Number(billing.originalAmount) || 0;
            const discountAmount = Number(billing.discountAmount) || 0;

            const amount = isForfeited ? depositAmount : finalAmount + depositAmount;

            const rawDate = billing.paidAt ?? billing.depositPaidAt;
            const dateObj = rawDate ? new Date(rawDate) : null;
            const month   = dateObj ? dateObj.getMonth() + 1 : null;

            const paymentMethod = isForfeited
                ? 'VNPAY'
                : (PAYMENT_METHOD_LABEL[billing.paymentMethod] ?? billing.paymentMethod ?? '—');

            const v = booking.vehicle;
            const vehicle = v ? `${v.brand} ${v.model} (${v.licensePlate})` : '—';

            return {
                key:         String(billing.billingId ?? idx),
                bookingCode: booking.bookingCode ?? '—',
                dateDisplay: formatDateDisplay(rawDate),
                rawDate,
                vehicle,
                services:    (booking.bookingDetails ?? []).map(d => d.serviceName),
                paymentMethod,
                amount,
                originalAmount,
                discount:    discountAmount,
                status:      billing.paymentStatus === 'PAID' ? 'SUCCESS' : 'CANCELLED',
                isForfeited,
                quarter:     month ? getQuarter(month) : null,
                year:        dateObj ? dateObj.getFullYear() : null,
                // Legacy fields kept for mock data compatibility
                points:      billing.pointsChange ?? 0,
            };
        });
}

// Mock data lịch sử thanh toán mới theo nghiệp vụ đặt cọc và hủy lịch
// ── Component ────────────────────────────────────────────────────────────────
// (mock data removed – data now comes from GET /api/billings/customer/billing-history)


    {
        key: '1',
        bookingCode: 'BK-8902',
        date: '2026-06-20 09:30',
        vehicle: 'Mazda 3 (30A-999.99)',
        services: ['Rửa xe bọt tuyết', 'Hút bụi nội thất'],
        paymentMethod: 'VNPAY',
        amount: 250000, // Thực chi
        originalAmount: 250000,
        discount: 0,
        status: 'SUCCESS',
        points: 25,
        quarter: 'Q2',
        year: 2026,
        isForfeited: false
    },
    {
        key: '2',
        bookingCode: 'BK-8812',
        date: '2026-06-02 11:00',
        vehicle: 'Mazda 3 (30A-999.99)',
        services: ['Rửa xe cao cấp'],
        paymentMethod: 'VNPAY',
        amount: 50000, // Chỉ mất tiền cọc
        originalAmount: 150000,
        discount: 0,
        status: 'CANCELLED', // Bị hủy, mất cọc
        points: 0,
        quarter: 'Q2',
        year: 2026,
        isForfeited: true
    },
    {
        key: '3',
        bookingCode: 'BK-8751',
        date: '2026-05-15 14:00',
        vehicle: 'Ford Ranger (29C-888.88)',
        services: ['Vệ sinh khoang máy', 'Tẩy ố kính'],
        paymentMethod: 'TIỀN MẶT',
        amount: 1100000, // Đã giảm 100k
        originalAmount: 1200000,
        discount: 100000,
        status: 'SUCCESS',
        points: 110,
        quarter: 'Q2',
        year: 2026,
        isForfeited: false
    },
    {
        key: '4',
        bookingCode: 'BK-8600',
        date: '2026-04-10 10:15',
        vehicle: 'Mazda 3 (30A-999.99)',
        services: ['Đánh bóng toàn xe', 'Phủ Ceramic'],
        paymentMethod: 'VNPAY',
        amount: 3150000, // Đã giảm 350k
        originalAmount: 3500000,
        discount: 350000,
        status: 'SUCCESS',
        points: 315,
        quarter: 'Q2',
        year: 2026,
        isForfeited: false
    },
    {
        key: '5',
        bookingCode: 'BK-8510',
        date: '2026-03-05 16:30',
        vehicle: 'Mazda 3 (30A-999.99)',
        services: ['Rửa xe tiêu chuẩn'],
        paymentMethod: 'TIỀN MẶT',
        amount: 150000,
        originalAmount: 150000,
        discount: 0,
        status: 'SUCCESS',
        points: 15,
        quarter: 'Q1',
        year: 2026,
        isForfeited: false
    },
    {
        key: '6',
        bookingCode: 'BK-8422',
        date: '2026-01-20 08:00',
        vehicle: 'Mazda 3 (30A-999.99)',
        services: ['Xông tinh dầu khử mùi'],
        paymentMethod: 'VNPAY',
        amount: 270000, // Đã giảm 30k
        originalAmount: 300000,
        discount: 30000,
        status: 'SUCCESS',
        points: 27,
        quarter: 'Q1',
        year: 2026,
        isForfeited: false
    }
];

export default function Payment() {
    const [payments, setPayments]               = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [error, setError]                     = useState(null);
    const [selectedQuarter, setSelectedQuarter] = useState(`Q${Math.ceil((new Date().getMonth() + 1) / 3)}`);
    const [selectedYear, setSelectedYear]       = useState(new Date().getFullYear());

    useEffect(() => {
        let isMounted = true;
        async function fetchHistory() {
            try {
                setLoading(true);
                const raw = await getCustomerBillingHistory();
                if (isMounted) {
                    setPayments(transformBillings(raw));
                    setError(null);
                }
            } catch (err) {
                console.error('Payment history error:', err);
                if (isMounted) setError('Không thể tải lịch sử thanh toán. Vui lòng thử lại.');
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchHistory();
        return () => { isMounted = false; };
    }, []);

    // Tổng tích lũy: chỉ tính COMPLETED (SUCCESS)
    const totalSpent        = payments.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);
    const totalTransactions = payments.length;

    // Filter theo quý/năm (client-side), dựa trên paidAt ?? depositPaidAt
    const filteredPayments = payments.filter(
        p => p.quarter === selectedQuarter && p.year === selectedYear
    );

    const quarterSpent     = filteredPayments.reduce((s, p) => s + p.amount, 0);
    const successSpent     = filteredPayments.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + p.amount, 0);
    const forfeitedSpent   = filteredPayments.filter(p => p.isForfeited).reduce((s, p) => s + p.amount, 0);
    // Tiết kiệm chỉ tính trên giao dịch thành công
    const totalSavings     = filteredPayments.filter(p => p.status === 'SUCCESS').reduce((s, p) => s + p.discount, 0);

    const successPercent   = quarterSpent > 0 ? Math.round((successSpent / quarterSpent) * 100) : 0;
    const forfeitedPercent = quarterSpent > 0 ? Math.round((forfeitedSpent / quarterSpent) * 100) : 0;

    // Columns cho Ant Design Table
    const columns = [
        {
            title: 'Mã Đặt Lịch',
            dataIndex: 'bookingCode',
            key: 'bookingCode',
            render: (text) => <Text strong style={{ color: '#002B7F' }}>{text}</Text>,
        },
        {
            title: 'Ngày thanh toán',
            dataIndex: 'dateDisplay',
            key: 'dateDisplay',
            render: (text) => <span className="payment-date">{text}</span>
        },
        {
            title: 'Xe chăm sóc',
            dataIndex: 'vehicle',
            key: 'vehicle',
            render: (text) => <Text style={{ fontWeight: '500' }}>{text}</Text>
        },
        {
            title: 'Dịch vụ',
            dataIndex: 'services',
            key: 'services',
            render: (services) => (
                <Space direction="vertical" size={2}>
                    {services.map((s, idx) => (
                        <Tag key={idx} color="blue" style={{ borderRadius: '4px', margin: '2px 0' }}>{s}</Tag>
                    ))}
                </Space>
            )
        },
        {
            title: 'Phương thức',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method) => (
                <Tag color={method === 'VNPAY' ? 'geekblue' : 'green'} style={{ fontWeight: 'bold', borderRadius: '4px' }}>
                    {method}
                </Tag>
            )
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ color: record.status === 'CANCELLED' ? '#ef4444' : '#10b981' }}>
                        {formatCurrency(amount)}
                    </Text>
                    {record.discount > 0 && (
                        <Text type="secondary" delete style={{ fontSize: '0.78rem' }}>
                            {formatCurrency(record.originalAmount)}
                        </Text>
                    )}
                    {record.isForfeited && (
                        <Text type="danger" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                            (Mất cọc)
                        </Text>
                    )}
                </Space>
            )
        },
        {
            title: 'Tích điểm',
            dataIndex: 'points',
            key: 'points',
            render: (points) => points > 0 ? (
                <Text style={{ color: '#eab308', fontWeight: 'bold' }}>+{points} pts</Text>
            ) : (
                <Text type="secondary">-</Text>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                status === 'SUCCESS' ? (
                    <Tag color="success" icon={<CheckCircleOutlined />} style={{ borderRadius: '12px', padding: '2px 10px', fontWeight: '500' }}>
                        Thành công
                    </Tag>
                ) : (
                    <Tag color="error" icon={<CloseCircleOutlined />} style={{ borderRadius: '12px', padding: '2px 10px', fontWeight: '500' }}>
                        Bị hủy
                    </Tag>
                )
            )
        }
    ];

    return (
        <div className="payment-container">
            {/* Header */}
            <div className="payment-header">
                <div>
                    <Title level={2} className="payment-title">LỊCH SỬ THANH TOÁN</Title>
                    <Text type="secondary">Theo dõi hóa đơn, lịch sử giao dịch đặt cọc và thống kê chi tiêu dịch vụ của bạn.</Text>
                </div>
            </div>

            {/* Overview Stats */}
            <Row gutter={[16, 16]} className="stats-row">
                <Col xs={24} sm={8}>
                    <Card className="stat-card stat-card--blue" bordered={false}>
                        <div className="stat-card__icon-wrapper">
                            <WalletOutlined className="stat-card__icon" />
                        </div>
                        <div className="stat-card__content">
                            <Text className="stat-card__label">Tổng Chi Tiêu Tích Lũy</Text>
                            <Title level={3} className="stat-card__value">{formatCurrency(totalSpent)}</Title>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="stat-card stat-card--green" bordered={false}>
                        <div className="stat-card__icon-wrapper">
                            <PayCircleOutlined className="stat-card__icon" />
                        </div>
                        <div className="stat-card__content">
                            <Text className="stat-card__label">Thực Chi {selectedQuarter}/{selectedYear}</Text>
                            <Title level={3} className="stat-card__value">{formatCurrency(quarterSpent)}</Title>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="stat-card stat-card--amber" bordered={false}>
                        <div className="stat-card__icon-wrapper">
                            <HistoryOutlined className="stat-card__icon" />
                        </div>
                        <div className="stat-card__content">
                            <Text className="stat-card__label">Tổng Số Lịch Hẹn</Text>
                            <Title level={3} className="stat-card__value">{totalTransactions} Đơn đặt</Title>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Breakdown section */}
            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col xs={24} lg={8}>
                    <Card 
                        title={
                            <div className="card-title-flex">
                                <PieChartOutlined />
                                <span>Phân Tích Chi Tiêu {selectedQuarter}/{selectedYear}</span>
                            </div>
                        } 
                        className="breakdown-card"
                        bordered={false}
                    >
                        {/* Selector */}
                        <div className="selector-group">
                            <Space>
                                <Select value={selectedQuarter} onChange={setSelectedQuarter} style={{ width: 100 }}>
                                    <Option value="All">Cả Năm</Option>
                                    <Option value="Q1">Quý 1</Option>
                                    <Option value="Q2">Quý 2</Option>
                                    <Option value="Q3">Quý 3</Option>
                                    <Option value="Q4">Quý 4</Option>
                                </Select>
                                <Select value={selectedYear} onChange={setSelectedYear} style={{ width: 100 }}>
                                    <Option value={2026}>2026</Option>
                                    <Option value={2025}>2025</Option>
                                </Select>
                            </Space>
                        </div>

                        {quarterSpent > 0 ? (
                            <div className="breakdown-content">
                                <div className="breakdown-item">
                                    <div className="breakdown-item__header">
                                        <Text strong style={{ color: '#10b981' }}>Dịch vụ hoàn thành</Text>
                                        <Text type="secondary">{formatCurrency(successSpent)} ({successPercent}%)</Text>
                                    </div>
                                    <Progress percent={successPercent} strokeColor="#10b981" showInfo={false} />
                                </div>

                                <div className="breakdown-item" style={{ marginTop: '20px' }}>
                                    <div className="breakdown-item__header">
                                        <Text strong style={{ color: '#ef4444' }}>Tiền cọc bị mất (Hủy lịch)</Text>
                                        <Text type="secondary">{formatCurrency(forfeitedSpent)} ({forfeitedPercent}%)</Text>
                                    </div>
                                    <Progress percent={forfeitedPercent} strokeColor="#ef4444" showInfo={false} />
                                </div>

                                <div className="savings-highlight-box" style={{ marginTop: '24px', padding: '12px 16px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px dashed #4ade80' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text strong style={{ color: '#15803d', fontSize: '0.85rem' }}>🎁 Tiết kiệm nhờ ưu đãi:</Text>
                                        <Text strong style={{ color: '#15803d', fontSize: '1rem' }}>{formatCurrency(totalSavings)}</Text>
                                    </div>
                                    <Text style={{ fontSize: '0.78rem', color: '#166534', display: 'block', marginTop: '4px' }}>
                                        Số tiền bạn đã được giảm trừ từ các chương trình khuyến mãi & hạng thành viên trong quý này.
                                    </Text>
                                </div>
                            </div>
                        ) : (
                            <div className="empty-breakdown">
                                <Text type="secondary">Không có dữ liệu chi tiêu cho khoảng thời gian này.</Text>
                            </div>
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    <Card 
                        title={
                            <div className="card-title-flex">
                                <HistoryOutlined />
                                <span>Lịch Sử Giao Dịch Đặt Lịch</span>
                            </div>
                        }
                        className="table-card"
                        bordered={false}
                    >
                        <Table 
                            columns={columns} 
                            dataSource={mockPayments} 
                            pagination={{ pageSize: 5 }}
                            scroll={{ x: 'max-content' }}
                            className="payment-table"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
