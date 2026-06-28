import { useState, useEffect, useMemo } from "react";
import { Row, Col, Card, Flex, Space, Table, Tag, Button, Input, Select, Tooltip, Typography, Spin, Modal, Descriptions, Divider } from "antd";
import {
    CalendarOutlined,
    CarOutlined,
    CheckCircleOutlined,
    SearchOutlined,
    EyeOutlined
} from "@ant-design/icons";
import { getTodayBookings } from "../../../service/staffService";
import "./Queue.css";

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
                console.error("Failed to fetch booking", error);
            } finally {
                setLoading(false);
            }
        }
        fetchBooking();
    }, []);

    // === Tính stats tự động từ data ===
    const stats = useMemo(() => {
        const todayCount = data.length;
        const inProgressCount = data.filter(b => b.washSessionStatus === 'IN_PROGRESS').length;
        // Đếm các lịch hẹn có WashSession đã hoàn thành hoặc thanh toán (COMPLETED / PAID)
        const completedCount = data.filter(b =>
            b.washSessionStatus === 'PAID' || b.washSessionStatus === 'COMPLETED').length;
        return { todayCount, inProgressCount, completedCount };
    }, [data]);

    // === Helper: map booking status sang display ===
    // Đưa hàm này lên trên useMemo để có thể sử dụng bên trong useMemo
    const getStatusTag = (record) => {
        // 1. Ưu tiên kiểm tra trực tiếp qua washSessionStatus (dữ liệu trả về từ api /today-bookings)
        if (record.washSessionStatus) {
            if (record.washSessionStatus === 'IN_PROGRESS') return { label: 'Đang xử lý', color: 'processing' };
            if (record.washSessionStatus === 'PAID') return { label: 'Đã thanh toán', color: 'success' };
            if (record.washSessionStatus === 'COMPLETED' || record.washSessionStatus === 'COMPLETE') return { label: 'Hoàn thành', color: 'success' };
        }

        // 2. Dự phòng kiểm tra mảng washSessions nếu api trả về theo kiểu cũ hoặc chi tiết hơn
        const activeSession = record.washSessions?.find(s => s.status === 'IN_PROGRESS');
        const paidSession = record.washSessions?.find(s => s.status === 'PAID');
        const completedSession = record.washSessions?.find(s => s.status === 'COMPLETED' || s.status === 'COMPLETE');

        if (activeSession) return { label: 'Đang xử lý', color: 'processing' };
        if (paidSession) return { label: 'Đã thanh toán', color: 'success' };
        if (completedSession) return { label: 'Hoàn thành', color: 'success' };

        // 3. Cuối cùng, dựa vào booking status
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
        let result = [...data]; // Tạo bản sao để tránh thay đổi array gốc khi sort

        // Filter theo biển số xe
        if (searchText.trim()) {
            const search = searchText.toLowerCase();
            result = result.filter(b =>
                (b.vehicle?.licensePlate || '').toLowerCase().includes(search)
            );
        }

        // Filter theo trạng thái (so sánh trực tiếp với label hiển thị cho chuẩn xác)
        if (statusFilter !== 'all') {
            const statusMap = {
                'waiting': 'Đang chờ',
                'processing': 'Đang xử lý',
                'paid': 'Đã thanh toán',
                'completed': 'Hoàn thành',
                'cancelled': 'Đã hủy'
            };
            if (statusMap[statusFilter]) {
                result = result.filter(b => getStatusTag(b).label === statusMap[statusFilter]);
            }
        }

        // Sắp xếp theo thời gian (cái nào hẹn trước thì lên trên)
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
            title: 'Thời gian bắt đầu',
            key: 'time',
            render: (_, record) => {
                return record?.startTime?.substring(0, 5) || 'N/A';
            }
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => {
                const { label, color } = getStatusTag(record);
                return (
                    <Tag
                        color={color}
                        bordered={false}
                        style={{ fontWeight: 500, borderRadius: '6px', padding: '2px 8px' }}
                    >
                        {label}
                    </Tag>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => {
                return (
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
                );
            },
        },
    ];

    // Reset về trang 1 khi search/filter thay đổi
    useEffect(() => {
        setPagination(prev => ({ ...prev, current: 1 }));
    }, [searchText, statusFilter]);

    return (
        <div>
            <Row gutter={[24, 24]} className="dashboard__stats-row">
                <Col xs={24} sm={8}>
                    <Card className="stat-card" style={{ borderRadius: '16px' }}>
                        <Flex align="center" gap="large">
                            <div style={{ backgroundColor: '#fff7e6', padding: '16px', borderRadius: '16px', display: 'flex' }}>
                                <CalendarOutlined style={{ fontSize: '28px', color: '#fa8c16' }} />
                            </div>
                            <div>
                                <div style={{ color: '#8c8c8c', fontSize: '14px', marginBottom: '4px', fontWeight: 500 }}>Lịch hẹn hôm nay</div>
                                <div style={{ fontSize: '28px', fontWeight: 600, color: '#262626', lineHeight: 1 }}>{stats.todayCount}</div>
                            </div>
                        </Flex>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="stat-card" style={{ borderRadius: '16px' }}>
                        <Flex align="center" gap="large">
                            <div style={{ backgroundColor: '#e6f7ff', padding: '16px', borderRadius: '16px', display: 'flex' }}>
                                <CarOutlined style={{ fontSize: '28px', color: '#1890ff' }} />
                            </div>
                            <div>
                                <div style={{ color: '#8c8c8c', fontSize: '14px', marginBottom: '4px', fontWeight: 500 }}>Đang xử lý</div>
                                <div style={{ fontSize: '28px', fontWeight: 600, color: '#262626', lineHeight: 1 }}>{stats.inProgressCount}</div>
                            </div>
                        </Flex>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card className="stat-card" style={{ borderRadius: '16px' }}>
                        <Flex align="center" gap="large">
                            <div style={{ backgroundColor: '#f6ffed', padding: '16px', borderRadius: '16px', display: 'flex' }}>
                                <CheckCircleOutlined style={{ fontSize: '28px', color: '#52c41a' }} />
                            </div>
                            <div>
                                <div style={{ color: '#8c8c8c', fontSize: '14px', marginBottom: '4px', fontWeight: 500 }}>Đã hoàn thành</div>
                                <div style={{ fontSize: '28px', fontWeight: 600, color: '#262626', lineHeight: 1 }}>{stats.completedCount}</div>
                            </div>
                        </Flex>
                    </Card>
                </Col>
            </Row>

            <Card className="queue-card" style={{ marginTop: '24px' }}>
                <Flex justify="space-between" align="center" style={{ marginBottom: '20px' }}>
                    <Title level={4} style={{ margin: 0 }}>Danh sách hàng đợi</Title>
                    <Space>
                        <Input
                            placeholder="Tìm biển số xe..."
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            style={{ width: 250, borderRadius: '6px' }}
                            allowClear
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <Select
                            defaultValue="all"
                            style={{ width: 160 }}
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
                    <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
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
                    <Button key="close" onClick={() => setSelectedBooking(null)}>
                        Đóng
                    </Button>
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
                                {(() => {
                                    const { label } = getStatusTag(selectedBooking);
                                    return <Text strong>{label}</Text>;
                                })()}
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
                                <div key={idx} style={{ marginBottom: 8 }}>
                                    <Text strong>- {d.serviceName}</Text>
                                    <span style={{ float: 'right', fontWeight: 500 }}>
                                        {d.priceAtBooking ? Number(d.priceAtBooking).toLocaleString('vi-VN') + 'đ' : ''}
                                    </span>
                                </div>
                            ))}
                        </ul>
                    </div>
                )}
            </Modal>
        </div>
    )
}