import React, { useState } from 'react';
import {
    Steps, Card, Input, Button, Table, Typography,
    Row, Col, Descriptions, Tag, Divider, Space, message
} from 'antd';
import {
    CameraOutlined, SearchOutlined, CarOutlined,
    UserOutlined, ToolOutlined, CheckCircleOutlined, ArrowLeftOutlined,
    IdcardOutlined, ScanOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Checkin.css';

const { Title, Text } = Typography;

// Mock data for UI demonstration
const mockCustomers = [
    {
        id: '1',
        licensePlate: '30A-123.45',
        name: 'Nguyễn Văn A',
        phone: '0901234567',
        email: 'nguyenvana@gmail.com',
        vehicleModel: 'Toyota Vios 2022',
        services: [
            { id: 's1', name: 'Rửa xe bọt tuyết', price: 50000 },
            { id: 's2', name: 'Thay dầu động cơ', price: 450000 }
        ],
        promotions: [
            { id: 'p1', name: 'Giảm 10% rửa xe', discount: 5000 }
        ],
        bay: 'Khoang số 2'
    },
    {
        id: '2',
        licensePlate: '30A-999.99',
        name: 'Trần Thị B',
        phone: '0919999999',
        email: 'tranthib@gmail.com',
        vehicleModel: 'Honda CR-V 2023',
        services: [
            { id: 's3', name: 'Phủ Ceramic', price: 5000000 }
        ],
        promotions: [],
        bay: 'Khoang số 1'
    }
];

export default function Checkin() {
    const [currentStep, setCurrentStep] = useState(0);
    const [licensePlate, setLicensePlate] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const navigate = useNavigate();

    const handleSearch = () => {
        if (!licensePlate) {
            message.warning('Vui lòng nhập biển số xe!');
            return;
        }

        // Giả lập tìm kiếm theo biển số
        const results = mockCustomers.filter(c =>
            c.licensePlate.toLowerCase().includes(licensePlate.toLowerCase())
        );
        setSearchResults(results);

        if (results.length === 0) {
            message.info('Không tìm thấy thông tin khách hàng cho biển số này.');
        }
    };

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setCurrentStep(1); // Chuyển sang Giai đoạn 2
    };

    const handleConfirm = () => {
        message.success('Đã xác nhận check-in! Bắt đầu dịch vụ.');
        // Chuyển hướng về trang dashboard
        navigate('/staff/dashboard');
    };

    const columns = [
        {
            title: 'Phương tiện',
            key: 'vehicle',
            render: (_, record) => (
                <div className="vehicle-info-col">
                    <Text className="vehicle-plate">{record.licensePlate}</Text>
                    <Text className="vehicle-model">{record.vehicleModel}</Text>
                </div>
            )
        },
        { title: 'Tên khách hàng', dataIndex: 'name', key: 'name', render: (text) => <Text strong>{text}</Text> },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Button type="primary" shape="round" onClick={() => handleSelectCustomer(record)}>
                    Tiếp theo <CheckCircleOutlined />
                </Button>
            )
        }
    ];

    const calculateTotal = () => {
        if (!selectedCustomer) return 0;
        const subtotal = selectedCustomer.services.reduce((acc, curr) => acc + curr.price, 0);
        const discount = selectedCustomer.promotions.reduce((acc, curr) => acc + curr.discount, 0);
        return subtotal - discount;
    };

    return (
        <div className="checkin-container">
            <div className="checkin-header">
                <Title level={2} className="checkin-title">
                    <ScanOutlined style={{ color: '#1890ff', marginRight: '12px' }} />
                    Check-in
                </Title>
            </div>

            <Steps
                current={currentStep}
                className="checkin-steps"
                items={[
                    { title: 'Quét & Tra cứu biển số', icon: <CameraOutlined /> },
                    { title: 'Xác nhận Dịch vụ', icon: <IdcardOutlined /> }
                ]}
            />

            {/* GIAI ĐOẠN 1 */}
            {currentStep === 0 && (
                <Row gutter={[24, 32]}>
                    {/* Phần hiển thị Camera (Bố cục trên) */}
                    <Col span={24}>
                        <Card
                            title={<span style={{ fontSize: 18 }}><CameraOutlined /> Camera Nhận Diện Biển Số</span>}
                            className="checkin-card camera-card"
                        >
                            <div className="camera-view">
                                <div className="camera-frame">
                                    <Text className="camera-frame-text">Khung quét biển số</Text>
                                </div>

                                <Title level={4} className="camera-status-text">Hệ thống đang chờ quét...</Title>
                                <Text className="camera-sub-text">Camera đang hoạt động (Mock)</Text>

                                <Button
                                    type="primary"
                                    size="large"
                                    shape="round"
                                    className="camera-scan-btn"
                                    onClick={() => setLicensePlate('30A-123.45')}
                                >
                                    <ScanOutlined /> Giả lập AI quét thành công (30A-123.45)
                                </Button>
                            </div>
                        </Card>
                    </Col>

                    {/* Phần Tra cứu (Bố cục dưới) */}
                    <Col span={24}>
                        <Card className="checkin-card">
                            <div className="search-input-group">
                                <Input
                                    className="search-input"
                                    placeholder="Nhập biển số xe (VD: 30A-123.45) để tra cứu"
                                    value={licensePlate}
                                    onChange={(e) => setLicensePlate(e.target.value)}
                                    onPressEnter={handleSearch}
                                    allowClear
                                    prefix={<CarOutlined style={{ color: '#bfbfbf', marginRight: 8 }} />}
                                />
                                <Button
                                    type="primary"
                                    className="search-btn"
                                    onClick={handleSearch}
                                >
                                    <SearchOutlined /> Tra cứu thông tin
                                </Button>
                            </div>

                            <Table
                                columns={columns}
                                dataSource={searchResults}
                                rowKey="id"
                                pagination={false}
                                locale={{ emptyText: 'Chưa có thông tin. Hãy quét hoặc nhập biển số để bắt đầu.' }}
                                className="search-table"
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* GIAI ĐOẠN 2 */}
            {currentStep === 1 && selectedCustomer && (
                <Row gutter={[32, 32]}>
                    {/* Phần Thông Tin Hiển Thị Chiều Dọc */}
                    <Col xs={24} lg={16}>
                        <Card
                            className="checkin-card customer-info-card"
                            title={<span style={{ fontSize: 18, fontWeight: 600 }}><UserOutlined /> Hồ Sơ Dịch Vụ</span>}
                            extra={
                                <Button type="text" onClick={() => setCurrentStep(0)} style={{ fontWeight: 500 }}>
                                    <ArrowLeftOutlined /> Quay lại
                                </Button>
                            }
                        >
                            <Descriptions
                                bordered
                                column={1}
                            >
                                <Descriptions.Item label="Họ và tên khách hàng">
                                    <Text strong>{selectedCustomer.name}</Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Số điện thoại">
                                    <Text strong>{selectedCustomer.phone}</Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Email">
                                    <Text strong>{selectedCustomer.email}</Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Phương tiện">
                                    <div className="vehicle-info-col">
                                        <Text strong className="vehicle-plate">{selectedCustomer.licensePlate}</Text>
                                        <Text className="vehicle-model">{selectedCustomer.vehicleModel}</Text>
                                    </div>
                                </Descriptions.Item>

                                <Descriptions.Item label="Khoang thực hiện">
                                    <Text strong>{selectedCustomer.bay}</Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Dịch vụ đã chọn">
                                    <ul className="service-list">
                                        {selectedCustomer.services.map(s => (
                                            <li key={s.id} className="service-list-item">
                                                <Text strong>{s.name}</Text>
                                            </li>
                                        ))}
                                    </ul>
                                </Descriptions.Item>

                                <Descriptions.Item label="Khuyến mãi áp dụng">
                                    {selectedCustomer.promotions.length > 0 ? (
                                        <Space direction="vertical" size="small">
                                            {selectedCustomer.promotions.map(p => (
                                                <div key={p.id}>
                                                    <Text strong>{p.name}</Text>
                                                </div>
                                            ))}
                                        </Space>
                                    ) : (
                                        <Text type="secondary">Không có khuyến mãi nào được áp dụng</Text>
                                    )}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    {/* Phần Hóa Đơn Tạm Tính */}
                    <Col xs={24} lg={8}>
                        <Card
                            title={<span style={{ fontSize: 18, fontWeight: 600 }}>Hóa Đơn Tạm Tính</span>}
                            className="invoice-card"
                        >
                            <div style={{ marginBottom: '24px' }}>
                                <Text className="invoice-section-title">Chi phí dịch vụ</Text>
                                {selectedCustomer.services.map(s => (
                                    <Row justify="space-between" key={s.id} className="invoice-row">
                                        <Col><Text strong style={{ color: '#262626' }}>{s.name}</Text></Col>
                                        <Col><Text strong>{s.price.toLocaleString('vi-VN')} đ</Text></Col>
                                    </Row>
                                ))}
                            </div>

                            {selectedCustomer.promotions.length > 0 && (
                                <>
                                    <div className="invoice-divider" />
                                    <div style={{ marginBottom: '24px' }}>
                                        <Text className="invoice-section-title">Khuyến mãi</Text>
                                        {selectedCustomer.promotions.map(p => (
                                            <Row justify="space-between" key={p.id} className="invoice-row">
                                                <Col><Text style={{ color: '#52c41a' }}>{p.name}</Text></Col>
                                                <Col><Text strong style={{ color: '#52c41a' }}>-{p.discount.toLocaleString('vi-VN')} đ</Text></Col>
                                            </Row>
                                        ))}
                                    </div>
                                </>
                            )}

                            <div className="invoice-total-box">
                                <Row justify="space-between" align="middle">
                                    <Col><Text className="invoice-total-label">Tổng thanh toán</Text></Col>
                                    <Col><Title level={2} className="invoice-total-amount">{calculateTotal().toLocaleString('vi-VN')} đ</Title></Col>
                                </Row>
                            </div>

                            <Button
                                type="primary"
                                block
                                className="confirm-btn"
                                onClick={handleConfirm}
                            >
                                Xác nhận & Bắt đầu
                            </Button>
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
}