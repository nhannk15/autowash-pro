import { useState, useEffect, useMemo } from "react";
import { Row, Col, Card, Flex, Space, Table, Button, Input, Tooltip, Typography, Spin } from "antd";
import {
    DollarCircleOutlined,
    CarOutlined,
    SearchOutlined,
    EyeOutlined
} from "@ant-design/icons";
import { getTodayBookings } from "../../../service/staffService";
import "./History.css";

const { Title } = Typography;

const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

// Tính doanh thu của 1 booking — dùng chung cho cả cột "Giá tiền" và stats "Tổng doanh thu"
// để tránh viết trùng logic ở 2 nơi (dễ lệch nhau nếu sau này sửa 1 chỗ mà quên chỗ kia)
const getBookingRevenue = (record) => {
    if (record.washSessionStatus !== 'PAID') return 0;
    return (record.bookingDetails || []).reduce(
        (sum, d) => sum + Number(d.finalPrice || 0),
        0
    );
};

export default function History() {
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

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

    // === Filter chỉ lấy booking đã COMPLETED ===
    const completedData = useMemo(() => {
        let result = data.filter(b => b.status === 'COMPLETED');

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
        const totalRevenue = completedData.reduce((sum, b) => sum + getBookingRevenue(b), 0);
        return { totalServiced, totalRevenue };
    }, [completedData]);

    const columns = [
        {
            title: 'Thời gian',
            key: 'time',
            render: (_, record) => {
                // Lấy endTime từ washSession hoặc updatedAt từ booking
                const session = record.washSessions?.[0];
                const time = session?.endTime || record.updatedAt || record.createdAt;
                if (!time) return 'N/A';
                return new Date(time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            }
        },
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
                const services = record.bookingDetails?.map(d => d.servicePrice?.service?.name).filter(Boolean);
                return services?.join(', ') || 'N/A';
            }
        },
        {
            title: 'Giá tiền',
            key: 'price',
            render: (_, record) => formatCurrency(getBookingRevenue(record))
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: () => (
                <Space size="small">
                    <Tooltip title="Xem chi tiết">
                        <Button type="primary" icon={<EyeOutlined />} ghost size="small">
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
        </div>
    )
}