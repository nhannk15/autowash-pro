import { useState } from 'react';
import { Row, Col, Card, Table, Tag, Progress, Select, Space, Typography, Badge } from 'antd';
import { 
    WalletOutlined, 
    HistoryOutlined, 
    PayCircleOutlined,
    PieChartOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import './Payment.css';

const { Title, Text } = Typography;
const { Option } = Select;

// Mock data lịch sử thanh toán mới theo nghiệp vụ đặt cọc và hủy lịch
const mockPayments = [
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
    const [selectedQuarter, setSelectedQuarter] = useState('Q2');
    const [selectedYear, setSelectedYear] = useState(2026);

    // Tính toán số liệu thống kê tổng quát (Chỉ tính giao dịch thành công và phần cọc bị mất thực tế)
    const totalSpent = mockPayments.reduce((sum, item) => sum + item.amount, 0);
    const totalTransactions = mockPayments.length;
    
    // Lọc data theo quý/năm được chọn
    const filteredPayments = mockPayments.filter(
        item => item.quarter === selectedQuarter && item.year === selectedYear
    );

    const quarterSpent = filteredPayments.reduce((sum, item) => sum + item.amount, 0);

    // Phân tích dòng tiền cho Quý được chọn
    // 1. Chi tiêu dịch vụ thành công
    const successSpent = filteredPayments
        .filter(item => item.status === 'SUCCESS')
        .reduce((sum, item) => sum + item.amount, 0);
        
    // 2. Chi phí cọc bị mất do hủy lịch muộn
    const forfeitedSpent = filteredPayments
        .filter(item => item.isForfeited)
        .reduce((sum, item) => sum + item.amount, 0);

    // 3. Số tiền tiết kiệm được nhờ áp dụng Voucher / Promotion
    const totalSavings = filteredPayments
        .reduce((sum, item) => sum + (item.discount || 0), 0);

    // Tính toán phần trăm dòng tiền trên tổng chi tiêu thực tế của quý
    const successPercent = quarterSpent > 0 ? Math.round((successSpent / quarterSpent) * 100) : 0;
    const forfeitedPercent = quarterSpent > 0 ? Math.round((forfeitedSpent / quarterSpent) * 100) : 0;

    // Định dạng tiền tệ VND
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // Columns cho Ant Design Table (Không có cột Thao tác, đổi thành Mã đặt lịch)
    const columns = [
        {
            title: 'Mã Đặt Lịch',
            dataIndex: 'bookingCode',
            key: 'bookingCode',
            render: (text) => <Text strong style={{ color: '#002B7F' }}>{text}</Text>,
        },
        {
            title: 'Ngày thanh toán',
            dataIndex: 'date',
            key: 'date',
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
