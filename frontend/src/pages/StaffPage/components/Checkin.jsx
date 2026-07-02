import React, { useState, useRef, useEffect } from 'react';
import {
    Steps, Card, Input, Button, Table, Typography,
    Row, Col, Descriptions, Space, message, Tag
} from 'antd';
import {
    QrcodeOutlined,
    UserOutlined, SendOutlined, ArrowLeftOutlined,
    IdcardOutlined, ScanOutlined, InfoCircleOutlined, EditOutlined,
    CameraOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { searchBookingByQR, confirmBooking } from '../../../service/staffService';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './Checkin.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function Checkin() {
    const [currentStep, setCurrentStep] = useState(0);
    const [qrCode, setQrCode] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [staffNote, setStaffNote] = useState('');
    const [cameraOpen, setCameraOpen] = useState(false);
    const [scanning, setScanning] = useState(false);
    const navigate = useNavigate();
    const qrInputRef = useRef(null);
    const scannerRef = useRef(null);
    const scannerContainerRef = useRef(null);
    const { user } = useAuth();

    // Auto-focus the QR input field when stage 1 is active
    useEffect(() => {
        if (currentStep === 0 && qrInputRef.current) {
            qrInputRef.current.focus();
        }
    }, [currentStep]);

    const handleSearch = () => doSearch(qrCode);

    const handleSelectCustomer = (record) => {
        setSelectedCustomer(record);
        setStaffNote('');
        setCurrentStep(1);
    };

    const handleConfirm = async () => {
        try {
            await confirmBooking(selectedCustomer.id, staffNote);
            message.success('Đã xác nhận check-in! Bắt đầu dịch vụ.');
            navigate('/staff/dashboard');
        } catch (error) {
            console.error('Failed to confirm booking', error);
            message.error('Lỗi khi xác nhận check-in!');
        }
    };

    // ===== Camera Scanner =====
    const startCamera = () => setCameraOpen(true);

    useEffect(() => {
        if (!cameraOpen || !scannerContainerRef.current) return;

        if (scannerRef.current) {
            scannerRef.current.clear().catch(() => { });
            scannerRef.current = null;
        }

        const id = requestAnimationFrame(() => {
            const scanner = new Html5QrcodeScanner(
                'qr-camera-reader',
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    showTorchButtonIfSupported: true,
                    rememberLastUsedCamera: true,
                },
                false
            );

            scannerRef.current = scanner;
            setScanning(true);

            scanner.render(
                (decodedText) => {
                    setQrCode(decodedText);
                    message.success(`Đã quét: ${decodedText}`);
                    scanner.clear().catch(() => { });
                    scannerRef.current = null;
                    setCameraOpen(false);
                    setScanning(false);
                    doSearch(decodedText);
                },
                (errorMessage) => {
                    console.debug('QR:', errorMessage);
                }
            );
        });

        return () => cancelAnimationFrame(id);
    }, [cameraOpen]);

    const stopCamera = () => {
        if (scannerRef.current) {
            scannerRef.current.clear().catch(() => { });
            scannerRef.current = null;
        }
        setCameraOpen(false);
        setScanning(false);
    };

    // Cleanup khi unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(() => { });
            }
        };
    }, []);

    const doSearch = async (code) => {
        if (!code) {
            message.warning('Vui lòng quét mã QR hoặc nhập mã đặt lịch!');
            return;
        }
        try {
            const response = await searchBookingByQR(code);
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

    // === Helper: Trích xuất dữ liệu từ booking record ===
    const getCustomerName = (r) => r.customer?.fullName || 'N/A';
    const getCustomerPhone = (r) => r.customer?.phoneNumber || 'N/A';
    const getCustomerEmail = (r) => r.customer?.email || '';
    const getLicensePlate = (r) => r.vehicle?.licensePlate || 'N/A';
    const getVehicleModel = (r) => `${r.vehicle?.brand || ''} ${r.vehicle?.model || ''}`.trim() || 'N/A';
    const getVehicleType = (r) => r.vehicle?.typeName || '';
    const getBayName = (r) => r.washBay || 'Chưa phân khoang';

    const getServices = (record) =>
        (record.bookingDetails || []).map((d, idx) => ({
            id: d.servicePriceId || idx,
            name: d.serviceName || 'Dịch vụ',
            price: Number(d.priceAtBooking || 0),
        }));

    const getPromotions = (record) =>
        (record.bookingDetails || [])
            .filter(d => d.promotionName)
            .map((d, idx) => ({
                id: idx,
                name: d.promotionName,
                discount: Number(d.discountAmount || 0),
            }));

    const getBookingPromotion = (r) => r.promotion || null;
    const getBookingVoucher = (r) => r.billing?.voucher || null;
    const getDepositAmount = (r) => Number(r.billing?.depositAmount || 0);
    const getBillingFinalAmount = (r) => r.billing?.finalAmount != null ? Number(r.billing.finalAmount) : null;
    const getBillingDiscountAmount = (r) => Number(r.billing?.discountAmount || 0);

    const columns = [
        {
            title: 'Phương tiện',
            key: 'vehicle',
            render: (_, record) => (
                <div className="vehicle-info-col">
                    <Text className="vehicle-plate">{getLicensePlate(record)}</Text>
                    <Text className="vehicle-model">{getVehicleModel(record)}</Text>
                </div>
            ),
        },
        {
            title: 'Tên khách hàng',
            key: 'name',
            render: (_, record) => <Text strong>{getCustomerName(record)}</Text>,
        },
        {
            title: 'Số điện thoại',
            key: 'phone',
            render: (_, record) => <Text>{getCustomerPhone(record)}</Text>,
        },
        {
            title: 'Email',
            key: 'email',
            render: (_, record) => <Text>{getCustomerEmail(record)}</Text>,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Button type="primary" shape="round" onClick={() => handleSelectCustomer(record)}>
                    Tiếp theo <SendOutlined />
                </Button>
            ),
        },
    ];

    const calculateTotal = () => {
        if (!selectedCustomer) return 0;
        const billingFinal = getBillingFinalAmount(selectedCustomer);
        return billingFinal != null ? billingFinal : 0;
    };

    return (
        <div className="checkin-container">
            <div className="checkin-header">
                <Title level={2} className="checkin-title">
                    <ScanOutlined className="checkin-title-icon" />
                    Check-in
                </Title>
            </div>

            <Steps
                current={currentStep}
                className="checkin-steps"
                items={[
                    { title: 'Quét mã QR', icon: <QrcodeOutlined /> },
                    { title: 'Xác nhận Dịch vụ', icon: <IdcardOutlined /> },
                ]}
            />

            {/* GIAI ĐOẠN 1: Quét QR */}
            {currentStep === 0 && (
                <Card
                    title={<span><QrcodeOutlined style={{ marginRight: 8 }} /> Quét Mã QR Đặt Lịch</span>}
                    className="checkin-card qr-scan-card"
                >
                    <div className="qr-scan-area">
                        <div className="qr-icon-wrapper">
                            <QrcodeOutlined />
                        </div>

                        <Title level={4} className="qr-status-text">
                            {scanning ? 'Đang quét...' : 'Sẵn sàng quét mã QR'}
                        </Title>
                        <Text className="qr-sub-text">
                            {scanning
                                ? 'Đưa mã QR vào vùng camera, giữ khoảng cách 15-30cm'
                                : 'Click vào ô bên dưới rồi dùng thiết bị quét mã QR'}
                        </Text>

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

                        <div className="qr-action-buttons">
                            {!cameraOpen ? (
                                <Button
                                    className="camera-btn"
                                    icon={<CameraOutlined />}
                                    onClick={startCamera}
                                >
                                    Quét bằng Camera
                                </Button>
                            ) : (
                                <Button
                                    danger
                                    className="camera-btn camera-btn-close"
                                    icon={<CloseCircleOutlined />}
                                    onClick={stopCamera}
                                >
                                    Đóng Camera
                                </Button>
                            )}
                        </div>

                        {cameraOpen && (
                            <div className="camera-scanner-wrapper" ref={scannerContainerRef}>
                                <div id="qr-camera-reader" className="camera-reader" />
                            </div>
                        )}

                        <div className="qr-scan-hint">
                            <InfoCircleOutlined />
                            <Text>
                                Nhân viên click vào ô input, sau đó quét mã QR.
                                Nội dung sẽ tự động được điền và tra cứu khi nhấn Enter.
                            </Text>
                        </div>
                    </div>

                    <div className="search-results-wrapper">
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

            {/* GIAI ĐOẠN 2: Xác nhận dịch vụ */}
            {currentStep === 1 && selectedCustomer && (() => {
                const services = getServices(selectedCustomer);
                const promotions = getPromotions(selectedCustomer);
                const bookingPromotion = getBookingPromotion(selectedCustomer);
                const bookingVoucher = getBookingVoucher(selectedCustomer);
                const depositAmount = getDepositAmount(selectedCustomer);
                const billingDiscount = getBillingDiscountAmount(selectedCustomer);
                const promotionTotalDiscount = promotions.reduce((acc, p) => acc + p.discount, 0);
                const voucherDiscountAmount = Math.max(0, billingDiscount - promotionTotalDiscount);

                return (
                    <Row gutter={[32, 24]}>
                        <Col xs={24} lg={16}>
                            <Card
                                className="checkin-card customer-info-card"
                                title={<span><UserOutlined style={{ marginRight: 8 }} /> Hồ Sơ Dịch Vụ</span>}
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
                                        {bookingPromotion ? (
                                            <Space size="small">
                                                <Tag className="promotion-tag">{bookingPromotion.promotionName}</Tag>
                                                <Text className="text-promotion">
                                                    Giảm: {promotionTotalDiscount.toLocaleString('vi-VN')}đ
                                                </Text>
                                            </Space>
                                        ) : promotions.length > 0 ? (
                                            <Space size="small">
                                                {promotions.map(p => (
                                                    <Text key={p.id} strong className="text-promotion">{p.name}</Text>
                                                ))}
                                            </Space>
                                        ) : (
                                            <Text type="secondary">Không có khuyến mãi</Text>
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Voucher">
                                        {bookingVoucher ? (
                                            <Space>
                                                <Tag color="blue" className="text-voucher">{bookingVoucher.voucherCode}</Tag>
                                                <Text strong className="text-voucher">{bookingVoucher.rewardName}</Text>
                                            </Space>
                                        ) : (
                                            <Text type="secondary">Không có voucher</Text>
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Tiền cọc">
                                        {depositAmount > 0 ? (
                                            <Text className="text-deposit">
                                                Đã đặt cọc: {depositAmount.toLocaleString('vi-VN')}đ
                                            </Text>
                                        ) : (
                                            <Text type="secondary">Chưa đặt cọc</Text>
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
                                title="Hóa Đơn Tạm Tính"
                                className="invoice-card"
                            >
                                <div className="invoice-services-block">
                                    <Text className="invoice-section-title">Chi phí dịch vụ</Text>
                                    {services.map(s => (
                                        <Row justify="space-between" key={s.id} className="invoice-row">
                                            <Col><Text strong className="invoice-row-label">{s.name}</Text></Col>
                                            <Col><Text strong>{s.price.toLocaleString('vi-VN')} đ</Text></Col>
                                        </Row>
                                    ))}
                                </div>

                                <Row justify="space-between" align="middle">
                                    <Col><Text className="invoice-row-label">Tổng chi phí dịch vụ</Text></Col>
                                    <Col>
                                        <Text className="invoice-row-value">
                                            {services.reduce((acc, s) => acc + s.price, 0).toLocaleString('vi-VN')}đ
                                        </Text>
                                    </Col>
                                </Row>

                                {/* Khuyến mãi */}
                                {(bookingPromotion || promotions.length > 0) && promotionTotalDiscount > 0 && (
                                    <>
                                        <div className="invoice-divider" />
                                        <div className="invoice-promotion-block">
                                            <Text className="invoice-section-title">Khuyến mãi</Text>
                                            {bookingPromotion ? (
                                                <Row justify="space-between" className="invoice-row">
                                                    <Col><Text className="invoice-promotion-text">{bookingPromotion.promotionName}</Text></Col>
                                                    <Col><Text strong className="invoice-promotion-text">-{promotionTotalDiscount.toLocaleString('vi-VN')} đ</Text></Col>
                                                </Row>
                                            ) : (
                                                promotions.filter(p => p.discount > 0).map(p => (
                                                    <Row justify="space-between" key={p.id} className="invoice-row">
                                                        <Col><Text className="invoice-promotion-text">{p.name}</Text></Col>
                                                        <Col><Text strong className="invoice-promotion-text">-{p.discount.toLocaleString('vi-VN')} đ</Text></Col>
                                                    </Row>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* Voucher */}
                                {bookingVoucher && voucherDiscountAmount > 0 && (
                                    <>
                                        <div className="invoice-divider" />
                                        <div className="invoice-voucher-block">
                                            <Text className="invoice-section-title">Voucher</Text>
                                            <Row justify="space-between" className="invoice-row">
                                                <Col>
                                                    <Tag color="blue">{bookingVoucher.voucherCode}</Tag>
                                                    <Text className="invoice-voucher-text">{bookingVoucher.rewardName}</Text>
                                                </Col>
                                                <Col><Text strong className="invoice-voucher-text">-{voucherDiscountAmount.toLocaleString('vi-VN')} đ</Text></Col>
                                            </Row>
                                        </div>
                                    </>
                                )}

                                <div className="invoice-total-box">
                                    {depositAmount > 0 && (
                                        <Row justify="space-between" align="middle" className="invoice-deposit-row">
                                            <Col><Text className="invoice-deposit-label">Đã đặt cọc</Text></Col>
                                            <Col><Text className="invoice-deposit-value">{depositAmount.toLocaleString('vi-VN')}đ</Text></Col>
                                        </Row>
                                    )}
                                    <Row justify="space-between" align="middle">
                                        <Col><Text className="invoice-total-label">Tổng thanh toán</Text></Col>
                                        <Col>
                                            <Title level={2} className="invoice-total-amount">
                                                {calculateTotal().toLocaleString('vi-VN')}đ
                                            </Title>
                                        </Col>
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