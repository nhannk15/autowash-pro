import React, { useState, useRef, useEffect } from 'react';
import {
    Steps, Card, Input, Button, Table, Typography,
    Row, Col, Descriptions, Space, message
} from 'antd';
import {
    QrcodeOutlined,
    UserOutlined, CheckCircleOutlined, ArrowLeftOutlined,
    IdcardOutlined, ScanOutlined, InfoCircleOutlined, EditOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { searchBookingByQR, confirmBooking } from '../../../service/staffService';
import './Checkin.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function Checkin() {
    const [currentStep, setCurrentStep] = useState(0);
    const [qrCode, setQrCode] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [staffNote, setStaffNote] = useState('');
    const navigate = useNavigate();
    const qrInputRef = useRef(null);
    const { user } = useAuth();

    // Auto-focus the QR input field when stage 1 is active
    useEffect(() => {
        if (currentStep === 0 && qrInputRef.current) {
            qrInputRef.current.focus();
        }
    }, [currentStep]);

    const handleSearch = async () => {
        if (!qrCode) {
            message.warning('Vui lòng quét mã QR hoặc nhập mã đặt lịch!');
            return;
        }

        try {
            const response = await searchBookingByQR(qrCode);
            // Xử lý ApiResponse wrapper
            const data = Array.isArray(response) ? response
                : Array.isArray(response?.data) ? response.data
                    : response ? [response] : [];
            setSearchResults(data);

            if (data.length === 0) {
                message.info('Không tìm thấy thông tin đặt lịch cho mã QR này.');
            }
        } catch (error) {
            console.error('Failed to search booking by QR', error);
            message.error('Lỗi khi tìm kiếm thông tin đặt lịch!');
        }
    };

    const handleSelectCustomer = (record) => {
        setSelectedCustomer(record);
        setStaffNote('');
        setCurrentStep(1);
    };

    const handleConfirm = async () => {
        try {
            // staffId và bayId để backend tự lấy từ JWT và bookingId
            // Chỉ truyền bookingId và staffNote
            await confirmBooking(selectedCustomer.id, staffNote);
            message.success('Đã xác nhận check-in! Bắt đầu dịch vụ.');
            navigate('/staff/dashboard');
        } catch (error) {
            console.error('Failed to confirm booking', error);
            message.error('Lỗi khi xác nhận check-in!');
        }
    };

    // === Helper: Trích xuất dữ liệu từ booking record ===
    const getCustomerName = (record) => record.customer?.fullName || 'N/A';
    const getCustomerPhone = (record) => record.customer?.phoneNumber || 'N/A';
    const getCustomerEmail = (record) => record.customer?.email || '';

    // FIX: vehicle response dùng trực tiếp các field flat, không có nested vehicleType
    const getLicensePlate = (record) => record.vehicle?.licensePlate || 'N/A';
    const getVehicleModel = (record) => {
        const v = record.vehicle;
        return `${v?.brand || ''} ${v?.model || ''}`.trim() || 'N/A';
    };
    const getVehicleType = (record) => record.vehicle?.typeName || '';

    // FIX: washBay là string trực tiếp, không phải nested object
    const getBayName = (record) => record.washBay || 'Chưa phân khoang';

    // FIX: bookingDetails dùng field flat: serviceName, priceAtBooking
    const getServices = (record) => {
        return (record.bookingDetails || []).map((d, idx) => ({
            id: d.servicePriceId || idx,
            name: d.serviceName || 'Dịch vụ',
            price: Number(d.priceAtBooking || 0),
        }));
    };

    // FIX: promotion là flat field promotionName + discountAmount, không có nested object
    // Không còn nguy cơ trùng promotion
    const getPromotions = (record) => {
        return (record.bookingDetails || [])
            .filter(d => d.promotionName)
            .map((d, idx) => ({
                id: idx,
                name: d.promotionName,
                discount: Number(d.discountAmount || 0),
            }));
    };

    const columns = [
        {
            title: 'Phương tiện',
            key: 'vehicle',
            render: (_, record) => (
                <div className="vehicle-info-col">
                    <Text className="vehicle-plate">{getLicensePlate(record)}</Text>
                    <Text className="vehicle-model">{getVehicleModel(record)}</Text>
                </div>
            )
        },
        {
            title: 'Tên khách hàng',
            key: 'name',
            render: (_, record) => <Text strong>{getCustomerName(record)}</Text>
        },
        {
            title: 'Số điện thoại',
            key: 'phone',
            render: (_, record) => <Text>{getCustomerPhone(record)}</Text>
        },
        {
            title: 'Email',
            key: 'email',
            render: (_, record) => <Text>{getCustomerEmail(record)}</Text>
        },
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
        const services = getServices(selectedCustomer);
        const promotions = getPromotions(selectedCustomer);
        const subtotal = services.reduce((acc, curr) => acc + curr.price, 0);
        const discount = promotions.reduce((acc, curr) => acc + curr.discount, 0);
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
            {currentStep === 1 && selectedCustomer && (() => {
                const services = getServices(selectedCustomer);
                const promotions = getPromotions(selectedCustomer);

                return (
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
                                        <Text strong>{getCustomerName(selectedCustomer)}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số điện thoại">
                                        <Text strong>{getCustomerPhone(selectedCustomer)}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Email">
                                        <Text strong>{getCustomerEmail(selectedCustomer)}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Phương tiện">
                                        <div className="vehicle-info-col">
                                            <Text strong className="vehicle-plate">{getLicensePlate(selectedCustomer)}</Text>
                                            <Text className="vehicle-model">{getVehicleModel(selectedCustomer)}</Text>
                                        </div>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Khoang thực hiện">
                                        <Text strong>{getBayName(selectedCustomer)}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Dịch vụ đã chọn">
                                        <ul className="service-list">
                                            {services.map(s => (
                                                <li key={s.id} className="service-list-item">
                                                    <Text strong>{s.name}</Text>
                                                </li>
                                            ))}
                                        </ul>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Khuyến mãi áp dụng">
                                        {promotions.length > 0 ? (
                                            <Space direction="vertical" size="small">
                                                {promotions.map(p => (
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
                                    {services.map(s => (
                                        <Row justify="space-between" key={s.id} className="invoice-row">
                                            <Col><Text strong style={{ color: '#262626' }}>{s.name}</Text></Col>
                                            <Col><Text strong>{s.price.toLocaleString('vi-VN')} đ</Text></Col>
                                        </Row>
                                    ))}
                                </div>

                                {promotions.length > 0 && promotions.some(p => p.discount > 0) && (
                                    <>
                                        <div className="invoice-divider" />
                                        <div style={{ marginBottom: '24px' }}>
                                            <Text className="invoice-section-title">Khuyến mãi</Text>
                                            {promotions.filter(p => p.discount > 0).map(p => (
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
                );
            })()}
        </div>
    );
}