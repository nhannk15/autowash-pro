import { useState, useEffect } from "react";
import { 
    Table, Button, Input, Select, Tag, Modal, Form, 
    InputNumber, Space, Popconfirm, message, Typography 
} from "antd";
import { 
    PlusOutlined, EditOutlined, DeleteOutlined, 
    SearchOutlined, GiftOutlined 
} from "@ant-design/icons";
import { 
    getRewards, createReward, updateReward, deleteReward, getServicePrices 
} from "../../../service/adminService";
import "./Reward.css";

const { Title, Text } = Typography;

export default function Reward() {
    const [rewards, setRewards] = useState([]);
    const [servicePrices, setServicePrices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // State cho Modal Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Dùng watch để theo dõi thay đổi của loại phần thưởng trong form
    const rewardTypeWatch = Form.useWatch("rewardType", form);

    // Tải danh sách phần thưởng từ API
    const fetchRewards = async () => {
        setLoading(true);
        try {
            const data = await getRewards();
            // Lấy từ data hoặc data.data tùy theo cấu trúc ApiResponse của backend
            setRewards(data?.data || data || []);
        } catch (error) {
            message.error(error.response?.data?.message || error.message || "Không thể tải danh sách phần thưởng");
        } finally {
            setLoading(false);
        }
    };

    // Tải danh sách bảng giá dịch vụ từ API để chọn
    const fetchServicePrices = async () => {
        try {
            const result = await getServicePrices();
            setServicePrices(result?.data || result || []);
        } catch (error) {
            console.error("Không thể tải danh sách bảng giá dịch vụ:", error);
        }
    };

    useEffect(() => {
        fetchRewards();
        fetchServicePrices();
    }, []);

    // Mở Form Thêm mới
    const handleAddClick = () => {
        setEditingId(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    // Mở Form Cập nhật
    const handleEditClick = (record) => {
        setEditingId(record.id);
        
        // Tìm servicePrice tương ứng để gán giá trị cho form nếu có
        let matchedServicePriceId = null;
        if (record.serviceName && servicePrices.length > 0) {
            // serviceName từ backend gửi về có dạng: "serviceName - typeName"
            const matched = servicePrices.find(sp => {
                const name = (sp.service?.serviceName || "") + " - " + (sp.vehicleType?.typeName || "");
                return name === record.serviceName;
            });
            if (matched) {
                matchedServicePriceId = matched.id;
            }
        }

        form.setFieldsValue({
            rewardName: record.rewardName,
            rewardType: record.rewardType,
            pointCost: record.pointCost,
            discountValue: record.discountValue,
            validityDays: record.validityDays,
            servicePriceId: matchedServicePriceId,
            description: record.description
        });
        setIsModalOpen(true);
    };

    // Xóa/Vô hiệu hóa phần thưởng
    const handleDelete = async (id) => {
        try {
            await deleteReward(id);
            message.success("Vô hiệu hóa phần thưởng thành công!");
            fetchRewards();
        } catch (error) {
            message.error(error.response?.data?.message || "Không thể vô hiệu hóa phần thưởng");
        }
    };

    // Xử lý Gửi Form (Lưu / Cập nhật)
    const handleFormSubmit = async (values) => {
        setSubmitting(true);
        try {
            const payload = {
                rewardName: values.rewardName,
                rewardType: values.rewardType,
                pointCost: values.pointCost,
                discountValue: (values.rewardType === "DISCOUNT_FLAT" || values.rewardType === "DISCOUNT_PERCENTAGE") ? values.discountValue : 0,
                validityDays: values.validityDays,
                servicePriceId: (values.rewardType === "FREE_WASH" || values.rewardType === "ADDON") ? values.servicePriceId : null,
                description: values.description
            };

            if (editingId) {
                await updateReward(editingId, payload);
                message.success("Cập nhật phần thưởng thành công!");
            } else {
                await createReward(payload);
                message.success("Thêm phần thưởng mới thành công!");
            }

            setIsModalOpen(false);
            fetchRewards();
        } catch (error) {
            message.error(error.response?.data?.message || "Đã xảy ra lỗi khi lưu thông tin");
        } finally {
            setSubmitting(false);
        }
    };

    // Xác định màu sắc nhãn theo loại phần thưởng
    const getRewardTypeTag = (type) => {
        switch (type) {
            case "DISCOUNT_FLAT":
                return <Tag color="orange">Giảm giá tiền mặt</Tag>;
            case "DISCOUNT_PERCENTAGE":
                return <Tag color="cyan">Giảm giá phần trăm</Tag>;
            case "FREE_WASH":
                return <Tag color="green">Rửa xe miễn phí</Tag>;
            case "ADDON":
                return <Tag color="purple">Dịch vụ đi kèm</Tag>;
            default:
                return <Tag color="blue">{type}</Tag>;
        }
    };

    // Lọc danh sách phần thưởng dựa trên Tìm kiếm & Bộ lọc trạng thái
    const filteredRewards = rewards.filter(reward => {
        const matchesSearch = reward.rewardName?.toLowerCase().includes(searchText.toLowerCase());
        
        if (statusFilter === "ALL") return matchesSearch;
        if (statusFilter === "ACTIVE") return matchesSearch && reward.active;
        if (statusFilter === "INACTIVE") return matchesSearch && !reward.active;
        
        return matchesSearch;
    });

    const columns = [
        {
            title: "TÊN PHẦN THƯỞNG",
            dataIndex: "rewardName",
            key: "rewardName",
            render: (text, record) => (
                <div>
                    <Text strong className="reward-name-text">{text}</Text>
                    <div className="reward-desc-text">{record.description || "Không có mô tả"}</div>
                </div>
            )
        },
        {
            title: "LOẠI PHẦN THƯỞNG",
            dataIndex: "rewardType",
            key: "rewardType",
            render: (type) => getRewardTypeTag(type)
        },
        {
            title: "ĐIỂM ĐỔI",
            dataIndex: "pointCost",
            key: "pointCost",
            render: (points) => (
                <Text strong style={{ color: "#d48806" }}>
                    {points} điểm
                </Text>
            )
        },
        {
            title: "ƯU ĐÃI CHI TIẾT",
            key: "details",
            render: (_, record) => {
                if (record.rewardType === "DISCOUNT_FLAT") {
                    return <Text>{record.discountValue?.toLocaleString()} VND</Text>;
                }
                if (record.rewardType === "DISCOUNT_PERCENTAGE") {
                    return <Text>{record.discountValue}%</Text>;
                }
                if (record.rewardType === "FREE_WASH" || record.rewardType === "ADDON") {
                    return record.serviceName ? <Tag color="blue">{record.serviceName}</Tag> : <Text type="secondary">N/A</Text>;
                }
                return <Text type="secondary">-</Text>;
            }
        },
        {
            title: "THỜI HẠN",
            dataIndex: "validityDays",
            key: "validityDays",
            render: (days) => <Text>{days} ngày</Text>
        },
        {
            title: "TRẠNG THÁI",
            dataIndex: "active",
            key: "active",
            render: (active) => (
                active ? <Tag color="green">Đang hoạt động</Tag> : <Tag color="red">Ngừng hoạt động</Tag>
            )
        },
        {
            title: "HÀNH ĐỘNG",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Button 
                        type="text" 
                        icon={<EditOutlined style={{ color: "#1890ff" }} />} 
                        onClick={() => handleEditClick(record)} 
                    />
                    {record.active && (
                        <Popconfirm
                            title="Bạn có chắc chắn muốn vô hiệu hóa phần thưởng này?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Có"
                            cancelText="Hủy"
                        >
                            <Button 
                                type="text" 
                                danger 
                                icon={<DeleteOutlined />} 
                            />
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className="reward-container">
            <div className="reward-header">
                <div>
                    <Title level={3} className="reward-header-title">QUẢN LÝ PHẦN THƯỞNG</Title>
                    <Text type="secondary">Tạo mới, chỉnh sửa thông tin và quản lý danh sách phần thưởng khách hàng đổi điểm</Text>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    size="large"
                    onClick={handleAddClick}
                    className="reward-add-btn"
                >
                    Thêm Phần Thưởng
                </Button>
            </div>

            {/* Thanh Tìm Kiếm và Lọc */}
            <Space className="reward-filter-bar">
                <Input 
                    placeholder="Tìm tên phần thưởng..." 
                    prefix={<SearchOutlined />} 
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="reward-search-input"
                />
                <Select 
                    value={statusFilter} 
                    onChange={setStatusFilter} 
                    className="reward-status-select"
                >
                    <Select.Option value="ALL">Tất cả trạng thái</Select.Option>
                    <Select.Option value="ACTIVE">Đang hoạt động</Select.Option>
                    <Select.Option value="INACTIVE">Ngừng hoạt động</Select.Option>
                </Select>
            </Space>

            {/* Bảng Hiển Thị */}
            <Table 
                columns={columns} 
                dataSource={filteredRewards} 
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 8 }}
                className="reward-table"
            />

            {/* Modal Thêm / Sửa */}
            <Modal
                title={editingId ? "CẬP NHẬT PHẦN THƯỞNG" : "TẠO PHẦN THƯỞNG MỚI"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => form.submit()}
                confirmLoading={submitting}
                okText={editingId ? "Lưu thay đổi" : "Tạo mới"}
                cancelText="Hủy bỏ"
                width={650}
            >
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={handleFormSubmit}
                    className="reward-form"
                >
                    <Form.Item 
                        name="rewardName" 
                        label="Tên Phần Thưởng" 
                        rules={[{ required: true, message: "Vui lòng nhập tên phần thưởng!" }]}
                    >
                        <Input placeholder="Ví dụ: Rửa vỏ xe miễn phí cho dòng SUV" />
                    </Form.Item>

                    <Form.Item name="description" label="Mô Tả Chi Tiết">
                        <Input.TextArea rows={3} placeholder="Mô tả quyền lợi chi tiết cho khách hàng..." />
                    </Form.Item>

                    {/* Dòng 1: Loại phần thưởng và Số điểm quy đổi */}
                    <div className="reward-form-grid">
                        <Form.Item 
                            name="rewardType" 
                            label="Loại phần thưởng" 
                            rules={[{ required: true, message: "Vui lòng chọn loại phần thưởng!" }]}
                        >
                            <Select placeholder="Chọn loại phần thưởng">
                                <Select.Option value="DISCOUNT_FLAT">Giảm giá tiền mặt (VND)</Select.Option>
                                <Select.Option value="DISCOUNT_PERCENTAGE">Giảm giá phần trăm (%)</Select.Option>
                                <Select.Option value="FREE_WASH">Rửa xe miễn phí</Select.Option>
                                <Select.Option value="ADDON">Dịch vụ đi kèm</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item 
                            name="pointCost" 
                            label="Số điểm quy đổi" 
                            rules={[
                                { required: true, message: "Vui lòng nhập số điểm!" },
                                { type: "number", min: 1, message: "Số điểm phải lớn hơn 0!" }
                            ]}
                        >
                            <InputNumber 
                                className="reward-form-item-full" 
                                placeholder="Ví dụ: 100" 
                                min={1}
                            />
                        </Form.Item>
                    </div>

                    {/* Dòng 2: Thời hạn sử dụng (ngày) và giá trị giảm hoặc dịch vụ áp dụng tương ứng */}
                    <div className="reward-form-grid">
                        <Form.Item 
                            name="validityDays" 
                            label="Thời hạn sử dụng (ngày)" 
                            rules={[
                                { required: true, message: "Vui lòng nhập số ngày!" },
                                { type: "number", min: 1, message: "Thời hạn phải lớn hơn 0!" }
                            ]}
                        >
                            <InputNumber 
                                className="reward-form-item-full" 
                                placeholder="Ví dụ: 30" 
                                min={1}
                            />
                        </Form.Item>

                        {/* Điều kiện hiển thị ô nhập giảm giá */}
                        {(rewardTypeWatch === "DISCOUNT_FLAT" || rewardTypeWatch === "DISCOUNT_PERCENTAGE") && (
                            <Form.Item 
                                name="discountValue" 
                                label={rewardTypeWatch === "DISCOUNT_PERCENTAGE" ? "Mức giảm (%)" : "Số tiền giảm (VND)"}
                                rules={[
                                    { required: true, message: "Vui lòng nhập giá trị giảm!" },
                                    {
                                        validator: (_, value) => {
                                            if (value === undefined || value === null) return Promise.reject();
                                            if (rewardTypeWatch === "DISCOUNT_PERCENTAGE") {
                                                if (value < 1 || value > 100) {
                                                    return Promise.reject("Phần trăm giảm giá từ 1 đến 100!");
                                                }
                                            } else {
                                                if (value <= 0) {
                                                    return Promise.reject("Số tiền giảm phải lớn hơn 0!");
                                                }
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <InputNumber 
                                    className="reward-form-item-full" 
                                    placeholder={rewardTypeWatch === "DISCOUNT_PERCENTAGE" ? "Ví dụ: 15" : "Ví dụ: 50000"} 
                                    min={1}
                                    addonAfter={rewardTypeWatch === "DISCOUNT_PERCENTAGE" ? "%" : "VND"}
                                />
                            </Form.Item>
                        )}

                        {/* Điều kiện hiển thị ô chọn dịch vụ tương ứng */}
                        {(rewardTypeWatch === "FREE_WASH" || rewardTypeWatch === "ADDON") && (
                            <Form.Item 
                                name="servicePriceId" 
                                label="Dịch vụ áp dụng"
                                rules={[{ required: true, message: "Vui lòng chọn dịch vụ!" }]}
                            >
                                <Select placeholder="Chọn dịch vụ chi tiết" allowClear>
                                    {servicePrices.map(sp => (
                                        <Select.Option key={sp.id} value={sp.id}>
                                            {(sp.service?.serviceName || "Dịch vụ") + " - " + (sp.vehicleType?.typeName || "Dòng xe") + ` (${sp.price?.toLocaleString()} VND)`}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        )}
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
