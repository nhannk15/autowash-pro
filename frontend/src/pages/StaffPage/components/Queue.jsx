import { useState, useEffect, useMemo } from 'react';
import {
    Row, Col, Card, Flex, Space, Table, Tag, Button,
    Input, Select, Tooltip, Typography, Spin, Modal, Descriptions, Divider,
} from 'antd';
import {
    CalendarOutlined,
    CarOutlined,
    CheckCircleOutlined,
    SearchOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { getTodayBookings } from '../../../service/staffService';
import './Queue.css';

const { Title, Text } = Typography;

export default function Queue() {
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);

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

    // Reset về trang 1 khi search/filter thay đổi
    useEffect(() => {
        setPagination(prev => ({ ...prev, current: 1 }));
    }, [searchText, statusFilter]);

    // === Tính stats tự động từ data ===
    const stats = useMemo(() => {
        const todayCount = data.length;
        const inProgressCount = data.filter(b => b.washSessionStatus === 'IN_PROGRESS').length;
        const completedCount = data.filter(b =>
            b.washSessionStatus === 'PAID' || b.washSessionStatus === 'COMPLETED'
        ).length;
        return { todayCount, inProgressCount, completedCount };
    }, [data]);

    // === Helper: map booking status sang display ===
    const getStatusTag = (record) => {
        if (record.washSessionStatus) {
            if (record.washSessionStatus === 'IN_PROGRESS') return { label: 'Đang xử lý', color: 'processing' };
            if (record.washSessionStatus === 'PAID') return { label: 'Đã thanh toán', color: 'success' };
            if (record.washSessionStatus === 'COMPLETED' || record.washSessionStatus === 'COMPLETE') return { label: 'Hoàn thành', color: 'success' };
        }

        const activeSession = record.washSessions?.find(s => s.status === 'IN_PROGRESS');
        const paidSession = record.washSessions?.find(s => s.status === 'PAID');
        const completedSession = record.washSessions?.find(s => s.status === 'COMPLETED' || s.status === 'COMPLETE');

        if (activeSession) return { label: 'Đang xử lý', color: 'processing' };
        if (paidSession) return { label: 'Đã thanh toán', color: 'success' };
        if (completedSession) return { label: 'Hoàn thành', color: 'success' };

        switch (record.status) {
            case 'CONFIRMED': return { label: 'Đang chờ', color: 'warning' };
            case 'COMPLETED': return { label: 'Hoàn thành', color: 'success' };
            case 'CANCELLED': return { label: 'Đã hủy', color: 'error' };
            case 'PAID': return { label: 'Đã thanh toán', color: 'success' };
            default: return { label: record.status || 'N/A', color: 'default' };
        }
    };

    // === Filter data theo search + status ===
    const filteredData = useMemo(() => {
        let result = [...data];

        if (searchText.trim()) {
            const search = searchText.toLowerCase();
            result = result.filter(b =>
                (b.vehicle?.licensePlate || '').toLowerCase().includes(search)
            );
        }

        if (statusFilter !== 'all') {
            const statusMap = {
                waiting: 'Đang chờ',
                processing: 'Đang xử lý',
                paid: 'Đã thanh toán',
                completed: 'Hoàn thành',
                cancelled: 'Đã hủy',
            };
            if (statusMap[statusFilter]) {
                result = result.filter(b => getStatusTag(b).label === statusMap[statusFilter]);
            }
        }

        result.sort((a, b) => {
            const timeA = a.startTime || '23:59:59';
            const timeB = b.startTime || '23:59:59';
            return timeA.localeCompare(timeB);
        });

        return result;
    }, [data, searchText, statusFilter]);

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
            title: 'Thời gian bắt đầu',
            key: 'time',
            render: (_, record) => record?.startTime?.substring(0, 5) || 'N/A',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => {
                const { label, color } = getStatusTag(record);
                return (
                    <Tag color={color} bordered={false} className="queue-status-tag">
                        {label}
                    </Tag>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Tooltip title="Xem chi tiết">
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        ghost
                        size="small"
                        onClick={() => setSelectedBooking(record)}
                    >
                        Chi tiết
                    </Button>
                </Tooltip>
            ),
        },
    ];

    return (
        <div>
            {/* Stats */}
            <Row gutter={[24, 24]} className="dashboard__stats-row">
                <Col xs={24} sm={8}>
                    <Card className="stat-card">
                        <Flex align="center" gap="large">
                            <div className="stat-card__icon-wrapper stat-card__icon-wrapper--orange">
                                <CalendarOutlined className="stat-card__icon--orange" />
                            </div>
                            <div>
                                <div className="stat-card__label">Lịch hẹn hôm nay</div>
                                <div className="stat-card__value">{stats.todayCount}</div>
                            </div>
                        </Flex>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="stat-card">
                        <Flex align="center" gap="large">
                            <div className="stat-card__icon-wrapper stat-card__icon-wrapper--blue">
                                <CarOutlined className="stat-card__icon--blue" />
                            </div>
                            <div>
                                <div className="stat-card__label">Đang xử lý</div>
                                <div className="stat-card__value">{stats.inProgressCount}</div>
                            </div>
                        </Flex>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="stat-card">
                        <Flex align="center" gap="large">
                            <div className="stat-card__icon-wrapper stat-card__icon-wrapper--green">
                                <CheckCircleOutlined className="stat-card__icon--green" />
                            </div>
                            <div>
                                <div className="stat-card__label">Đã hoàn thành</div>
                                <div className="stat-card__value">{stats.completedCount}</div>
                            </div>
                        </Flex>
                    </Card>
                </Col>
            </Row>

            {/* Queue Table */}
            <Card className="queue-card">
                <Flex justify="space-between" align="center" className="queue-card__header">
                    <Title level={4} className="queue-card__title">Danh sách hàng đợi</Title>
                    <Space>
                        <Input
                            placeholder="Tìm biển số xe..."
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            className="queue-search-input"
                            allowClear
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <Select
                            className="queue-filter-select"
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val)}
                            options={[
                                { value: 'all', label: 'Tất cả trạng thái' },
                                { value: 'waiting', label: 'Đang chờ' },
                                { value: 'processing', label: 'Đang xử lý' },
                                { value: 'paid', label: 'Đã thanh toán' },
                                { value: 'completed', label: 'Hoàn thành' },
                                { value: 'cancelled', label: 'Đã hủy' },
                            ]}
                        />
                    </Space>
                </Flex>

                {loading ? (
                    <div className="queue-loading">
                        <Spin size="large" />
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="id"
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: filteredData.length,
                            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                        }}
                    />
                )}
            </Card>

            {/* Modal Chi Tiết */}
            <Modal
                title={<Title level={4} style={{ margin: 0 }}>Chi tiết lịch hẹn</Title>}
                open={!!selectedBooking}
                onCancel={() => setSelectedBooking(null)}
                footer={[
                    <Button key="close" onClick={() => setSelectedBooking(null)}>Đóng</Button>,
                ]}
                width={700}
                centered
            >
                {selectedBooking && (
                    <div style={{ marginTop: 24 }}>
                        <Descriptions bordered column={2} size="small">
                            <Descriptions.Item label="Mã đặt lịch" span={2}>
                                <Text strong>{selectedBooking.bookingCode}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái" span={2}>
                                <Text strong>{getStatusTag(selectedBooking).label}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Khách hàng">
                                {selectedBooking.customer?.fullName || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {selectedBooking.customer?.phoneNumber || 'N/A'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Biển số">
                                <Text>{selectedBooking.vehicle?.licensePlate || 'N/A'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại xe">
                                {selectedBooking.vehicle?.brand} {selectedBooking.vehicle?.model}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày hẹn">
                                {selectedBooking.slotDate}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian">
                                <Text>
                                    {selectedBooking.startTime?.substring(0, 5)} - {selectedBooking.endTime?.substring(0, 5)}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Khoang rửa" span={2}>
                                {selectedBooking.washBay || 'Chưa phân bổ'}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left" plain>Danh sách dịch vụ</Divider>
                        <ul>
                            {selectedBooking.bookingDetails?.map((d, idx) => (
                                <div key={idx} className="queue-modal__service-item">
                                    <Text strong>- {d.serviceName}</Text>
                                    <span className="queue-modal__service-price">
                                        {d.priceAtBooking
                                            ? Number(d.priceAtBooking).toLocaleString('vi-VN') + 'đ'
                                            : ''}
                                    </span>
                                </div>
                            ))}
                        </ul>
                    </div>
                )}
            </Modal>
        </div>
    );
}