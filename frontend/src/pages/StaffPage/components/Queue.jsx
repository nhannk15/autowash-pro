import { useState, useEffect, useMemo } from "react";
import { Row, Col, Card, Flex, Space, Table, Tag, Button, Input, Select, Tooltip, Typography, Spin } from "antd";
import {
    CalendarOutlined,
    CarOutlined,
    CheckCircleOutlined,
    SearchOutlined,
    PlayCircleOutlined,
    CaretLeftFilled,
    CaretRightFilled
} from "@ant-design/icons";
import { getAllBookings } from "../../../service/staffService";
import "./Queue.css";

const { Title } = Typography;

export default function Queue() {
    const [currentPage, setCurrentPage] = useState(1);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const pageSize = 5;

    useEffect(() => {
        async function fetchBooking() {
            try {
                const response = await getAllBookings();
                const bookings = Array.isArray(response) ? response : (response?.data || []);
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
        const inProgressCount = data.filter(b => b.status === 'IN_PROGRESS' || b.washSessions?.some(s => s.status === 'IN_PROGRESS')).length;
        const completedCount = data.filter(b => b.status === 'COMPLETED').length;
        return { todayCount, inProgressCount, completedCount };
    }, [data]);

    // === Filter data theo search + status ===
    const filteredData = useMemo(() => {
        let result = data;

        // Filter theo biển số xe
        if (searchText.trim()) {
            const search = searchText.toLowerCase();
            result = result.filter(b =>
                (b.vehicle?.licensePlate || '').toLowerCase().includes(search)
            );
        }

        // Filter theo trạng thái
        if (statusFilter !== 'all') {
            if (statusFilter === 'waiting') {
                result = result.filter(b => b.status === 'CONFIRMED');
            } else if (statusFilter === 'processing') {
                result = result.filter(b =>
                    b.status === 'IN_PROGRESS' || b.washSessions?.some(s => s.status === 'IN_PROGRESS')
                );
            }
        }

        return result;
    }, [data, searchText, statusFilter]);

    // === Helper: map booking status sang display ===
    const getStatusTag = (record) => {
        // Kiểm tra washSession trước
        const activeSession = record.washSessions?.find(s => s.status === 'IN_PROGRESS');
        const completedSession = record.washSessions?.find(s => s.status === 'COMPLETED' || s.status === 'COMPLETE');

        if (activeSession) return { label: 'Đang xử lý', color: 'processing' };
        if (completedSession) return { label: 'Hoàn thành', color: 'success' };

        // Dựa vào booking status
        switch (record.status) {
            case 'CONFIRMED': return { label: 'Đang chờ', color: 'warning' };
            case 'COMPLETED': return { label: 'Hoàn thành', color: 'success' };
            case 'CANCELLED': return { label: 'Đã hủy', color: 'error' };
            case 'NO_SHOW': return { label: 'Không đến', color: 'default' };
            default: return { label: record.status || 'N/A', color: 'default' };
        }
    };

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
                const services = record.bookingDetails?.map(d => d.servicePrice?.service?.name).filter(Boolean);
                return services?.join(', ') || 'N/A';
            }
        },
        {
            title: 'Thời gian',
            key: 'time',
            render: (_, record) => {
                const slot = record.availableSlots?.[0];
                return slot?.timeSlot?.startTime?.substring(0, 5) || 'N/A';
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
                const { label } = getStatusTag(record);
                if (label !== 'Đang chờ') return null;
                return (
                    <Space size="small">
                        <Tooltip title="Bắt đầu dịch vụ">
                            <Button type="primary" icon={<PlayCircleOutlined />} ghost size="small">
                                Bắt đầu
                            </Button>
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    // Tính toán phân trang hiển thị tối đa 3 số
    const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
    const getVisiblePages = () => {
        if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (currentPage === 1) return [1, 2, 3];
        if (currentPage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
        return [currentPage - 1, currentPage, currentPage + 1];
    };

    // Reset page khi filter thay đổi
    useEffect(() => {
        setCurrentPage(1);
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
                            ]}
                        />
                    </Space>
                </Flex>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}><Spin size="large" /></div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                        pagination={false}
                        rowKey="id"
                    />
                )}
            </Card>

            {/* Phân trang tự thiết kế để giới hạn đúng 3 số một lần */}
            {totalPages > 1 && (
                <Flex justify="flex-end" style={{ marginTop: '20px' }}>
                    <Space size="small">
                        <Button
                            className="custom-pagination-btn"
                            icon={<CaretLeftFilled />}
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        />
                        {getVisiblePages().map(page => (
                            <Button
                                className="custom-pagination-btn"
                                key={page}
                                type={currentPage === page ? "primary" : "default"}
                                onClick={() => setCurrentPage(page)}
                                style={{ minWidth: '32px', padding: '0 8px' }}
                            >
                                {page}
                            </Button>
                        ))}
                        <Button
                            className="custom-pagination-btn"
                            icon={<CaretRightFilled />}
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        />
                    </Space>
                </Flex>
            )}
        </div>
    )
}