import React, { useState } from 'react';
import {
    Steps, Card, Input, Button, Typography,
    Row, Col, Descriptions, Space, message, Result, Tag, Empty
} from 'antd';
import {
    CreditCardOutlined, CheckCircleOutlined, ArrowLeftOutlined,
    GiftOutlined, QrcodeOutlined, DollarOutlined,
    UserOutlined, CarOutlined, TagOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './Payment.css';

const { Title, Text } = Typography;

// Mock vouchers
const mockVouchers = {
    'SUMMER2026': { name: 'Ưu đãi hè 2026', discountPercent: 15, maxDiscount: 100000 },
    'VIP50K': { name: 'Giảm 50K cho VIP', discountFixed: 50000 },
    'NEWCUST': { name: 'Khách hàng mới', discountPercent: 10, maxDiscount: 200000 },
};

export default function StaffPayment() {
    const [currentStep, setCurrentStep] = useState(0);
    const [voucherCode, setVoucherCode] = useState('');
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [isPaymentReceived, setIsPaymentReceived] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Nhận data từ Dashboard
    const bayId = location.state?.bayId || null;
    const bill = location.state?.billData || null;

    // Nếu không có data (truy cập trực tiếp từ sidebar) → hiển empty state
    if (!bill) {
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

    // Tính tổng tiền dịch vụ
    const subtotal = bill.services.reduce((acc, s) => acc + s.price, 0);

    // Tính giảm giá từ promotions (đã áp dụng từ check-in)
    const promotionDiscount = bill.promotions.reduce((acc, p) => acc + p.discount, 0);

    // Tính giảm giá từ voucher
    const calculateVoucherDiscount = () => {
        if (!appliedVoucher) return 0;
        const afterPromo = subtotal - promotionDiscount;
        if (appliedVoucher.discountFixed) {
            return Math.min(appliedVoucher.discountFixed, afterPromo);
        }
        if (appliedVoucher.discountPercent) {
            const discount = Math.floor(afterPromo * appliedVoucher.discountPercent / 100);
            return appliedVoucher.maxDiscount ? Math.min(discount, appliedVoucher.maxDiscount) : discount;
        }
        return 0;
    };

    const voucherDiscount = calculateVoucherDiscount();
    const finalTotal = subtotal - promotionDiscount - voucherDiscount;

    // Áp dụng voucher
    const handleApplyVoucher = () => {
        if (!voucherCode.trim()) {
            message.warning('Vui lòng nhập mã voucher!');
            return;
        }

        const voucher = mockVouchers[voucherCode.trim().toUpperCase()];
        if (voucher) {
            setAppliedVoucher(voucher);
            message.success(`Áp dụng thành công: ${voucher.name}`);
        } else {
            message.error('Mã voucher không hợp lệ hoặc đã hết hạn!');
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

    // Giả lập nhận thanh toán
    const handleSimulatePayment = () => {
        setIsPaymentReceived(true);
        message.success('Thanh toán thành công!');
        setTimeout(() => {
            // Quay về Dashboard với paidBayId để giải phóng bay
            if (bayId) {
                navigate('/staff/dashboard', { state: { paidBayId: bayId } });
            } else {
                navigate('/staff/history');
            }
        }, 2500);
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
                                        <Text strong>{bill.customer.name}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Số điện thoại">
                                        <Text>{bill.customer.phone}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Phương tiện">
                                        <Text strong>{bill.customer.licensePlate}</Text>
                                        <br />
                                        <Text type="secondary">{bill.customer.vehicleModel}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Khoang">
                                        <Text>{bill.bay}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Thời gian check-in">
                                        <Text>{bill.checkinTime}</Text>
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>

                            {/* Chi tiết dịch vụ */}
                            <div className="payment-section">
                                <Text className="payment-section-label">
                                    <CarOutlined style={{ marginRight: 6 }} /> Chi tiết dịch vụ
                                </Text>
                                <div className="payment-service-list">
                                    {bill.services.map(s => (
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
                            {bill.promotions.length > 0 && (
                                <div className="payment-section">
                                    <Text className="payment-section-label">
                                        <TagOutlined style={{ marginRight: 6 }} /> Khuyến mãi đã áp dụng
                                    </Text>
                                    {bill.promotions.map(p => (
                                        <Row justify="space-between" key={p.id} className="payment-promo-row">
                                            <Col><Text style={{ color: '#52c41a' }}>{p.name}</Text></Col>
                                            <Col><Text strong style={{ color: '#52c41a' }}>-{p.discount.toLocaleString('vi-VN')} đ</Text></Col>
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
                                            <Text style={{ color: '#1890ff' }}>{appliedVoucher.name}</Text>
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
                                            {finalTotal.toLocaleString('vi-VN')} đ
                                        </Title>
                                    </Col>
                                </Row>
                            </div>

                            {/* Staff note */}
                            {bill.staffNote && (
                                <div className="payment-note">
                                    <Text type="secondary">
                                        <strong>Ghi chú:</strong> {bill.staffNote}
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
                                        Đã áp dụng: {appliedVoucher.name}
                                    </Text>
                                </div>
                            )}

                            <div className="voucher-demo-hint">
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Thử: <Tag color="blue" style={{ cursor: 'pointer' }} onClick={() => setVoucherCode('SUMMER2026')}>SUMMER2026</Tag>
                                    <Tag color="blue" style={{ cursor: 'pointer' }} onClick={() => setVoucherCode('VIP50K')}>VIP50K</Tag>
                                </Text>
                            </div>
                        </Card>

                        {/* Nút thanh toán */}
                        <Card className="payment-card payment-action-card">
                            <div className="payment-action-summary">
                                <Row justify="space-between" align="middle">
                                    <Col><Text strong style={{ fontSize: 16 }}>Cần thanh toán</Text></Col>
                                    <Col>
                                        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                                            {finalTotal.toLocaleString('vi-VN')} đ
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
                                <Text type="secondary">Mã hóa đơn: <Text strong>{bill.id}</Text></Text>
                            </div>

                            {/* Khách hàng */}
                            <Descriptions bordered column={1} size="small" className="payment-descriptions" style={{ marginBottom: 24 }}>
                                <Descriptions.Item label="Khách hàng">
                                    <Text strong>{bill.customer.name}</Text> — {bill.customer.phone}
                                </Descriptions.Item>
                                <Descriptions.Item label="Phương tiện">
                                    <Text strong>{bill.customer.licensePlate}</Text>
                                    <Text type="secondary" style={{ marginLeft: 8 }}>{bill.customer.vehicleModel}</Text>
                                </Descriptions.Item>
                            </Descriptions>

                            {/* Chi tiết */}
                            <div className="payment-service-list">
                                <Text className="payment-section-label" style={{ marginBottom: 12, display: 'block' }}>Chi tiết dịch vụ</Text>
                                {bill.services.map(s => (
                                    <Row justify="space-between" key={s.id} className="payment-service-row">
                                        <Col><Text>{s.name}</Text></Col>
                                        <Col><Text strong>{s.price.toLocaleString('vi-VN')} đ</Text></Col>
                                    </Row>
                                ))}
                            </div>

                            {/* Giảm giá */}
                            {(bill.promotions.length > 0 || appliedVoucher) && (
                                <div className="payment-discount-section">
                                    <Text className="payment-section-label" style={{ marginBottom: 12, display: 'block' }}>Giảm giá</Text>
                                    {bill.promotions.map(p => (
                                        <Row justify="space-between" key={p.id} className="payment-promo-row">
                                            <Col><Text style={{ color: '#52c41a' }}>{p.name}</Text></Col>
                                            <Col><Text strong style={{ color: '#52c41a' }}>-{p.discount.toLocaleString('vi-VN')} đ</Text></Col>
                                        </Row>
                                    ))}
                                    {appliedVoucher && (
                                        <Row justify="space-between" className="payment-promo-row">
                                            <Col>
                                                <Tag color="blue" style={{ marginRight: 4 }}>{voucherCode.toUpperCase()}</Tag>
                                                <Text style={{ color: '#1890ff' }}>{appliedVoucher.name}</Text>
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
                                            {finalTotal.toLocaleString('vi-VN')} đ
                                        </Title>
                                    </Col>
                                </Row>
                            </div>
                        </Card>
                    </Col>

                    {/* QR Thanh toán */}
                    <Col xs={24} lg={10}>
                        <Card className="payment-card qr-payment-card">
                            {!isPaymentReceived ? (
                                <div className="qr-payment-area">
                                    <Title level={4} style={{ marginBottom: 8, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                                        Quét QR để thanh toán
                                    </Title>
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
                                            {finalTotal.toLocaleString('vi-VN')} đ
                                        </Title>
                                    </div>

                                    <Text type="secondary" style={{ fontSize: 13, marginTop: 16, display: 'block', textAlign: 'center' }}>
                                        Hệ thống sẽ tự động xác nhận khi nhận được thanh toán
                                    </Text>

                                    {/* Nút giả lập */}
                                    <Button
                                        type="dashed"
                                        block
                                        className="simulate-payment-btn"
                                        onClick={handleSimulatePayment}
                                    >
                                        <CheckCircleOutlined /> Giả lập: Đã nhận thanh toán
                                    </Button>
                                </div>
                            ) : (
                                <Result
                                    status="success"
                                    title="Thanh toán thành công!"
                                    subTitle={`Hóa đơn ${bill.id} — ${finalTotal.toLocaleString('vi-VN')} đ`}
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
