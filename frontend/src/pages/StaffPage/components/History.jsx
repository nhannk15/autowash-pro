import { useState } from "react";
import { Row, Col, Card, Flex, Space, Table, Button, Input, Tooltip, Typography } from "antd";
import {
    DollarCircleOutlined,
    CarOutlined,
    SearchOutlined,
    CaretLeftFilled,
    CaretRightFilled,
    EyeOutlined
} from "@ant-design/icons";
import "./History.css";

const { Title } = Typography;

export default function History() {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5; // Số dòng trên mỗi trang

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const columns = [
        {
            title: 'Thời gian',
            dataIndex: 'time',
            key: 'time',
        },
        {
            title: 'Thông tin xe',
            dataIndex: 'carInfo',
            key: 'carInfo',
            render: (text, record) => (
                <Flex vertical>
                    <span style={{ fontWeight: 500 }}>{text}</span>
                    <span style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.vehicleType}</span>
                </Flex>
            ),
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customer',
            key: 'customer',
            render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
        },
        {
            title: 'Dịch vụ',
            dataIndex: 'service',
            key: 'service',
        },
        {
            title: 'Giá tiền',
            dataIndex: 'price',
            key: 'price',
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

    const data = [
        { key: '1', carInfo: '74A-123.45', customer: 'Nguyễn Khắc Lê Nhân', service: 'Rửa chuyên sâu', price: '100.000', time: '14:00', vehicleType: 'Sedan 4 chỗ' },
        { key: '2', carInfo: '73A-111.22', customer: 'Đặng Nhất Thiên Bảo', service: 'Đánh bóng', price: '200.000', time: '15:00', vehicleType: 'SUV 7 chỗ' },
        { key: '3', carInfo: '73A-333.44', customer: 'Hồ Dương Nhật Quang', service: 'Hút bụi nội thất', price: '150.000', time: '16:00', vehicleType: 'Hatchback' },
        { key: '4', carInfo: '76A-555.66', customer: 'Trần Vương Quân', service: 'Rửa sáp Nano', price: '250.000', time: '17:00', vehicleType: 'Bán tải' },
        { key: '5', carInfo: '51A-777.88', customer: 'Giáo Làng', service: 'Dọn nội thất', price: '300.000', time: '18:00', vehicleType: 'Sedan 4 chỗ' },
        { key: '6', carInfo: '51B-123.45', customer: 'Nguyễn Văn A', service: 'Rửa chuyên sâu', price: '100.000', time: '19:00', vehicleType: 'Sedan 4 chỗ' },
        { key: '7', carInfo: '51C-678.90', customer: 'Trần Thị B', service: 'Phủ Ceramic', price: '400.000', time: '08:00', vehicleType: 'SUV 7 chỗ' },
        { key: '8', carInfo: '29A-333.33', customer: 'Lê Văn C', service: 'Vệ sinh khoang máy', price: '120.000', time: '09:00', vehicleType: 'Hatchback' },
        { key: '9', carInfo: '43A-444.44', customer: 'Phạm Văn D', service: 'Đánh bóng kính', price: '180.000', time: '10:00', vehicleType: 'Sedan 4 chỗ' },
        { key: '10', carInfo: '65A-555.55', customer: 'Hoàng Văn E', service: 'Rửa xe bọt tuyết', price: '130.000', time: '11:00', vehicleType: 'Bán tải' },
        { key: '11', carInfo: '15A-666.66', customer: 'Vũ Thị F', service: 'Dọn nội thất', price: '280.000', time: '13:00', vehicleType: 'Sedan 4 chỗ' },
    ];

    const totalPages = Math.ceil(data.length / pageSize) || 1;
    const getVisiblePages = () => {
        if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (currentPage === 1) return [1, 2, 3];
        if (currentPage === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
        return [currentPage - 1, currentPage, currentPage + 1];
    };

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
                                <div style={{ fontSize: '28px', fontWeight: 600, color: '#262626', lineHeight: 1 }}>3</div>
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
                                <div style={{ fontSize: '28px', fontWeight: 600, color: '#262626', lineHeight: 1 }}>{formatCurrency(3000000)}</div>
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
                        />
                    </Space>
                </Flex>
                <Table
                    columns={columns}
                    dataSource={data.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
                    pagination={false}
                />
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