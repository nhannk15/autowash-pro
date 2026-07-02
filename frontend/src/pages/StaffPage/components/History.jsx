import { useState, useEffect, useMemo } from 'react';
import {
    Row, Col, Card, Flex, Space, Table, Button,
    Input, Tooltip, Typography, Spin, Tag, Modal, Descriptions, Divider,
} from 'antd';
import {
    DollarCircleOutlined,
    CarOutlined,
    SearchOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { getTodayBookings } from '../../../service/staffService';
import './History.css';

const { Title, Text } = Typography;

const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const getBookingRevenue = (record) => {
    if (record.billing?.finalAmount != null) {
        const final = Number(record.billing.finalAmount);
        const deposit = Number(record.billing.depositAmount || 0);
        return final + deposit;
    }
    return (record.bookingDetails || []).reduce((sum, d) => sum + Number(d.finalPrice || d.priceAtBooking || 0), 0);
};

const getPromotionDiscount = (record) =>
    (record.bookingDetails || []).reduce((sum, d) => sum + Number(d.discountAmount || 0), 0);

export default function History() {
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [selectedHistory, setSelectedHistory] = useState(null);

    useEffect(() => {
        async function fetchBooking() {
            try {
                const bookings = await getTodayBookings();
                setData(bookings);
            } catch (error) {
                console.error('Failed to fetch booking', error);
            } finally {
                setLoading(false);
            }
        }
        fetchBooking();
    }, []);

    useEffect(() => {
        setPagination(prev => ({ ...prev, current: 1 }));
    }, [searchText]);

    const completedData = useMemo(() => {
        let result = data.filter(
            b => b.washSessionStatus === 'COMPLETED' || b.washSessionStatus === 'PAID'
        );
        if (searchText.trim()) {
            const search = searchText.toLowerCase();
            result = result.filter(b =>
                (b.vehicle?.licensePlate || '').toLowerCase().includes(search)
            );
        }
        return result;
    }, [data, searchText]);

    const stats = useMemo(() => {
        const totalServiced = completedData.length;
        const totalRevenue = completedData.reduce((sum, b) => {
            const isPaid = b.washSessionStatus === 'PAID' || b.status === 'PAID';
            return isPaid ? sum + getBookingRevenue(b) : sum;
        }, 0);
        return { totalServiced, totalRevenue };
    }, [completedData]);

    const columns = [
        {
            title: 'Thông tin xe',
            key: 'carInfo',
            render: (_, record) => (
                <Flex vertical>
                    <span className="car-info__plate">{record.vehicle?.licensePlate || 'N/A'}</span>
                    <span className="car-info__brand">{record.vehicle?.brand || ''}</span>
                </Flex>
            ),
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_, record) => (
                <span className="customer-name">{record.customer?.fullName || 'N/A'}</span>
            ),
        },
        {
            title: 'Dịch vụ',
            key: 'service',
            render: (_, record) => {
                const services = record.bookingDetails?.map(d => d.serviceName).filter(Boolean);
                if (!services || services.length === 0) return 'N/A';
                return (
                    <Space size={[4, 4]} wrap>
                        {services.map((service, index) => (
                            <Tag color="blue" key={index} style={{ margin: 0 }}>
                                {service}
                            </Tag>
                        ))}
                    </Space>
                );
            },
        },
        {
            title: 'Thời gian kết thúc',
            key: 'time',
            render: (_, record) => record?.endTime?.substring(0, 5) || 'N/A',
        },
        {
            title: 'Giá tiền',
            key: 'price',
            render: (_, record) => (
                <Text strong>{formatCurrency(getBookingRevenue(record))}</Text>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'paymentStatus',
            render: (_, record) => {
                const isPaid = record.washSessionStatus === 'PAID' || record.status === 'PAID';
                return (
                    <Tag
                        color={isPaid ? 'success' : 'warning'}
                        bordered={false}
                        className="history-status-tag"
                    >
                        {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </Tag>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            ghost
                            size="small"
                            onClick={() => setSelectedHistory(record)}
                        >
                            Chi tiết
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Stats */}
            <Row gutter={[24, 24]} className="dashboard__stats-row">
                <Col xs={24} sm={12}>
                    <Card className="stat-card">
                        <Flex align="center" gap="large">
                            <div className="stat-card__icon-wrapper stat-card__icon-wrapper--blue">
                                <CarOutlined className="stat-card__icon--blue" />
                            </div>
                            <div>
                                <div className="stat-card__label">Tổng số xe đã phục vụ</div>
                                <div className="stat-card__value">{stats.totalServiced}</div>
                            </div>
                        </Flex>
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card className="stat-card">
                        <Flex align="center" gap="large">
                            <div className="stat-card__icon-wrapper stat-card__icon-wrapper--green">
                                <DollarCircleOutlined className="stat-card__icon--green" />
                            </div>
                            <div>
                                <div className="stat-card__label">Tổng doanh thu</div>
                                <div className="stat-card__value">{formatCurrency(stats.totalRevenue)}</div>
                            </div>
                        </Flex>
                    </Card>
                </Col>
            </Row>

            {/* History Table */}
            <Card className="history-card">
                <Flex justify="space-between" align="center" className="history-card__header">
                    <Title level={4} className="history-card__title">Lịch sử hoàn thành</Title>
                    <Input
                        placeholder="Tìm biển số xe..."
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        className="history-search-input"
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </Flex>

                {loading ? (
                    <div className="history-loading">
                        <Spin size="large" />
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={completedData}
                        rowKey="id"
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: completedData.length,
                            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                        }}
                    />
                )}
            </Card>

            {/* Modal Chi Tiết History */}
            <Modal
                title={<Title level={4} style={{ margin: 0 }}>Chi tiết Lịch sử Thanh toán</Title>}
                open={!!selectedHistory}
                onCancel={() => setSelectedHistory(null)}
                footer={[
                    <Button key="close" onClick={() => setSelectedHistory(null)}>Đóng</Button>,
                ]}
                width={700}
                centered
            >
                {selectedHistory && (() => {
                    const promoDiscount = getPromotionDiscount(selectedHistory);
                    const totalDiscount = Number(selectedHistory.billing?.discountAmount || 0);
                    const voucherDiscount = Math.max(0, totalDiscount - promoDiscount);

                    return (
                        <div className="history-modal__body">
                            <Descriptions bordered column={2} size="small">
                                <Descriptions.Item label="Mã đặt lịch" span={2}>
                                    <Text strong>{selectedHistory.bookingCode}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Khách hàng">
                                    {selectedHistory.customer?.fullName || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Số điện thoại">
                                    {selectedHistory.customer?.phoneNumber || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Biển số">
                                    <Text>{selectedHistory.vehicle?.licensePlate || 'N/A'}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Loại xe">
                                    {selectedHistory.vehicle?.brand} {selectedHistory.vehicle?.model}
                                </Descriptions.Item>
                                <Descriptions.Item label="Thời gian kết thúc" span={2}>
                                    <Text strong>
                                        {selectedHistory.endTime?.substring(0, 5)} {selectedHistory.slotDate}
                                    </Text>
                                </Descriptions.Item>
                            </Descriptions>

                            <Divider orientation="left" plain>Thông tin Thanh toán</Divider>

                            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
                                <Descriptions.Item label="Tổng tiền dịch vụ (Gốc)">
                                    <Text className="history-modal__originalAmount-text">
                                        {formatCurrency(
                                            selectedHistory.billing?.originalAmount || getBookingRevenue(selectedHistory)
                                        )}
                                    </Text>
                                </Descriptions.Item>

                                {selectedHistory.promotion && (
                                    <Descriptions.Item label="Khuyến mãi">
                                        <Text className="history-modal__promotion-text">
                                            {selectedHistory.promotion.promotionName}
                                        </Text>
                                        {promoDiscount > 0 && (
                                            <Text className="history-modal__promotion-discount">
                                                (-{formatCurrency(promoDiscount)})
                                            </Text>
                                        )}
                                    </Descriptions.Item>
                                )}

                                {selectedHistory.billing?.voucher && (
                                    <Descriptions.Item label="Voucher áp dụng">
                                        <Tag color="blue" style={{ margin: 0 }}>
                                            {selectedHistory.billing.voucher.voucherCode}
                                        </Tag>
                                        {voucherDiscount > 0 && (
                                            <Text className="history-modal__voucher-discount">
                                                -{formatCurrency(voucherDiscount)}
                                            </Text>
                                        )}
                                    </Descriptions.Item>
                                )}

                                {selectedHistory.billing?.depositAmount > 0 && (
                                    <Descriptions.Item label="Đã đặt cọc">
                                        <Text className="history-modal__deposit-text">
                                            {formatCurrency(selectedHistory.billing.depositAmount)}
                                        </Text>
                                    </Descriptions.Item>
                                )}

                                <Descriptions.Item label="Hình thức thanh toán">
                                    <Text>
                                        {selectedHistory.billing?.paymentMethod === 'CASH'
                                            ? 'Tiền mặt'
                                            : 'Chuyển khoản'}
                                    </Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Tổng thực thu">
                                    <Text strong className="history-modal__final-amount" style={{ color: '#52c41a', fontSize: '16px' }}>
                                        {formatCurrency(getBookingRevenue(selectedHistory))}
                                    </Text>
                                </Descriptions.Item>
                            </Descriptions>

                            <Divider orientation="left" plain>Danh sách dịch vụ</Divider>
                            <ul>
                                {selectedHistory.bookingDetails?.map((d, idx) => (
                                    <div key={idx} className="history-modal__service-item">
                                        <Text strong>- {d.serviceName}</Text>
                                        <span className="history-modal__service-price">
                                            {formatCurrency(d.priceAtBooking)}
                                        </span>
                                    </div>
                                ))}
                            </ul>
                        </div>
                    );
                })()}
            </Modal>
        </div>
    );
}