import React, { useState, useEffect } from "react";
import {
    Card, Button, Modal, Form, InputNumber, Input,
    Space, Typography, message, Spin, Tooltip
} from "antd";
import {
    EditOutlined, InfoCircleOutlined, TrophyOutlined,
    CalendarOutlined, PercentageOutlined, StarOutlined,
    ClockCircleOutlined
} from "@ant-design/icons";
import {
    getAdminMembershipTiers,
    updateAdminMembershipTier
} from "../../../service/adminService";
import "./Membership.css";

const { Title, Text, Paragraph } = Typography;

export default function Membership() {
    const [tiers, setTiers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTier, setEditingTier] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    // Tải danh sách hạng thành viên
    const fetchTiers = async () => {
        setLoading(true);
        try {
            const data = await getAdminMembershipTiers();
            // Lấy từ data hoặc data.data tùy theo cấu trúc ApiResponse của backend
            const tierList = data?.data || data || [];
            // Sắp xếp các hạng thành viên theo tierLevel tăng dần
            tierList.sort((a, b) => a.tierLevel - b.tierLevel);
            setTiers(tierList);
        } catch (error) {
            console.error("Không thể tải danh sách hạng thành viên:", error);
            message.error(error.response?.data?.message || error.message || "Không thể tải danh sách hạng thành viên");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTiers();
    }, []);

    // Mở Modal Cập nhật
    const handleEditClick = (tier) => {
        setEditingTier(tier);
        form.setFieldsValue({
            bookingWindowDays: tier.bookingWindowDays,
            pointEarnRate: tier.pointEarnRate,
            minPointsToMaintain: tier.minPointsToMaintain,
            pointExpirationMonths: tier.pointExpirationMonths,
            perksDescription: tier.perksDescription
        });
        setIsModalOpen(true);
    };

    // Xử lý gửi Form cập nhật hạng
    const handleFormSubmit = async (values) => {
        if (!editingTier) return;
        setSubmitting(true);
        try {
            await updateAdminMembershipTier(editingTier.id, values);
            message.success(`Cập nhật hạng ${editingTier.tierName} thành công!`);
            setIsModalOpen(false);
            fetchTiers();
        } catch (error) {
            console.error("Lỗi khi cập nhật hạng thành viên:", error);
            message.error(error.response?.data?.message || error.message || "Không thể cập nhật hạng thành viên");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="membership-admin-container">
            <div className="membership-admin-header">
                <Title level={3} className="membership-admin-title">
                    <TrophyOutlined style={{ color: "#d48806", marginRight: "8px" }} />
                    QUẢN LÝ HẠNG THÀNH VIÊN
                </Title>
                <Paragraph className="membership-admin-subtitle">
                    Xem cấu hình và chỉnh sửa các điều kiện, quyền lợi của từng hạng thành viên trong hệ thống AutoWash Pro.
                </Paragraph>
            </div>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
                    <Spin size="large" tip="Đang tải danh sách hạng thành viên..." />
                </div>
            ) : (
                <div className="membership-tier-grid">
                    {tiers.map((tier) => (
                        <div key={tier.id} className="membership-tier-card">
                            {/* Header với gradient động theo cấp độ hạng */}
                            <div className={`tier-header tier-level-${tier.tierLevel}`}>
                                <div className="tier-badge">Level {tier.tierLevel}</div>
                                <h3 className="tier-name">{tier.tierName}</h3>
                                <div className="tier-level-label">Hạng thành viên</div>
                            </div>

                            {/* Chi tiết các thông số của hạng */}
                            <div className="tier-body">
                                <div className="tier-info-section">
                                    <div className="tier-info-row">
                                        <span className="info-label">
                                            <Space size="small">
                                                <CalendarOutlined />
                                                <span>Đặt trước tối đa</span>
                                            </Space>
                                        </span>
                                        <span className="info-value">{tier.bookingWindowDays} ngày</span>
                                    </div>
                                    <div className="tier-info-row">
                                        <span className="info-label">
                                            <Space size="small">
                                                <PercentageOutlined />
                                                <span>Tỷ lệ tích điểm</span>
                                            </Space>
                                        </span>
                                        <span className="info-value">{tier.pointEarnRate}x</span>
                                    </div>
                                    <div className="tier-info-row">
                                        <span className="info-label">
                                            <Space size="small">
                                                <StarOutlined />
                                                <span>Điểm duy trì tối thiểu</span>
                                            </Space>
                                        </span>
                                        <span className="info-value">{tier.minPointsToMaintain} điểm</span>
                                    </div>
                                    <div className="tier-info-row">
                                        <span className="info-label">
                                            <Space size="small">
                                                <ClockCircleOutlined />
                                                <span>Thời hạn điểm tích lũy</span>
                                            </Space>
                                        </span>
                                        <span className="info-value">{tier.pointExpirationMonths} tháng</span>
                                    </div>
                                    <div style={{ marginTop: "16px" }}>
                                        <Text strong style={{ fontSize: "13px", color: "#475569" }}>Mô tả đặc quyền:</Text>
                                        <div className="tier-perks">
                                            {tier.perksDescription || "Chưa có mô tả đặc quyền lợi ích dành cho hạng này."}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Nút hành động sửa */}
                            <div className="tier-actions">
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditClick(tier)}
                                    className="edit-tier-button"
                                    ghost
                                >
                                    Chỉnh sửa cấu hình
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal chỉnh sửa cấu hình hạng thành viên */}
            <Modal
                title={`CẤP NHẬT CẤU HÌNH HẠNG: ${editingTier?.tierName?.toUpperCase()}`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={submitting}
                okText="Lưu thay đổi"
                cancelText="Hủy bỏ"
                width={600}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    style={{ marginTop: "20px" }}
                >
                    <div className="tier-form-grid">
                        <Form.Item
                            name="bookingWindowDays"
                            label={
                                <span>
                                    Đặt trước tối đa (ngày) &nbsp;
                                    <Tooltip title="Số ngày tối đa mà khách hàng thuộc hạng này được phép đặt lịch trước.">
                                        <InfoCircleOutlined style={{ color: '#ccc' }} />
                                    </Tooltip>
                                </span>
                            }
                            rules={[
                                { required: true, message: "Vui lòng nhập số ngày!" },
                                { type: "number", min: 1, message: "Giá trị phải lớn hơn 0!" }
                            ]}
                        >
                            <InputNumber className="tier-form-item-full" min={1} placeholder="Ví dụ: 7" />
                        </Form.Item>

                        <Form.Item
                            name="pointEarnRate"
                            label={
                                <span>
                                    Hệ số tích điểm &nbsp;
                                    <Tooltip title="Hệ số nhân khi tích điểm của khách hàng hạng này. Ví dụ 1.2 là tăng 20% điểm tích lũy khi thanh toán.">
                                        <InfoCircleOutlined style={{ color: '#ccc' }} />
                                    </Tooltip>
                                </span>
                            }
                            rules={[
                                { required: true, message: "Vui lòng nhập hệ số tích điểm!" },
                                { type: "number", min: 0.1, message: "Hệ số phải tối thiểu là 0.1!" }
                            ]}
                        >
                            <InputNumber className="tier-form-item-full" min={0.1} step={0.1} placeholder="Ví dụ: 1.0" />
                        </Form.Item>
                    </div>

                    <div className="tier-form-grid">
                        <Form.Item
                            name="minPointsToMaintain"
                            label={
                                <span>
                                    Điểm duy trì tối thiểu &nbsp;
                                    <Tooltip title="Số điểm tối thiểu khách hàng cần tích lũy trong năm/chu kỳ để duy trì hạng này.">
                                        <InfoCircleOutlined style={{ color: '#ccc' }} />
                                    </Tooltip>
                                </span>
                            }
                            rules={[
                                { required: true, message: "Vui lòng nhập điểm duy trì!" },
                                { type: "number", min: 0, message: "Giá trị phải từ 0 trở lên!" }
                            ]}
                        >
                            <InputNumber className="tier-form-item-full" min={0} placeholder="Ví dụ: 1000" />
                        </Form.Item>

                        <Form.Item
                            name="pointExpirationMonths"
                            label={
                                <span>
                                    Thời hạn điểm (tháng) &nbsp;
                                    <Tooltip title="Số tháng điểm tích lũy của khách hàng thuộc hạng này có hiệu lực trước khi hết hạn.">
                                        <InfoCircleOutlined style={{ color: '#ccc' }} />
                                    </Tooltip>
                                </span>
                            }
                            rules={[
                                { required: true, message: "Vui lòng nhập thời hạn hết hạn điểm!" },
                                { type: "number", min: 1, message: "Thời hạn phải lớn hơn 0!" }
                            ]}
                        >
                            <InputNumber className="tier-form-item-full" min={1} placeholder="Ví dụ: 12" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="perksDescription"
                        label="Mô tả đặc quyền"
                        rules={[{ required: true, message: "Vui lòng nhập mô tả đặc quyền của hạng thành viên!" }]}
                    >
                        <Input.TextArea
                            rows={4}
                            placeholder="Mô tả các ưu đãi chi tiết, dịch vụ đi kèm hoặc quyền ưu tiên..."
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}