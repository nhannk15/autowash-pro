import React, { useState, useRef, useEffect } from 'react';
import {
    Steps, Card, Input, Button, Table, Typography,
    Row, Col, Descriptions, Tag, Divider, Space, message
} from 'antd';
import {
    QrcodeOutlined, SearchOutlined, CarOutlined,
    UserOutlined, ToolOutlined, CheckCircleOutlined, ArrowLeftOutlined,
    IdcardOutlined, ScanOutlined, InfoCircleOutlined, EditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Checkin.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Mock data for UI demonstration
const mockCustomers = [
    {
        id: '1',
        qrCode: 'BOOKING-2026-0001',
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
        qrCode: 'BOOKING-2026-0002',
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
    const [qrCode, setQrCode] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [staffNote, setStaffNote] = useState('');
    const navigate = useNavigate();
    const qrInputRef = useRef(null);

    // Auto-focus the QR input field when stage 1 is active
    useEffect(() => {
        if (currentStep === 0 && qrInputRef.current) {
            qrInputRef.current.focus();
        }
    }, [currentStep]);

    const handleSearch = () => {
        if (!qrCode) {
            message.warning('Vui lòng quét mã QR hoặc nhập mã đặt lịch!');
            return;
        }

        // Tìm kiếm theo mã QR code
        const results = mockCustomers.filter(c =>
            c.qrCode.toLowerCase().includes(qrCode.toLowerCase())
        );
        setSearchResults(results);

        if (results.length === 0) {
            message.info('Không tìm thấy thông tin đặt lịch cho mã QR này.');
        }
    };

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        setStaffNote('');
        setCurrentStep(1);
    };

    const handleConfirm = () => {
        if (staffNote) {
            console.log('Staff note:', staffNote);
        }
        message.success('Đã xác nhận check-in! Bắt đầu dịch vụ.');
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
                    { title: 'Quét mã QR', icon: <QrcodeOutlined /> },
                    { title: 'Xác nhận Dịch vụ', icon: <IdcardOutlined /> }
                ]}
            />

            {/* GIAI ĐOẠN 1: Quét QR + Kết quả gộp chung 1 card */}
            {currentStep === 0 && (
                <Card
                    title={<span style={{ fontSize: 18 }}><QrcodeOutlined style={{ marginRight: 8 }} /> Quét Mã QR Đặt Lịch</span>}
                    className="checkin-card qr-scan-card"
                >
                    <div className="qr-scan-area">
                        <div className="qr-icon-wrapper">
                            <QrcodeOutlined />
                        </div>

                        <Title level={4} className="qr-status-text">Sẵn sàng quét mã QR</Title>
                        <Text className="qr-sub-text">Click vào ô bên dưới rồi dùng thiết bị quét mã QR</Text>

                        <div className="qr-input-wrapper">
                            <Input
                                ref={qrInputRef}
                                className="qr-input"
                                placeholder="Quét mã QR hoặc nhập mã đặt lịch tại đây..."
                                value={qrCode}
                                onChange={(e) => setQrCode(e.target.value)}
                                onPressEnter={handleSearch}
                                allowClear
                                prefix={<ScanOutlined />}
                            />
                        </div>

                        <div className="qr-scan-hint">
                            <InfoCircleOutlined />
                            <Text>Nhân viên click vào ô input, sau đó quét mã QR. Nội dung sẽ tự động được điền và tra cứu khi nhấn Enter.</Text>
                        </div>
                    </div>

                    {/* Bảng kết quả tra cứu ngay bên dưới */}
                    <div style={{ padding: 24 }}>
                        <Table
                            columns={columns}
                            dataSource={searchResults}
                            rowKey="id"
                            pagination={false}
                            locale={{ emptyText: 'Chưa có thông tin. Hãy quét mã QR hoặc nhập mã đặt lịch để bắt đầu.' }}
                            className="search-table"
                        />
                    </div>
                </Card>
            )}

            {/* GIAI ĐOẠN 2 */}
            {currentStep === 1 && selectedCustomer && (
                <Row gutter={[32, 24]}>
                    <Col xs={24} lg={16}>
                        <Card
                            className="checkin-card customer-info-card"
                            title={<span style={{ fontSize: 18, fontWeight: 600 }}><UserOutlined style={{ marginRight: 8 }} /> Hồ Sơ Dịch Vụ</span>}
                            extra={
                                <Button type="text" className="back-btn" onClick={() => setCurrentStep(0)}>
                                    <ArrowLeftOutlined /> Quay lại
                                </Button>
                            }
                        >
                            <Descriptions bordered column={1}>
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

                        {/* Staff Notes */}
                        <Card
                            className="checkin-card staff-notes-card"
                            title={<span><EditOutlined style={{ marginRight: 8 }} /> Ghi chú của nhân viên</span>}
                        >
                            <TextArea
                                className="staff-notes-textarea"
                                placeholder="Nhập ghi chú thêm cho lần check-in này (VD: Khách yêu cầu rửa kỹ gầm xe, xe có trầy xước sẵn ở cánh cửa trái...)"
                                value={staffNote}
                                onChange={(e) => setStaffNote(e.target.value)}
                                rows={4}
                                maxLength={500}
                                showCount
                            />
                        </Card>
                    </Col>

                    {/* Hóa Đơn Tạm Tính */}
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