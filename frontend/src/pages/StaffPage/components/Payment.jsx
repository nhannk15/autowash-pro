import React, { useState, useEffect } from 'react';
import {
    Steps, Card, Input, Button, Typography,
    Row, Col, Descriptions, Space, message, Result, Tag, Empty, Spin, Radio, Divider
} from 'antd';
import {
    CreditCardOutlined, CheckCircleOutlined, ArrowLeftOutlined,
    GiftOutlined, QrcodeOutlined, DollarOutlined,
    UserOutlined, CarOutlined, TagOutlined, MoneyCollectOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getBillByBookingId, validateVoucher, confirmPaymentByCash, confirmPaymentByBank } from '../../../service/staffService';
import './Payment.css';

const { Title, Text } = Typography;

export default function StaffPayment() {
    const [currentStep, setCurrentStep] = useState(0);
    const [voucherCode, setVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [isPaymentReceived, setIsPaymentReceived] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('QR'); // 'QR' hoặc 'CASH'
    const [billData, setBillData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false); // loading riêng cho lúc xác nhận thanh toán
    const navigate = useNavigate();
    const location = useLocation();

    // Nhận data từ Dashboard
    const bayId = location.state?.bayId || null;
    const bookingId = location.state?.bookingId || null;
    const sessionId = location.state?.sessionId || null;

    useEffect(() => {
        async function getBill() {
            // Cần bookingId hoặc sessionId để fetch bill
            const id = bookingId;
            if (!id) return;
            setLoading(true);
            try {
                const response = await getBillByBookingId(id);
                // API trả về mảng List<BillingResponse>, lấy phần tử đầu tiên
                const data = Array.isArray(response) ? response[0] : response;
                setBillData(data);
            } catch (error) {
                console.error("Failed to fetch bill", error);
                message.error('Không thể tải thông tin hóa đơn!');
            } finally {
                setLoading(false);
            }
        }
        getBill();
    }, [bookingId]);

    // Nếu đang loading
    if (loading) {
        return (
            <div className="payment-container" style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" tip="Đang tải hóa đơn..." />
            </div>
        );
    }

    // Nếu không có data (truy cập trực tiếp từ sidebar) → hiển empty state
    if (!billData) {
        return (
            <div className="payment-container">
                <div className="payment-header">
                    <Title level={2} className="payment-title">
                        <CreditCardOutlined style={{ color: '#1890ff', marginRight: '12px' }} />
                        Thanh Toán
                    </Title>
                </div>
                <Card className="payment-card" style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Empty
                        description={
                            <Space direction="vertical" size="small">
                                <Text strong style={{ fontSize: 16 }}>Chưa có hóa đơn nào được chọn</Text>
                                <Text type="secondary">
                                    Vui lòng quay lại Dashboard và bấm nút "Thanh toán" trên khoang đã hoàn thành dịch vụ.
                                </Text>
                            </Space>
                        }
                    >
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => navigate('/staff/dashboard')}
                            style={{ borderRadius: 8, fontWeight: 600 }}
                        >
                            Quay lại Dashboard
                        </Button>
                    </Empty>
                </Card>
            </div>
        );
    }

    // === Trích xuất dữ liệu từ billData (mapping từ API response) ===
    // Thông tin khách hàng
    const customer = billData.booking?.customer || billData.session?.customer || billData.customer || {};
    const customerName = customer.fullName || customer.name || 'Khách vãng lai';
    const customerPhone = customer.phoneNumber || customer.phone || 'N/A';
    const customerEmail = customer.email || '';

    // Thông tin xe
    const vehicle = billData.booking?.vehicle || billData.session?.vehicle || billData.vehicle || {};
    const licensePlate = vehicle.licensePlate || 'N/A';
    const vehicleModel = `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'N/A';

    // Thông tin khoang
    const bayName = billData.booking?.washBay || billData.session?.bay?.name || billData.bay || 'N/A';

    // Thông tin dịch vụ - từ billData.booking.bookingDetails
    const services = [];
    if (billData.booking?.bookingDetails) {
        billData.booking.bookingDetails.forEach(s => {
            services.push({
                id: s.servicePriceId || Math.random(),
                name: s.serviceName || 'Dịch vụ',
                price: Number(s.priceAtBooking) || 0,
            });
        });
    } else if (billData.session?.servicePrice) {
        services.push({
            id: billData.session.servicePrice.id || 1,
            name: billData.session.servicePrice.service?.name || 'Dịch vụ',
            price: Number(billData.session.servicePrice.price) || 0,
        });
    } else if (billData.services) {
        billData.services.forEach(s => {
            services.push({
                id: s.id,
                name: s.name || s.service?.name || 'Dịch vụ',
                price: Number(s.price) || 0,
            });
        });
    }

    // Thời gian check-in
    const checkinTime = billData.booking?.startTime
        ? new Date(`1970-01-01T${billData.booking.startTime}Z`).toLocaleTimeString('vi-VN')
        : (billData.session?.startTime
            ? new Date(billData.session.startTime).toLocaleString('vi-VN')
            : (billData.checkinTime || 'N/A'));

    // Mã hóa đơn
    const billId = billData.billingId || billData.id || 'N/A';

    // Ghi chú nhân viên
    const staffNote = billData.booking?.notes || billData.session?.note || billData.staffNote || '';

    // Khuyến mãi đã áp dụng từ check-in
    // FIX: API thực tế trả promotionName + discountAmount nằm trong từng item của
    // booking.bookingDetails, không có field promotionUsages/promotions ở root.
    const promotions = billData.booking?.bookingDetails
        ?.filter(s => s.promotionName && Number(s.discountAmount) > 0)
        .map(s => ({
            id: s.servicePriceId,
            name: s.promotionName,
            discountAmount: s.discountAmount
        }))
        || billData.promotionUsages
        || billData.promotions
        || [];

    // === Tính tiền ===
    const subtotal = billData.originalAmount
        ? Number(billData.originalAmount)
        : services.reduce((acc, s) => acc + s.price, 0);

    const promotionDiscount = billData.discountAmount
        ? Number(billData.discountAmount)
        : promotions.reduce((acc, p) => acc + (Number(p.discountAmount) || Number(p.discount) || 0), 0);

    // Voucher discount từ API response (đã được backend tính sẵn)
    const voucherDiscount = appliedVoucher?.discountAmount ? Number(appliedVoucher.discountAmount) : 0;

    const finalTotal = billData.finalAmount
        ? Number(billData.finalAmount) - voucherDiscount
        : subtotal - promotionDiscount - voucherDiscount;

    // Áp dụng voucher
    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) {
            message.warning('Vui lòng nhập mã voucher!');
            return;
        }

        try {
            const response = await validateVoucher(voucherCode.trim(), subtotal - promotionDiscount);
            const voucherData = response?.data || response;

            if (voucherData) {
                setAppliedVoucher(voucherData);
                message.success(`Áp dụng thành công: ${voucherData.name || voucherData.voucherCode || voucherCode}`);
            } else {
                message.error('Mã voucher không hợp lệ hoặc đã hết hạn!');
            }
        } catch (error) {
            console.error('Failed to validate voucher', error);
            const errorMsg = error.response?.data?.message || 'Mã voucher không hợp lệ hoặc đã hết hạn!';
            message.error(errorMsg);
        }
    };

    // Xóa voucher
    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setVoucherCode('');
        message.info('Đã xóa voucher.');
    };

    // Chuyển sang bước thanh toán
    const handleProceedPayment = () => {
        setCurrentStep(1);
    };

    // FIX: Gọi API thật theo đúng phương thức thanh toán (CASH/QR-bank),
    // thay cho logic mock cũ và tên function sai (confirmPaymentAPI không tồn tại).
    const handlePayment = async () => {
        if (!bookingId) {
            message.error('Không xác định được booking để xác nhận thanh toán!');
            return;
        }

        setConfirming(true);
        try {
            if (paymentMethod === 'CASH') {
                await confirmPaymentByCash(bookingId);
            } else {
                await confirmPaymentByBank(bookingId);
            }

            setIsPaymentReceived(true);
            message.success(paymentMethod === 'CASH' ? 'Đã thu tiền mặt thành công!' : 'Thanh toán QR thành công!');

            // Tắt loading ngay khi đã xác nhận xong, tránh treo nút trong lúc
            // hiển thị màn hình Result và chờ chuyển trang.
            setConfirming(false);

            setTimeout(() => {
                // Quay về Dashboard với paidBayId và paidBookingId để giải phóng bay & update UI
                if (bayId) {
                    navigate('/staff/dashboard', { state: { paidBayId: bayId, paidBookingId: bookingId } });
                } else {
                    navigate('/staff/history');
                }
            }, 2500);
        } catch (error) {
            console.error("Failed to confirm payment", error);
            const errorMsg = error.response?.data?.message || 'Lỗi khi cập nhật trạng thái thanh toán!';
            message.error(errorMsg);
            setConfirming(false);
        }
    };

    return (
        <div className="payment-container">
            <div className="payment-header">
                <Title level={2} className="payment-title">
                    <CreditCardOutlined style={{ color: '#1890ff', marginRight: '12px' }} />
                    Thanh Toán
                </Title>
            </div>

            <Steps
                current={currentStep}
                className="payment-steps"
                items={[
                    { title: 'Xác nhận hóa đơn', icon: <DollarOutlined /> },
                    { title: 'Thanh toán', icon: <QrcodeOutlined /> }
                ]}
            />

            {/* GIAI ĐOẠN 1: Bill tạm tính + Voucher */}
            {currentStep === 0 && (
                <Row gutter={[32, 24]}>
                    {/* Bill tạm tính */}
                    <Col xs={24} lg={16}>
                        <Card
                            className="payment-card"
                            title={
                                <span style={{ fontSize: 18, fontWeight: 600 }}>
                                    <DollarOutlined style={{ marginRight: 8 }} />
                                    Hóa Đơn Tạm Tính
                                </span>
                            }
                        >
                            {/* Thông tin khách hàng */}
                            <div className="payment-section">
                                <Text className="payment-section-label">
                                    <UserOutlined style={{ marginRight: 6 }} /> Thông tin khách hàng
                                </Text>
                                <Descriptions bordered column={1} size="small" className="payment-descriptions">
                                    <Descriptions.Item label="Họ và tên">
                                        <Text strong>{customerName}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số điện thoại">
                                        <Text>{customerPhone}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Phương tiện">
                                        <Text strong>{licensePlate}</Text>
                                        <br />
                                        <Text type="secondary">{vehicleModel}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Khoang">
                                        <Text>{bayName}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Thời gian check-in">
                                        <Text>{checkinTime}</Text>
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>

                            {/* Chi tiết dịch vụ */}
                            <div className="payment-section">
                                <Text className="payment-section-label">
                                    <CarOutlined style={{ marginRight: 6 }} /> Chi tiết dịch vụ
                                </Text>
                                <div className="payment-service-list">
                                    {services.map(s => (
                                        <Row justify="space-between" key={s.id} className="payment-service-row">
                                            <Col><Text>{s.name}</Text></Col>
                                            <Col><Text strong>{s.price.toLocaleString('vi-VN')} đ</Text></Col>
                                        </Row>
                                    ))}
                                    <div className="payment-subtotal-row">
                                        <Row justify="space-between">
                                            <Col><Text strong>Tạm tính</Text></Col>
                                            <Col><Text strong>{subtotal.toLocaleString('vi-VN')} đ</Text></Col>
                                        </Row>
                                    </div>
                                </div>
                            </div>

                            {/* Khuyến mãi đã áp dụng từ check-in */}
                            {promotions.length > 0 && (
                                <div className="payment-section">
                                    <Text className="payment-section-label">
                                        <TagOutlined style={{ marginRight: 6 }} /> Khuyến mãi đã áp dụng
                                    </Text>
                                    {promotions.map((p, idx) => (
                                        <Row justify="space-between" key={p.id || idx} className="payment-promo-row">
                                            <Col><Text style={{ color: '#52c41a' }}>{p.name || p.promotionName || 'Khuyến mãi'}</Text></Col>
                                            <Col><Text strong style={{ color: '#52c41a' }}>-{(Number(p.discountAmount) || Number(p.discount) || 0).toLocaleString('vi-VN')} đ</Text></Col>
                                        </Row>
                                    ))}
                                </div>
                            )}

                            {/* Voucher đã áp dụng */}
                            {appliedVoucher && (
                                <div className="payment-section">
                                    <Text className="payment-section-label">
                                        <GiftOutlined style={{ marginRight: 6 }} /> Voucher đã áp dụng
                                    </Text>
                                    <Row justify="space-between" className="payment-voucher-applied-row">
                                        <Col>
                                            <Tag color="blue">{voucherCode.toUpperCase()}</Tag>
                                            <Text style={{ color: '#1890ff' }}>{appliedVoucher.name || appliedVoucher.voucherCode}</Text>
                                        </Col>
                                        <Col><Text strong style={{ color: '#1890ff' }}>-{voucherDiscount.toLocaleString('vi-VN')} đ</Text></Col>
                                    </Row>
                                </div>
                            )}

                            {/* Tổng cộng */}
                            <div className="payment-total-box">
                                <Row justify="space-between" align="middle">
                                    <Col><Text className="payment-total-label">Tổng thanh toán</Text></Col>
                                    <Col>
                                        <Title level={2} className="payment-total-amount">
                                            {Math.max(0, finalTotal).toLocaleString('vi-VN')} đ
                                        </Title>
                                    </Col>
                                </Row>
                            </div>

                            {/* Staff note */}
                            {staffNote && (
                                <div className="payment-note">
                                    <Text type="secondary">
                                        <strong>Ghi chú:</strong> {staffNote}
                                    </Text>
                                </div>
                            )}
                        </Card>
                    </Col>

                    {/* Voucher + Nút thanh toán */}
                    <Col xs={24} lg={8}>
                        <Card
                            className="payment-card voucher-card"
                            title={
                                <span style={{ fontSize: 18, fontWeight: 600 }}>
                                    <GiftOutlined style={{ marginRight: 8 }} /> Mã Voucher
                                </span>
                            }
                        >
                            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                                Nhập mã voucher nếu khách hàng có, để áp dụng thêm ưu đãi.
                            </Text>

                            <Input
                                className="voucher-input"
                                placeholder="Nhập mã voucher..."
                                value={voucherCode}
                                onChange={(e) => setVoucherCode(e.target.value)}
                                onPressEnter={handleApplyVoucher}
                                disabled={!!appliedVoucher}
                                prefix={<GiftOutlined style={{ color: '#bfbfbf' }} />}
                                allowClear
                            />

                            {!appliedVoucher ? (
                                <Button
                                    type="primary"
                                    block
                                    className="voucher-apply-btn"
                                    onClick={handleApplyVoucher}
                                    disabled={!voucherCode.trim()}
                                >
                                    Áp dụng voucher
                                </Button>
                            ) : (
                                <Button
                                    block
                                    danger
                                    className="voucher-remove-btn"
                                    onClick={handleRemoveVoucher}
                                >
                                    Xóa voucher
                                </Button>
                            )}

                            {appliedVoucher && (
                                <div className="voucher-applied-info">
                                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                    <Text strong style={{ color: '#52c41a' }}>
                                        Đã áp dụng: {appliedVoucher.name || appliedVoucher.voucherCode}
                                    </Text>
                                </div>
                            )}
                        </Card>

                        {/* Nút thanh toán */}
                        <Card className="payment-card payment-action-card">
                            <div className="payment-action-summary">
                                <Row justify="space-between" align="middle">
                                    <Col><Text strong style={{ fontSize: 16 }}>Cần thanh toán</Text></Col>
                                    <Col>
                                        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                                            {Math.max(0, finalTotal).toLocaleString('vi-VN')} đ
                                        </Title>
                                    </Col>
                                </Row>
                            </div>
                            <Button
                                type="primary"
                                block
                                size="large"
                                className="payment-proceed-btn"
                                onClick={handleProceedPayment}
                            >
                                <CreditCardOutlined /> Tiến hành thanh toán
                            </Button>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* GIAI ĐOẠN 2: Bill cuối + QR thanh toán */}
            {currentStep === 1 && (
                <Row gutter={[32, 24]}>
                    {/* Bill cuối cùng */}
                    <Col xs={24} lg={14}>
                        <Card
                            className="payment-card"
                            title={
                                <span style={{ fontSize: 18, fontWeight: 600 }}>
                                    <DollarOutlined style={{ marginRight: 8 }} />
                                    Hóa Đơn Thanh Toán
                                </span>
                            }
                            extra={
                                <Button type="text" className="back-btn" onClick={() => setCurrentStep(0)}>
                                    <ArrowLeftOutlined /> Quay lại
                                </Button>
                            }
                        >
                            <div className="final-bill-header">
                                <Text type="secondary">Mã hóa đơn: <Text strong>{billId}</Text></Text>
                            </div>

                            {/* Khách hàng */}
                            <Descriptions bordered column={1} size="small" className="payment-descriptions" style={{ marginBottom: 24 }}>
                                <Descriptions.Item label="Khách hàng">
                                    <Text strong>{customerName}</Text> — {customerPhone}
                                </Descriptions.Item>
                                <Descriptions.Item label="Phương tiện">
                                    <Text strong>{licensePlate}</Text>
                                    <Text type="secondary" style={{ marginLeft: 8 }}>{vehicleModel}</Text>
                                </Descriptions.Item>
                            </Descriptions>

                            {/* Chi tiết */}
                            <div className="payment-service-list">
                                <Text className="payment-section-label" style={{ marginBottom: 12, display: 'block' }}>Chi tiết dịch vụ</Text>
                                {services.map(s => (
                                    <Row justify="space-between" key={s.id} className="payment-service-row">
                                        <Col><Text>{s.name}</Text></Col>
                                        <Col><Text strong>{s.price.toLocaleString('vi-VN')} đ</Text></Col>
                                    </Row>
                                ))}
                            </div>

                            {/* Giảm giá */}
                            {(promotions.length > 0 || appliedVoucher) && (
                                <div className="payment-discount-section">
                                    <Text className="payment-section-label" style={{ marginBottom: 12, display: 'block' }}>Giảm giá</Text>
                                    {promotions.map((p, idx) => (
                                        <Row justify="space-between" key={p.id || idx} className="payment-promo-row">
                                            <Col><Text style={{ color: '#52c41a' }}>{p.name || p.promotionName || 'Khuyến mãi'}</Text></Col>
                                            <Col><Text strong style={{ color: '#52c41a' }}>-{(Number(p.discountAmount) || Number(p.discount) || 0).toLocaleString('vi-VN')} đ</Text></Col>
                                        </Row>
                                    ))}
                                    {appliedVoucher && (
                                        <Row justify="space-between" className="payment-promo-row">
                                            <Col>
                                                <Tag color="blue" style={{ marginRight: 4 }}>{voucherCode.toUpperCase()}</Tag>
                                                <Text style={{ color: '#1890ff' }}>{appliedVoucher.name || appliedVoucher.voucherCode}</Text>
                                            </Col>
                                            <Col><Text strong style={{ color: '#1890ff' }}>-{voucherDiscount.toLocaleString('vi-VN')} đ</Text></Col>
                                        </Row>
                                    )}
                                </div>
                            )}

                            {/* Tổng cuối */}
                            <div className="payment-final-total-box">
                                <Row justify="space-between" align="middle">
                                    <Col><Text className="payment-final-total-label">TỔNG THANH TOÁN</Text></Col>
                                    <Col>
                                        <Title level={2} className="payment-final-total-amount">
                                            {Math.max(0, finalTotal).toLocaleString('vi-VN')} đ
                                        </Title>
                                    </Col>
                                </Row>
                            </div>
                        </Card>
                    </Col>

                    {/* Phần thanh toán (QR / Tiền mặt) */}
                    <Col xs={24} lg={10}>
                        <Card className="payment-card qr-payment-card">
                            {!isPaymentReceived ? (
                                <div className="qr-payment-area">
                                    <Title level={4} style={{ marginBottom: 16, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        Phương thức thanh toán
                                    </Title>

                                    <Radio.Group
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        buttonStyle="solid"
                                        style={{ width: '100%', marginBottom: 24, display: 'flex' }}
                                    >
                                        <Radio.Button value="QR" style={{ flex: 1, textAlign: 'center' }}>
                                            <QrcodeOutlined /> Chuyển khoản QR
                                        </Radio.Button>
                                        <Radio.Button value="CASH" style={{ flex: 1, textAlign: 'center' }}>
                                            <MoneyCollectOutlined /> Tiền mặt
                                        </Radio.Button>
                                    </Radio.Group>

                                    {paymentMethod === 'QR' ? (
                                        <>
                                            <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
                                                Khách hàng quét mã QR bên dưới để thanh toán
                                            </Text>

                                            {/* QR Code placeholder */}
                                            <div className="qr-code-placeholder">
                                                <QrcodeOutlined style={{ fontSize: 120, color: '#262626' }} />
                                            </div>

                                            <div className="qr-amount-display">
                                                <Text type="secondary">Số tiền cần thanh toán</Text>
                                                <Title level={3} style={{ margin: '4px 0 0', color: '#1890ff' }}>
                                                    {Math.max(0, finalTotal).toLocaleString('vi-VN')} đ
                                                </Title>
                                            </div>

                                            <Text type="secondary" style={{ fontSize: 13, marginTop: 16, display: 'block', textAlign: 'center' }}>
                                                Hệ thống sẽ tự động xác nhận khi nhận được thanh toán
                                            </Text>

                                            {/* Nút giả lập QR */}
                                            <Button
                                                type="dashed"
                                                block
                                                className="simulate-payment-btn"
                                                onClick={handlePayment}
                                                loading={confirming}
                                            >
                                                <CheckCircleOutlined /> Giả lập: Đã nhận chuyển khoản
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
                                                Thu tiền mặt trực tiếp từ khách hàng
                                            </Text>

                                            <div className="qr-code-placeholder" style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
                                                <MoneyCollectOutlined style={{ fontSize: 120, color: '#52c41a' }} />
                                            </div>

                                            <div className="qr-amount-display">
                                                <Text type="secondary">Số tiền cần thu</Text>
                                                <Title level={3} style={{ margin: '4px 0 0', color: '#52c41a' }}>
                                                    {Math.max(0, finalTotal).toLocaleString('vi-VN')} đ
                                                </Title>
                                            </div>

                                            <Divider dashed style={{ margin: '16px 0' }} />

                                            {/* Nút xác nhận thu tiền mặt */}
                                            <Button
                                                type="primary"
                                                block
                                                size="large"
                                                icon={<CheckCircleOutlined />}
                                                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                                                onClick={handlePayment}
                                                loading={confirming}
                                            >
                                                Xác nhận đã thu tiền mặt
                                            </Button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <Result
                                    status="success"
                                    title="Thanh toán thành công!"
                                    subTitle={`Hóa đơn ${billId} — ${Math.max(0, finalTotal).toLocaleString('vi-VN')} đ`}
                                    extra={
                                        <Text type="secondary">
                                            {bayId ? 'Đang chuyển đến Dashboard...' : 'Đang chuyển đến lịch sử...'}
                                        </Text>
                                    }
                                />
                            )}
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
}