import { useState, useEffect, useMemo } from "react";
import { Row, Col, Card, Flex, Space, Table, Button, Input, Tooltip, Typography, Spin, Tag, Modal, Descriptions, Divider } from "antd";
import {
    DollarCircleOutlined,
    CarOutlined,
    SearchOutlined,
    EyeOutlined
} from "@ant-design/icons";
import { getTodayBookings } from "../../../service/staffService";
import "./History.css";

const { Title, Text } = Typography;

const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

// Tính doanh thu của 1 booking — dùng chung cho cả cột "Giá tiền" và stats "Tổng doanh thu"
// để tránh viết trùng logic ở 2 nơi (dễ lệch nhau nếu sau này sửa 1 chỗ mà quên chỗ kia)
const getBookingRevenue = (record) => {
    return (record.bookingDetails || []).reduce(
        (sum, d) => sum + Number(d.finalPrice || 0),
        0
    );
};

// Lấy tổng giảm giá từ Khuyến mãi (đã được lưu trong bookingDetails)
const getPromotionDiscount = (record) => {
    return (record.bookingDetails || []).reduce(
        (sum, d) => sum + Number(d.discountAmount || 0),
        0
    );
};

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
                console.error("Failed to fetch booking", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBooking();
    }, []);

    // === Filter chỉ lấy booking có WashSession đã COMPLETED hoặc PAID ===
    const completedData = useMemo(() => {
        let result = data.filter(b => b.washSessionStatus === 'COMPLETED' || b.washSessionStatus === 'PAID');

        // Filter theo biển số xe
        if (searchText.trim()) {
            const search = searchText.toLowerCase();
            result = result.filter(b =>
                (b.vehicle?.licensePlate || '').toLowerCase().includes(search)
            );
        }

        return result;
    }, [data, searchText]);

    // === Stats tự đếm từ data ===
    const stats = useMemo(() => {
        const totalServiced = completedData.length;
        // Chỉ cộng doanh thu nếu booking đã ở trạng thái PAID
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
                    <span style={{ fontWeight: 500 }}>{record.vehicle?.licensePlate || 'N/A'}</span>
                    <span style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.vehicle?.brand || ''}</span>
                </Flex>
            ),
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_, record) => (
                <span style={{ fontWeight: 500 }}>{record.customer?.fullName || 'N/A'}</span>
            )
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
            }
        },
        {
            title: 'Thời gian kết thúc',
            key: 'time',
            render: (_, record) => {
                return record?.endTime?.substring(0, 5) || 'N/A';
            }
        },
        {
            title: 'Giá tiền',
            key: 'price',
            render: (_, record) => (<Text strong>{formatCurrency(getBookingRevenue(record))}</Text>)
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
                        style={{ fontWeight: 500, borderRadius: '6px', padding: '2px 8px' }}
                    >
                        {isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </Tag>
                );
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button type="primary" icon={<EyeOutlined />} ghost size="small" onClick={() => setSelectedHistory(record)}>
                            Chi tiết
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    useEffect(() => {
        setPagination(prev => ({ ...prev, current: 1 }));
    }, [searchText]);

    return (
        <div>
            <Row gutter={[24, 24]} className="dashboard__stats-row">
                <Col xs={24} sm={12}>
                    <Card className="stat-card" style={{ borderRadius: '16px' }}>
                        <Flex align="center" gap="large">
                            <div style={{ backgroundColor: '#e6f7ff', padding: '16px', borderRadius: '16px', display: 'flex' }}>
                                <CarOutlined style={{ fontSize: '28px', color: '#1890ff' }} />
                            </div>
                            <div>
                                <div style={{ color: '#8c8c8c', fontSize: '14px', marginBottom: '4px', fontWeight: 500 }}>Tổng số xe đã phục vụ</div>
                                <div style={{ fontSize: '28px', fontWeight: 600, color: '#262626', lineHeight: 1 }}>{stats.totalServiced}</div>
                            </div>
                        </Flex>
                    </Card>
                </Col>
                <Col xs={24} sm={12}>
                    <Card className="stat-card" style={{ borderRadius: '16px' }}>
                        <Flex align="center" gap="large">
                            <div style={{ backgroundColor: '#f6ffed', padding: '16px', borderRadius: '16px', display: 'flex' }}>
                                <DollarCircleOutlined style={{ fontSize: '28px', color: '#52c41a' }} />
                            </div>
                            <div>
                                <div style={{ color: '#8c8c8c', fontSize: '14px', marginBottom: '4px', fontWeight: 500 }}>Tổng doanh thu</div>
                                <div style={{ fontSize: '28px', fontWeight: 600, color: '#262626', lineHeight: 1 }}>{formatCurrency(stats.totalRevenue)}</div>
                            </div>
                        </Flex>
                    </Card>
                </Col>
            </Row>

            <Card className="history-card" style={{ marginTop: '24px' }}>
                <Flex justify="space-between" align="center" style={{ marginBottom: '20px' }}>
                    <Title level={4} style={{ margin: 0 }}>Lịch sử hoàn thành</Title>
                    <Space>
                        <Input
                            placeholder="Tìm biển số xe..."
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            style={{ width: 250, borderRadius: '6px' }}
                            allowClear
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </Space>
                </Flex>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
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
                    <Button key="close" onClick={() => setSelectedHistory(null)}>
                        Đóng
                    </Button>
                ]}
                width={700}
                centered
            >
                {selectedHistory && (() => {
                    const promoDiscount = getPromotionDiscount(selectedHistory);
                    const totalDiscount = Number(selectedHistory.billing?.discountAmount || 0);
                    const voucherDiscount = Math.max(0, totalDiscount - promoDiscount);

                    return (
                        <div style={{ marginTop: 24 }}>
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
                                    <Text strong >
                                        {selectedHistory.endTime?.substring(0, 5)} {selectedHistory.slotDate}
                                    </Text>
                                </Descriptions.Item>
                            </Descriptions>

                            <Divider orientation="left" plain>Thông tin Thanh toán</Divider>

                            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
                                <Descriptions.Item label="Tổng tiền dịch vụ (Gốc)">
                                    <Text>{formatCurrency(selectedHistory.billing?.originalAmount || getBookingRevenue(selectedHistory))}</Text>
                                </Descriptions.Item>

                                {selectedHistory.promotion && (
                                    <Descriptions.Item label="Khuyến mãi">
                                        <Text style={{ color: '#52c41a', fontWeight: 500 }}>{selectedHistory.promotion.promotionName}</Text>
                                        {promoDiscount > 0 && (
                                            <Text style={{ color: '#52c41a', marginLeft: 8 }}>(-{formatCurrency(promoDiscount)})</Text>
                                        )}
                                    </Descriptions.Item>
                                )}

                                {selectedHistory.billing?.voucher && (
                                    <Descriptions.Item label="Voucher áp dụng">
                                        <Tag color="blue" style={{ margin: 0 }}>{selectedHistory.billing.voucher.voucherCode}</Tag>
                                        {voucherDiscount > 0 && (
                                            <Text style={{ color: '#1677ff', marginLeft: 8, fontWeight: 500 }}>-{formatCurrency(voucherDiscount)}</Text>
                                        )}
                                    </Descriptions.Item>
                                )}

                                {selectedHistory.billing?.depositAmount > 0 && (
                                    <Descriptions.Item label="Đã đặt cọc">
                                        <Text style={{ color: '#faad14' }}>{formatCurrency(selectedHistory.billing.depositAmount)}</Text>
                                    </Descriptions.Item>
                                )}

                                <Descriptions.Item label="Hình thức thanh toán">
                                    <Text>
                                        {selectedHistory.billing?.paymentMethod === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản'}
                                    </Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Thực thu (Khách đã thanh toán)">
                                    <Text strong style={{ fontSize: 16 }}>
                                        {formatCurrency(selectedHistory.billing?.finalAmount || getBookingRevenue(selectedHistory))}
                                    </Text>
                                </Descriptions.Item>
                            </Descriptions>

                            <Divider orientation="left" plain>Danh sách dịch vụ</Divider>
                            <ul>
                                {selectedHistory.bookingDetails?.map((d, idx) => (
                                    <div key={idx} style={{ marginBottom: 8 }}>
                                        <Text strong>- {d.serviceName}</Text>
                                        <span style={{ float: 'right', fontWeight: 500 }}>
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
    )
}