import React, { useState, useEffect, useRef } from 'react';
import {
    Steps, Card, Input, Button, Typography,
    Row, Col, Descriptions, Space, message, Result, Tag, Empty, Spin, Radio, Divider,
} from 'antd';
import {
    CreditCardOutlined, CheckCircleOutlined, ArrowLeftOutlined,
    GiftOutlined, QrcodeOutlined, DollarOutlined,
    UserOutlined, CarOutlined, TagOutlined, MoneyCollectOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    getBillByBookingId, validateVoucher,
    confirmPaymentByCash, confirmPaymentByBank,
} from '../../../service/staffService';
import './Payment.css';

const { Title, Text } = Typography;

export default function StaffPayment() {
    const [currentStep, setCurrentStep] = useState(0);
    const [voucherCode, setVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [isPaymentReceived, setIsPaymentReceived] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('QR');
    const [billData, setBillData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Dùng URLSearchParams để kiểm tra xem có phải vừa đi từ VNPay về không
    const searchParams = new URLSearchParams(location.search);
    const isReturningFromVnpay = searchParams.has('status');

    // Khởi tạo state bằng location.state (đi từ Dashboard) HOẶC sessionStorage (đi từ VNPay)
    const [bayId] = useState(() => {
        if (location.state?.bayId) return location.state.bayId;
        if (isReturningFromVnpay) return sessionStorage.getItem('pendingVnpayBayId');
        return null;
    });

    const [bookingId] = useState(() => {
        if (location.state?.bookingId) return location.state.bookingId;
        if (isReturningFromVnpay) return sessionStorage.getItem('pendingVnpayBookingId');
        return null;
    });

    // Sau khi component mount và đã lấy được ID vào state, dọn dẹp luôn sessionStorage để không bị lưu rác vĩnh viễn
    useEffect(() => {
        if (isReturningFromVnpay) {
            sessionStorage.removeItem('pendingVnpayBayId');
            sessionStorage.removeItem('pendingVnpayBookingId');
        }
    }, [isReturningFromVnpay]);

    const fetchBillData = async () => {
        if (!bookingId) return;
        setLoading(true);
        try {
            const response = await getBillByBookingId(bookingId);
            const data = Array.isArray(response) ? response[0] : response;
            setBillData(data);

            const voucherData = data?.booking?.billing?.voucher || data?.billingVoucherResponse;
            if (voucherData) {
                setAppliedVoucher({
                    voucherCode: voucherData.voucherCode,
                    rewardName: voucherData.rewardName || '-',
                    discountValue: voucherData.discountValue,
                });
            } else {
                setAppliedVoucher(null);
            }
        } catch (error) {
            console.error('Failed to fetch bill', error);
            message.error('Không thể tải thông tin hóa đơn!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBillData();
    }, [bookingId]);

    // Xử lý kết quả trả về từ VNPay (chỉ xử lý 1 lần duy nhất)
    const vnpayProcessedRef = useRef(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const status = params.get('status');
        const billing = params.get('billing');

        if (!status || vnpayProcessedRef.current) return;
        vnpayProcessedRef.current = true;

        if (status === '00') {
            message.success(`Thanh toán VNPay thành công (Hóa đơn: ${billing || 'Không rõ'})!`);
            setCurrentStep(1);
            setIsPaymentReceived(true);
            setTimeout(() => {
                navigate(
                    bayId ? '/staff/dashboard' : '/staff/history',
                    bayId ? { state: { paidBayId: bayId, paidBookingId: bookingId } } : undefined
                );
            }, 2000);
        } else {
            message.error('Thanh toán VNPay thất bại hoặc đã bị hủy!');
        }

        params.delete('status');
        params.delete('billing');
        const newSearch = params.toString();
        navigate(
            `${location.pathname}${newSearch ? `?${newSearch}` : ''}`,
            { replace: true, state: location.state }
        );
    }, [location.search]);

    // === Loading state ===
    if (loading) {
        return (
            <div className="payment-container payment-container--centered">
                <Spin size="large" tip="Đang tải hóa đơn..." />
            </div>
        );
    }

    // === No bill data (direct access) ===
    if (!billData) {
        return (
            <div className="payment-container">
                <div className="payment-header">
                    <Title level={2} className="payment-title">
                        <CreditCardOutlined className="payment-title-icon" />
                        Thanh Toán
                    </Title>
                </div>
                <Card className="payment-card payment-empty-card">
                    <Empty
                        description={
                            <Space direction="vertical" size="small">
                                <Text strong className="payment-empty-title">
                                    Chưa có hóa đơn nào được chọn
                                </Text>
                                <Text type="secondary">
                                    Vui lòng quay lại Dashboard và bấm nút "Thanh toán" trên khoang đã hoàn thành dịch vụ.
                                </Text>
                            </Space>
                        }
                    >
                        <Button
                            type="primary"
                            size="large"
                            className="payment-empty-btn"
                            onClick={() => navigate('/staff/dashboard')}
                        >
                            Quay lại Dashboard
                        </Button>
                    </Empty>
                </Card>
            </div>
        );
    }

    // === Trích xuất dữ liệu từ billData ===
    const customer = billData.booking?.customer || billData.session?.customer || billData.customer || {};
    const customerName = customer.fullName || customer.name || 'Khách vãng lai';
    const customerPhone = customer.phoneNumber || customer.phone || 'N/A';
    const customerEmail = customer.email || '';

    const vehicle = billData.booking?.vehicle || billData.session?.vehicle || billData.vehicle || {};
    const licensePlate = vehicle.licensePlate || 'N/A';
    const vehicleModel = `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'N/A';

    const bayName = billData.booking?.washBay || billData.session?.bay?.name || billData.bay || 'N/A';

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

    const checkinTime = billData.booking?.startTime
        ? new Date(`1970-01-01T${billData.booking.startTime}Z`).toLocaleTimeString('vi-VN')
        : billData.session?.startTime
            ? new Date(billData.session.startTime).toLocaleString('vi-VN')
            : (billData.checkinTime || 'N/A');

    const billId = billData.billingId || billData.id || 'N/A';
    const staffNote = billData.booking?.notes || billData.session?.note || billData.staffNote || '';

    const bookingPromotion = billData.bookingPromotionResponse || billData.booking?.promotion || null;

    const detailPromotions = billData.booking?.bookingDetails
        ?.filter(s => s.promotionName && Number(s.discountAmount) > 0)
        .map(s => ({ id: s.servicePriceId, name: s.promotionName, discountAmount: s.discountAmount })) || [];

    const subtotal = Number(billData.originalAmount || 0) || services.reduce((acc, s) => acc + s.price, 0);
    const totalDiscountAmount = Number(billData.discountAmount || 0);
    const totalPromotionDiscount = detailPromotions.reduce((acc, p) => acc + (Number(p.discountAmount) || 0), 0);
    const actualVoucherDiscount = Math.max(0, totalDiscountAmount - totalPromotionDiscount);
    const depositAmount = Number(billData.booking?.billing?.depositAmount || 0);
    const finalTotal = Number(billData?.booking?.billing?.finalAmount || 0);

    // === Handlers ===
    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) {
            message.warning('Vui lòng nhập mã voucher!');
            return;
        }
        try {
            const response = await validateVoucher(customer.id, billData.billingId, voucherCode.trim());
            const voucherData = response?.data || response;
            if (voucherData) {
                message.success('Áp dụng thành công voucher!');
                await fetchBillData();
            } else {
                message.error('Mã voucher không hợp lệ hoặc đã hết hạn!');
            }
        } catch (error) {
            console.error('Failed to validate voucher', error);
            message.error(error.response?.data?.message || 'Mã voucher không hợp lệ hoặc đã hết hạn!');
        }
    };

    const handleProceedPayment = () => setCurrentStep(1);

    const handlePayment = async () => {
        if (!bookingId) {
            message.error('Không xác định được booking để xác nhận thanh toán!');
            return;
        }
        setConfirming(true);
        try {
            if (paymentMethod === 'CASH') {
                await confirmPaymentByCash(billId);
                setIsPaymentReceived(true);
                message.success('Đã thu tiền mặt thành công!');
                setConfirming(false);
                setTimeout(() => {
                    navigate(
                        bayId ? '/staff/dashboard' : '/staff/history',
                        bayId ? { state: { paidBayId: bayId, paidBookingId: bookingId } } : undefined
                    );
                }, 2000);
            } else {
                const response = await confirmPaymentByBank(billId);
                if (bayId) sessionStorage.setItem('pendingVnpayBayId', bayId);
                if (bookingId) sessionStorage.setItem('pendingVnpayBookingId', bookingId);
                if (response?.paymentUrl) {
                    window.location.href = response.paymentUrl;
                } else {
                    message.error('Không nhận được link thanh toán từ hệ thống!');
                    setConfirming(false);
                }
            }
        } catch (error) {
            console.error('Failed to confirm payment', error);
            message.error(error.response?.data?.message || 'Lỗi khi cập nhật trạng thái thanh toán!');
            setConfirming(false);
        }
    };

    return (
        <div className="payment-container">
            <div className="payment-header">
                <Title level={2} className="payment-title">
                    <CreditCardOutlined className="payment-title-icon" />
                    Thanh Toán
                </Title>
            </div>

            <Steps
                current={currentStep}
                className="payment-steps"
                items={[
                    { title: 'Xác nhận hóa đơn', icon: <DollarOutlined /> },
                    { title: 'Thanh toán', icon: <QrcodeOutlined /> },
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
                                <span className="payment-card-title">
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
                                    <Descriptions.Item label="Email">
                                        <Text>{customerEmail}</Text>
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
                                            <Col><Text strong>{s.price.toLocaleString('vi-VN')}đ</Text></Col>
                                        </Row>
                                    ))}
                                    <div className="payment-subtotal-row">
                                        <Row justify="space-between">
                                            <Col><Text strong>Tạm tính</Text></Col>
                                            <Col><Text strong>{subtotal.toLocaleString('vi-VN')}đ</Text></Col>
                                        </Row>
                                    </div>
                                </div>
                            </div>

                            {/* Khuyến mãi */}
                            {(bookingPromotion || detailPromotions.length > 0) && (
                                <div className="payment-section">
                                    <Text className="payment-section-label">
                                        <TagOutlined style={{ marginRight: 6 }} /> Khuyến mãi
                                    </Text>
                                    {bookingPromotion ? (
                                        <Row justify="space-between" className="payment-promo-row">
                                            <Col><Text className="payment-promo-text">{bookingPromotion.promotionName}</Text></Col>
                                            <Col><Text strong className="payment-promo-text">-{totalPromotionDiscount.toLocaleString('vi-VN')}đ</Text></Col>
                                        </Row>
                                    ) : (
                                        detailPromotions.map((p, idx) => (
                                            <Row justify="space-between" key={p.id || idx} className="payment-promo-row">
                                                <Col><Text className="payment-promo-text">{p.name || p.promotionName || 'Khuyến mãi'}</Text></Col>
                                                <Col><Text strong className="payment-promo-text">-{(Number(p.discountAmount) || 0).toLocaleString('vi-VN')}đ</Text></Col>
                                            </Row>
                                        ))
                                    )}
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
                                            <Tag color="blue" style={{ fontWeight: 500 }}>
                                                {appliedVoucher.voucherCode.toUpperCase()}
                                            </Tag>
                                            <Text className="payment-voucher-text">{appliedVoucher.rewardName}</Text>
                                        </Col>
                                        <Col>
                                            <Text strong className="payment-voucher-amount">
                                                -{actualVoucherDiscount.toLocaleString('vi-VN')}đ
                                            </Text>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {/* Tiền cọc */}
                            {depositAmount > 0 && (
                                <div className="payment-section payment-section--with-border">
                                    <Row justify="space-between" className="payment-deposit-row">
                                        <Col><Text className="payment-deposit-text">Đã đặt cọc</Text></Col>
                                        <Col><Text className="payment-deposit-text">{depositAmount.toLocaleString('vi-VN')}đ</Text></Col>
                                    </Row>
                                </div>
                            )}

                            {/* Tổng */}
                            <div className="payment-total-box">
                                <Row justify="space-between" align="middle">
                                    <Col><Text className="payment-total-label">Tổng thanh toán</Text></Col>
                                    <Col>
                                        <Title level={2} className="payment-total-amount">
                                            {Math.max(0, finalTotal).toLocaleString('vi-VN')}đ
                                        </Title>
                                    </Col>
                                </Row>
                            </div>

                            {staffNote && (
                                <div className="payment-note">
                                    <Text type="secondary"><strong>Ghi chú:</strong> {staffNote}</Text>
                                </div>
                            )}
                        </Card>
                    </Col>

                    {/* Voucher + Nút thanh toán */}
                    <Col xs={24} lg={8}>
                        <Card
                            className="payment-card voucher-card"
                            title={
                                <span className="payment-card-title">
                                    <GiftOutlined style={{ marginRight: 8 }} /> Mã Voucher
                                </span>
                            }
                        >
                            <Text type="secondary" className="voucher-helper-text">
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
                            {!appliedVoucher && (
                                <Button
                                    type="primary"
                                    block
                                    className="voucher-apply-btn"
                                    onClick={handleApplyVoucher}
                                    disabled={!voucherCode.trim()}
                                >
                                    Áp dụng voucher
                                </Button>
                            )}
                            {appliedVoucher && (
                                <div className="voucher-applied-info">
                                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                                    <Text strong className="voucher-applied-text">
                                        Đã áp dụng: {appliedVoucher.rewardName}
                                    </Text>
                                </div>
                            )}
                        </Card>

                        <Card className="payment-card payment-action-card">
                            <div className="payment-action-summary">
                                <Row justify="space-between" align="middle">
                                    <Col><Text strong className="payment-action-total-label">Cần thanh toán</Text></Col>
                                    <Col>
                                        <Title level={3} className="payment-action-total-value">
                                            {Math.max(0, finalTotal).toLocaleString('vi-VN')}đ
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

            {/* GIAI ĐOẠN 2: Bill cuối + Thanh toán */}
            {currentStep === 1 && (
                <Row gutter={[32, 24]}>
                    {/* Bill cuối cùng */}
                    <Col xs={24} lg={14}>
                        <Card
                            className="payment-card"
                            title={
                                <span className="payment-card-title">
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

                            <Descriptions bordered column={1} size="small" className="payment-descriptions" style={{ marginBottom: 24 }}>
                                <Descriptions.Item label="Khách hàng">
                                    <Text strong>{customerName}</Text> - {customerPhone} - {customerEmail}
                                </Descriptions.Item>
                                <Descriptions.Item label="Phương tiện">
                                    <Text strong>{licensePlate}</Text>
                                    <Text type="secondary" style={{ marginLeft: 8 }}>{vehicleModel}</Text>
                                </Descriptions.Item>
                            </Descriptions>

                            <div className="payment-service-list">
                                <Text className="payment-section-label">Chi tiết dịch vụ</Text>
                                {services.map(s => (
                                    <Row justify="space-between" key={s.id} className="payment-service-row">
                                        <Col><Text>{s.name}</Text></Col>
                                        <Col><Text strong>{s.price.toLocaleString('vi-VN')}đ</Text></Col>
                                    </Row>
                                ))}
                                <div className="payment-subtotal-row">
                                    <Row justify="space-between">
                                        <Col><Text strong>Tạm tính</Text></Col>
                                        <Col><Text strong>{subtotal.toLocaleString('vi-VN')}đ</Text></Col>
                                    </Row>
                                </div>
                            </div>

                            {(bookingPromotion || detailPromotions.length > 0 || appliedVoucher || depositAmount > 0) && (
                                <div className="payment-discount-section">
                                    <Text className="payment-section-label">Giảm giá & Cọc</Text>

                                    {bookingPromotion ? (
                                        <Row justify="space-between" className="payment-promo-row">
                                            <Col><Text className="payment-promo-text">{bookingPromotion.promotionName}</Text></Col>
                                            <Col><Text strong className="payment-promo-text">-{totalPromotionDiscount.toLocaleString('vi-VN')}đ</Text></Col>
                                        </Row>
                                    ) : (
                                        detailPromotions.map((p, idx) => (
                                            <Row justify="space-between" key={p.id || idx} className="payment-promo-row">
                                                <Col><Text strong className="payment-promo-text">{p.name || p.promotionName || 'Khuyến mãi'}</Text></Col>
                                                <Col><Text strong className="payment-promo-text">-{(Number(p.discountAmount) || 0).toLocaleString('vi-VN')}đ</Text></Col>
                                            </Row>
                                        ))
                                    )}

                                    {appliedVoucher && (
                                        <Row justify="space-between" className="payment-voucher-applied-row">
                                            <Col>
                                                <Tag color="blue" style={{ marginRight: 4, fontWeight: 500 }}>
                                                    {appliedVoucher.voucherCode}
                                                </Tag>
                                                <Text strong className="payment-voucher-amount">
                                                    {appliedVoucher.rewardName || 'Giảm giá Voucher'}
                                                </Text>
                                            </Col>
                                            <Col>
                                                <Text strong className="payment-voucher-amount">
                                                    -{actualVoucherDiscount.toLocaleString('vi-VN')}đ
                                                </Text>
                                            </Col>
                                        </Row>
                                    )}

                                    {depositAmount > 0 && (
                                        <Row justify="space-between" className="payment-deposit-row">
                                            <Col><Text className="payment-deposit-text">Đã đặt cọc</Text></Col>
                                            <Col><Text className="payment-deposit-text">{depositAmount.toLocaleString('vi-VN')}đ</Text></Col>
                                        </Row>
                                    )}
                                </div>
                            )}

                            <div className="payment-final-total-box">
                                <Row justify="space-between" align="middle">
                                    <Col><Text className="payment-final-total-label">TỔNG THANH TOÁN</Text></Col>
                                    <Col>
                                        <Title level={2} className="payment-final-total-amount">
                                            {Math.max(0, finalTotal).toLocaleString('vi-VN')}đ
                                        </Title>
                                    </Col>
                                </Row>
                            </div>
                        </Card>
                    </Col>

                    {/* Phần thanh toán */}
                    <Col xs={24} lg={10}>
                        <Card className="payment-card qr-payment-card">
                            {!isPaymentReceived ? (
                                <div className="qr-payment-area">
                                    <Title level={4} className="qr-payment-title">
                                        Phương thức thanh toán
                                    </Title>

                                    <Radio.Group
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        buttonStyle="solid"
                                        className="payment-method-group"
                                    >
                                        <Radio.Button value="QR" className="payment-method-btn">
                                            <QrcodeOutlined /> Chuyển khoản QR
                                        </Radio.Button>
                                        <Radio.Button value="CASH" className="payment-method-btn">
                                            <MoneyCollectOutlined /> Tiền mặt
                                        </Radio.Button>
                                    </Radio.Group>

                                    {paymentMethod === 'QR' ? (
                                        <>
                                            <Text type="secondary" className="qr-helper-text">
                                                Khách hàng quét mã QR để thanh toán
                                            </Text>
                                            <div className="qr-amount-display">
                                                <Text type="secondary">Số tiền cần thanh toán</Text>
                                                <Title level={3} className="qr-amount-value">
                                                    {Math.max(0, finalTotal).toLocaleString('vi-VN')}đ
                                                </Title>
                                            </div>
                                            <Text type="secondary" className="qr-system-note">
                                                Hệ thống sẽ tự động xác nhận khi nhận được thanh toán
                                            </Text>
                                            <Button
                                                type="primary"
                                                block
                                                size="large"
                                                icon={<QrcodeOutlined />}
                                                className="qr-vnpay-btn"
                                                onClick={handlePayment}
                                                loading={confirming}
                                            >
                                                Mở trang thanh toán VNPay
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Text type="secondary" className="qr-helper-text">
                                                Thu tiền mặt trực tiếp từ khách hàng
                                            </Text>
                                            <div className="qr-code-placeholder qr-code-placeholder--cash">
                                                <MoneyCollectOutlined className="qr-cash-icon" />
                                            </div>
                                            <div className="qr-amount-display">
                                                <Text type="secondary">Số tiền cần thu</Text>
                                                <Title level={3} className="qr-amount-value">
                                                    {Math.max(0, finalTotal).toLocaleString('vi-VN')}đ
                                                </Title>
                                            </div>
                                            <Divider dashed style={{ margin: '16px 0' }} />
                                            <Button
                                                type="primary"
                                                block
                                                size="large"
                                                icon={<CheckCircleOutlined />}
                                                className="cash-confirm-btn"
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
                                    subTitle={`Hóa đơn ${billId} — ${Math.max(0, finalTotal).toLocaleString('vi-VN')}đ`}
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