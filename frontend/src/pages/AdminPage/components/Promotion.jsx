import { useState, useEffect } from 'react';
import {
    Table, Button, Input, Select, Tag, Modal, Form,
    DatePicker, InputNumber, Space, Popconfirm, message, Typography
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    SearchOutlined, PercentageOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    getPromotions, getServices, createPromotion,
    updatePromotion, deletePromotion
} from '../../../service/adminService';
import './Promotion.css';

const { Title, Text } = Typography;

export default function Promotion() {
    const [promotions, setPromotions] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // State cho Modal Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Tải danh sách khuyến mãi từ API
    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const data = await getPromotions();
            setPromotions(data || []);
        } catch (error) {
            message.error(error.response?.data?.message || error.message || "Không thể tải danh sách khuyến mãi");
        } finally {
            setLoading(false);
        }
    };

    // Tải danh sách dịch vụ từ API để chọn
    const fetchServices = async () => {
        try {
            const result = await getServices();
            setServices(result?.data || []);
        } catch (error) {
            console.error("Không thể tải danh sách dịch vụ:", error);
        }
    };

    useEffect(() => {
        fetchPromotions();
        fetchServices();
    }, []);

    // Mở Form Thêm mới
    const handleAddClick = () => {
        setEditingId(null);
        form.resetFields();
        form.setFieldsValue({
            maxUsesPerCustomer: 1 // Gán giá trị mặc định là 1 lượt/khách
        });
        setIsModalOpen(true);
    };

    // Mở Form Cập nhật
    const handleEditClick = (record) => {
        // Tìm serviceId tương ứng dựa vào serviceName trong danh sách services đã tải
        const matchedService = services.find(s => s.serviceName === record.serviceName);

        setEditingId(record.id);
        form.setFieldsValue({
            promotionName: record.promotionName,
            description: record.description,
            discountValue: record.discountValue,
            maxUsesTotal: record.maxUsesTotal,
            maxUsesPerCustomer: record.maxUsesPerCustomer,
            serviceId: matchedService ? matchedService.serviceId : null,
            dateRange: [dayjs(record.startDate), dayjs(record.endDate)]
        });
        setIsModalOpen(true);
    };

    // Xóa khuyến mãi
    const handleDelete = async (id) => {
        try {
            await deletePromotion(id);
            message.success("Xóa khuyến mãi thành công!");
            fetchPromotions();
        } catch (error) {
            message.error(error.response?.data?.message || "Không thể xóa khuyến mãi");
        }
    };

    // Xử lý Gửi Form (Lưu / Cập nhật)
    const handleFormSubmit = async (values) => {
        setSubmitting(true);
        try {
            const payload = {
                promotionName: values.promotionName,
                description: values.description,
                startDate: values.dateRange[0].format('YYYY-MM-DDTHH:mm:ss'),
                endDate: values.dateRange[1].format('YYYY-MM-DDTHH:mm:ss'),
                discountType: 'PERCENTAGE', // Luôn gửi PERCENTAGE
                discountValue: values.discountValue,
                maxUsesTotal: values.maxUsesTotal,
                maxUsesPerCustomer: values.maxUsesPerCustomer,
                serviceId: values.serviceId || null, // ID dịch vụ cụ thể hoặc null (tất cả dịch vụ)
                minTierId: null, // Mặc định áp dụng tất cả hạng
                usageCount: 0
            };

            if (editingId) {
                await updatePromotion(editingId, payload);
                message.success("Cập nhật khuyến mãi thành công!");
            } else {
                await createPromotion(payload);
                message.success("Thêm khuyến mãi mới thành công!");
            }

            setIsModalOpen(false);
            fetchPromotions();
        } catch (error) {
            message.error(error.response?.data?.message || "Đã xảy ra lỗi khi lưu thông tin");
        } finally {
            setSubmitting(false);
        }
    };

    // Xác định trạng thái Khuyến mãi để hiển thị Tag màu
    const getStatusTag = (record) => {
        const now = dayjs();
        const start = dayjs(record.startDate);
        const end = dayjs(record.endDate);

        if (record.usageCount >= record.maxUsesTotal) {
            return <Tag color="default">Hết lượt</Tag>;
        } else if (now.isBefore(start)) {
            return <Tag color="blue">Sắp diễn ra</Tag>;
        } else if (now.isAfter(end)) {
            return <Tag color="red">Đã kết thúc</Tag>;
        } else {
            return <Tag color="green">Đang diễn ra</Tag>;
        }
    };

    // Lọc danh sách khuyến mãi dựa trên Tìm kiếm & Bộ lọc trạng thái
    const filteredPromotions = promotions.filter(promo => {
        // Chỉ hiển thị khuyến mãi đang hoạt động (chưa bị xóa mềm)
        if (!promo.active) return false;

        const matchesSearch = promo.promotionName?.toLowerCase().includes(searchText.toLowerCase());

        if (statusFilter === 'ALL') return matchesSearch;

        const now = dayjs();
        const start = dayjs(promo.startDate);
        const end = dayjs(promo.endDate);

        if (statusFilter === 'ACTIVE') {
            return matchesSearch && now.isAfter(start) && now.isBefore(end) && promo.usageCount < promo.maxUsesTotal;
        }
        if (statusFilter === 'UPCOMING') {
            return matchesSearch && now.isBefore(start);
        }
        if (statusFilter === 'EXPIRED') {
            return matchesSearch && (now.isAfter(end) || promo.usageCount >= promo.maxUsesTotal);
        }
        return matchesSearch;
    });

    const columns = [
        {
            title: 'TÊN KHUYẾN MÃI',
            dataIndex: 'promotionName',
            key: 'promotionName',
            render: (text, record) => (
                <div>
                    <Text strong className="promotion-name-text">{text}</Text>
                    <div className="promotion-desc-text">{record.description}</div>
                </div>
            )
        },
        {
            title: 'MỨC GIẢM (%)',
            dataIndex: 'discountValue',
            key: 'discountValue',
            render: (val) => (
                <Tag icon={<PercentageOutlined />} color="cyan" style={{ fontWeight: '600' }}>
                    {val}%
                </Tag>
            )
        },
        {
            title: 'DỊCH VỤ ÁP DỤNG',
            dataIndex: 'serviceName',
            key: 'serviceName',
            render: (name) => (
                name ? <Tag color="blue">{name}</Tag> : <Tag color="purple">Tất cả dịch vụ</Tag>
            )
        },
        {
            title: 'THỜI GIAN ÁP DỤNG',
            key: 'dateRange',
            render: (_, record) => (
                <div className="promotion-date-text">
                    <div><Text type="secondary">Từ:</Text> {dayjs(record.startDate).format('DD/MM/YYYY HH:mm')}</div>
                    <div><Text type="secondary">Đến:</Text> {dayjs(record.endDate).format('DD/MM/YYYY HH:mm')}</div>
                </div>
            )
        },
        {
            title: 'LƯỢT SỬ DỤNG',
            key: 'usage',
            render: (_, record) => (
                <div style={{ fontSize: '13px' }}>
                    <div><Text type="secondary">Tổng quát:</Text> {record.usageCount} / {record.maxUsesTotal}</div>
                    <div><Text type="secondary">Mỗi khách:</Text> Tối đa {record.maxUsesPerCustomer} lần</div>
                </div>
            )
        },
        {
            title: 'TRẠNG THÁI',
            key: 'status',
            render: (_, record) => getStatusTag(record)
        },
        {
            title: 'THAO TÁC',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="text"
                        icon={<EditOutlined style={{ color: '#1890ff' }} />}
                        onClick={() => handleEditClick(record)}
                    />
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa khuyến mãi này?"
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
                </Space>
            )
        }
    ];

    return (
        <div className="promotion-container">
            <div className="promotion-header">
                <div>
                    <Title level={3} className="promotion-header-title">QUẢN LÝ KHUYẾN MÃI</Title>
                    <Text type="secondary">Tạo mới, chỉnh sửa thông tin và quản lý các chương trình ưu đãi của hệ thống</Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    onClick={handleAddClick}
                    className="promotion-add-btn"
                >
                    Thêm Khuyến Mãi
                </Button>
            </div>

            {/* Thanh Tìm Kiếm và Lọc */}
            <Space className="promotion-filter-bar">
                <Input
                    placeholder="Tìm tên khuyến mãi..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="promotion-search-input"
                />
                <Select
                    value={statusFilter}
                    onChange={setStatusFilter}
                    className="promotion-status-select"
                >
                    <Select.Option value="ALL">Tất cả trạng thái</Select.Option>
                    <Select.Option value="ACTIVE">Đang diễn ra</Select.Option>
                    <Select.Option value="UPCOMING">Sắp diễn ra</Select.Option>
                    <Select.Option value="EXPIRED">Đã kết thúc / Hết lượt</Select.Option>
                </Select>
            </Space>

            {/* Bảng Hiển Thị */}
            <Table
                columns={columns}
                dataSource={filteredPromotions}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 8 }}
                className="promotion-table"
            />

            {/* Modal Thêm / Sửa */}
            <Modal
                title={editingId ? "CẬP NHẬT CHƯƠNG TRÌNH KHUYẾN MÃI" : "TẠO CHƯƠNG TRÌNH KHUYẾN MÃI MỚI"}
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
                    className="promotion-form"
                >
                    <Form.Item
                        name="promotionName"
                        label="Tên Chương Trình Khuyến Mãi"
                        rules={[{ required: true, message: 'Vui lòng nhập tên chương trình!' }]}
                    >
                        <Input placeholder="Ví dụ: Giáng Sinh An Lành 2026" />
                    </Form.Item>

                    <Form.Item name="description" label="Mô Tả Chi Tiết">
                        <Input.TextArea rows={3} placeholder="Mô tả quyền lợi, dịch vụ áp dụng..." />
                    </Form.Item>

                    {/* Dòng 1: Mức giảm (%) và Dịch vụ áp dụng */}
                    <div className="promotion-form-grid">
                        <Form.Item
                            name="discountValue"
                            label="Mức giảm giá (%)"
                            rules={[{ required: true, message: 'Vui lòng nhập mức giảm!' }]}
                        >
                            <InputNumber
                                min={0}
                                max={100}
                                addonAfter="%"
                                className="promotion-form-item-full"
                                placeholder="Ví dụ: 10"
                            />
                        </Form.Item>

                        <Form.Item
                            name="serviceId"
                            label="Dịch vụ áp dụng"
                        >
                            <Select placeholder="Chọn dịch vụ áp dụng" allowClear>
                                <Select.Option value={null}>Áp dụng cho tất cả dịch vụ</Select.Option>
                                {services.map(s => (
                                    <Select.Option key={s.serviceId} value={s.serviceId}>
                                        {s.serviceName}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    {/* Dòng 2: Tổng lượt dùng tối đa và Lượt dùng/khách hàng */}
                    <div className="promotion-form-grid">
                        <Form.Item
                            name="maxUsesTotal"
                            label="Tổng số lượt sử dụng tối đa"
                            rules={[{ required: true, message: 'Vui lòng nhập lượt dùng tối đa!' }]}
                        >
                            <InputNumber min={1} className="promotion-form-item-full" placeholder="Ví dụ: 1000" />
                        </Form.Item>

                        <Form.Item
                            name="maxUsesPerCustomer"
                            label="Lượt dùng tối đa mỗi khách hàng"
                            rules={[{ required: true, message: 'Vui lòng nhập lượt dùng/khách hàng!' }]}
                        >
                            <InputNumber min={1} className="promotion-form-item-full" placeholder="Mặc định: 1" />
                        </Form.Item>
                    </div>

                    {/* Dòng 3: Khoảng thời gian áp dụng */}
                    <Form.Item
                        name="dateRange"
                        label="Khoảng Thời Gian Áp Dụng"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu và kết thúc!' }]}
                    >
                        <DatePicker.RangePicker
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            className="promotion-form-item-full"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}