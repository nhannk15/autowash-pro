import React, { useEffect, useState } from "react";
import {
    List, Input, Button, Space, Tag, Modal,
    notification, Select, Badge, Form,
    InputNumber, Descriptions, Image, Divider, Empty
} from 'antd';
import {
    SearchOutlined, DeleteOutlined, EyeOutlined,
    ExclamationCircleOutlined, RedoOutlined, PlusOutlined,
    MinusCircleOutlined, CarOutlined, ClockCircleOutlined, StarOutlined
} from '@ant-design/icons';
import {
    getAllServices, addService, deleteService, recoverService
} from "../../../service/adminService";
import './Service.css';

const { confirm } = Modal;
const { Option } = Select;
const { TextArea } = Input;

const CATEGORY_OPTIONS = [
    { value: "BASIC", label: "Cơ bản", color: "blue" },
    { value: "PREMIUM", label: "Cao cấp", color: "gold" },
    { value: "ADDON", label: "Dịch vụ thêm", color: "purple" },
];

const getCategoryMeta = (category) =>
    CATEGORY_OPTIONS.find((c) => c.value === category) || { label: category, color: "default" };

const formatCurrency = (value) =>
    value || value === 0 ? `${Number(value).toLocaleString('vi-VN')}đ` : '—';

const getPriceByVehicleType = (service, typeName) => {
    const found = service?.servicePrices?.find(
        (sp) => sp.vehicleType?.typeName?.toUpperCase() === typeName.toUpperCase()
    );
    return found?.price;
};

export default function Service() {
    const [loading, setLoading] = useState(false);
    const [allData, setAllData] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 6 });

    const [searchInput, setSearchInput] = useState("");
    const [searchName, setSearchName] = useState("");
    const [categoryFilter, setCategoryFilter] = useState(null);
    const [sortValue, setSortValue] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [form] = Form.useForm();

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);

    useEffect(() => { fetchServices(); }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await getAllServices();
            const list = Array.isArray(response)
                ? response
                : response?.data ?? response?.content ?? [];
            setAllData(Array.isArray(list) ? list : []);
        } catch {
            notification.error({ message: "Lỗi", description: "Không thể tải danh sách dịch vụ" });
        } finally {
            setLoading(false);
        }
    };

    const getFilteredData = () => {
        let result = Array.isArray(allData) ? [...allData] : [];
        if (searchName) {
            const kw = searchName.toLowerCase();
            result = result.filter((s) => s.serviceName?.toLowerCase().includes(kw));
        }
        if (categoryFilter) result = result.filter((s) => s.category === categoryFilter);
        if (sortValue) {
            const [field, order] = sortValue.split("_");
            result.sort((a, b) => {
                let valA, valB;
                if (field === "priceForSedan") {
                    valA = getPriceByVehicleType(a, 'SEDAN') ?? 0;
                    valB = getPriceByVehicleType(b, 'SEDAN') ?? 0;
                } else {
                    valA = a[field]; valB = b[field];
                }
                if (typeof valA === "string") return order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
                return order === "asc" ? valA - valB : valB - valA;
            });
        }
        return result;
    };

    const filteredData = getFilteredData();

    const handleSearch = (value) => { setSearchName(value); setPagination(p => ({ ...p, current: 1 })); };
    const handleCategoryChange = (value) => { setCategoryFilter(value); setPagination(p => ({ ...p, current: 1 })); };
    const handleSortChange = (value) => { setSortValue(value); setPagination(p => ({ ...p, current: 1 })); };
    const showDetail = (record) => { setSelectedService(record); setDetailOpen(true); };

    const handleDelete = (record) => {
        confirm({
            title: "Xác nhận xóa",
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc muốn xóa dịch vụ "${record.serviceName}" không?`,
            okText: "Xóa", okType: "danger", cancelText: "Hủy",
            onOk: async () => {
                try {
                    await deleteService(record.serviceId);
                    notification.success({ message: "Thành công", description: `Đã xóa dịch vụ "${record.serviceName}"` });
                    fetchServices();
                } catch {
                    notification.error({ message: "Lỗi", description: "Không thể xóa dịch vụ" });
                }
            },
        });
    };

    const handleRecover = (record) => {
        confirm({
            title: "Xác nhận khôi phục",
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc muốn khôi phục dịch vụ "${record.serviceName}" không?`,
            okText: "Khôi phục", okType: "primary", cancelText: "Hủy",
            onOk: async () => {
                try {
                    await recoverService(record.serviceId);
                    notification.success({ message: "Thành công", description: `Đã khôi phục dịch vụ "${record.serviceName}"` });
                    fetchServices();
                } catch {
                    notification.error({ message: "Lỗi", description: "Không thể khôi phục dịch vụ" });
                }
            },
        });
    };

    const handleAddService = async () => {
        try {
            const values = await form.validateFields();
            setAddLoading(true);
            const payload = {
                ...values,
                steps: (values.steps || []).filter(Boolean),
                highLights: (values.highLights || []).filter(Boolean),
            };
            await addService(payload);
            notification.success({ message: "Thành công", description: "Đã tạo dịch vụ mới" });
            form.resetFields();
            setModalOpen(false);
            fetchServices();
        } catch (error) {
            if (error?.errorFields) return;
            notification.error({ message: "Lỗi", description: "Không thể tạo dịch vụ mới" });
        } finally {
            setAddLoading(false);
        }
    };

    const renderServiceItem = (service) => {
        const categoryMeta = getCategoryMeta(service.category);
        const isActive = service.active !== false;
        const priceSedan = getPriceByVehicleType(service, 'SEDAN');
        const priceSuv = getPriceByVehicleType(service, 'SUV');

        return (
            <List.Item key={service.serviceId} className="service-list-item">
                <div className={`service-item${isActive ? '' : ' service-item--inactive'}`}>
                    {/* Thumbnail */}
                    <div className="service-item__image">
                        <Image
                            src={service.image}
                            alt={service.serviceName}
                            width={160}
                            height={120}
                            style={{ objectFit: 'cover', borderRadius: 8 }}
                            fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='120' viewBox='0 0 160 120'%3E%3Crect width='160' height='120' fill='%23f0f0f0'/%3E%3C/svg%3E"
                            preview={false}
                        />
                    </div>

                    {/* Info */}
                    <div className="service-item__info">
                        <div className="service-item__header">
                            <span className="service-item__name">{service.serviceName}</span>
                            <Tag color={categoryMeta.color} className="service-category-tag">
                                {categoryMeta.label}
                            </Tag>
                            <Badge
                                status={isActive ? 'success' : 'error'}
                                text={
                                    <span className={isActive ? 'service-status-active' : 'service-status-inactive'}>
                                        {isActive ? 'Sẵn sàng' : 'Ngừng hoạt động'}
                                    </span>
                                }
                            />
                        </div>

                        <p className="service-item__desc">
                            {service.description || 'Chưa có mô tả'}
                        </p>

                        <div className="service-item__meta">
                            <span><CarOutlined /> Sedan: <strong>{formatCurrency(priceSedan)}</strong></span>
                            <span><CarOutlined /> SUV: <strong>{formatCurrency(priceSuv)}</strong></span>
                            <span><ClockCircleOutlined /> {service.duration ? `${service.duration} phút` : '—'}</span>
                            <span><StarOutlined /> x{service.pointMultiplier ?? 0} điểm</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="service-item__actions">
                        <Button
                            icon={<EyeOutlined />}
                            className="service-item__btn service-item__btn--view"
                            onClick={() => showDetail(service)}
                            block
                        >
                            Xem chi tiết
                        </Button>
                        {isActive ? (
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                className="service-item__btn"
                                onClick={() => handleDelete(service)}
                                block
                            >
                                Xóa
                            </Button>
                        ) : (
                            <Button
                                icon={<RedoOutlined />}
                                className="service-item__btn service-item__btn--recover"
                                onClick={() => handleRecover(service)}
                                block
                            >
                                Khôi phục
                            </Button>
                        )}
                    </div>
                </div>
            </List.Item>
        );
    };

    return (
        <div className="service-page">
            {/* ── Toolbar ── */}
            <div className="service-toolbar">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="service-add-btn"
                    onClick={() => setModalOpen(true)}
                >
                    Thêm dịch vụ
                </Button>

                <div className="service-toolbar-right">
                    <Select
                        placeholder="Lọc theo loại..."
                        allowClear
                        className="service-toolbar-select--category"
                        onChange={handleCategoryChange}
                    >
                        {CATEGORY_OPTIONS.map((c) => (
                            <Option key={c.value} value={c.value}>{c.label}</Option>
                        ))}
                    </Select>

                    <Select
                        placeholder="Sắp xếp theo..."
                        allowClear
                        className="service-toolbar-select--sort"
                        onChange={handleSortChange}
                    >
                        <Option value="serviceName_asc">Tên: A → Z</Option>
                        <Option value="serviceName_desc">Tên: Z → A</Option>
                        <Option value="priceForSedan_asc">Giá Sedan: Thấp → Cao</Option>
                        <Option value="priceForSedan_desc">Giá Sedan: Cao → Thấp</Option>
                    </Select>

                    <Input
                        placeholder="Tìm theo tên dịch vụ..."
                        allowClear
                        className="service-toolbar-search"
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value);
                            if (!e.target.value) handleSearch('');
                        }}
                        onPressEnter={() => handleSearch(searchInput)}
                    />

                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        className="service-toolbar-btn"
                        onClick={() => handleSearch(searchInput)}
                    >
                        Tìm kiếm
                    </Button>
                </div>
            </div>

            {/* ── List ── */}
            <List
                className="service-list"
                dataSource={filteredData}
                loading={loading}
                locale={{ emptyText: <Empty description="Không có dịch vụ nào" /> }}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: filteredData.length,
                    onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                }}
                renderItem={renderServiceItem}
            />

            {/* ── Modal chi tiết ── */}
            <Modal
                title={
                    <span className="service-detail-modal-title">
                        {selectedService?.serviceName}
                    </span>
                }
                open={detailOpen}
                onCancel={() => setDetailOpen(false)}
                footer={[<Button key="close" onClick={() => setDetailOpen(false)}>Đóng</Button>]}
                width={680}
                className="service-detail-modal"
            >
                {selectedService && (
                    <div>
                        <Image
                            src={selectedService.image}
                            alt={selectedService.serviceName}
                            className="service-detail-image"
                            style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
                            fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='680' height='280' viewBox='0 0 680 280'%3E%3Crect width='680' height='280' fill='%23f0f0f0'/%3E%3C/svg%3E"
                        />

                        <Descriptions
                            column={2}
                            bordered
                            size="small"
                            className="service-detail-descriptions"
                        >
                            <Descriptions.Item label="Loại dịch vụ" span={2}>
                                {getCategoryMeta(selectedService.category).label}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá Sedan">
                                {formatCurrency(getPriceByVehicleType(selectedService, 'SEDAN'))}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá SUV">
                                {formatCurrency(getPriceByVehicleType(selectedService, 'SUV'))}
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian thực hiện">
                                {selectedService.duration} phút
                            </Descriptions.Item>
                            <Descriptions.Item label="Điểm tích lũy">
                                x{selectedService.pointMultiplier}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left" style={{ fontSize: 14 }}>Mô tả</Divider>
                        <p className="service-detail-desc">{selectedService.description || "Chưa có mô tả"}</p>

                        {selectedService.steps?.length > 0 && (
                            <>
                                <Divider orientation="left" style={{ fontSize: 14 }}>Các bước thực hiện</Divider>
                                <ol className="service-detail-steps">
                                    {[...selectedService.steps]
                                        .sort((a, b) => (a.step ?? 0) - (b.step ?? 0))
                                        .map((s, idx) => (
                                            <li key={s.step ?? idx}>{s.stepDescription}</li>
                                        ))}
                                </ol>
                            </>
                        )}

                        {selectedService.highlights?.length > 0 && (
                            <>
                                <Divider orientation="left" style={{ fontSize: 14 }}>Điểm nổi bật</Divider>
                                <div className="service-detail-highlights">
                                    {selectedService.highlights.map((h, idx) => (
                                        <span key={idx} className="service-detail-highlight-item">
                                            — {h.highlightDescription}
                                        </span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>

            {/* ── Modal thêm dịch vụ ── */}
            <Modal
                title={
                    <Space>
                        <PlusOutlined />
                        <span>Thêm dịch vụ mới</span>
                    </Space>
                }
                open={modalOpen}
                onOk={handleAddService}
                onCancel={() => { setModalOpen(false); form.resetFields(); }}
                okText="Tạo dịch vụ"
                cancelText="Hủy"
                confirmLoading={addLoading}
                destroyOnClose
                width={640}
                className="service-add-modal"
            >
                <Form form={form} layout="vertical" className="service-form">
                    <Form.Item
                        label="Tên dịch vụ"
                        name="serviceName"
                        rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ' }]}
                    >
                        <Input placeholder="Rửa xe cơ bản" />
                    </Form.Item>

                    <Form.Item label="Mô tả" name="description">
                        <TextArea rows={3} placeholder="Mô tả ngắn về dịch vụ..." />
                    </Form.Item>

                    <div className="service-form-row">
                        <Form.Item
                            label="Loại dịch vụ"
                            name="category"
                            rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ' }]}
                        >
                            <Select placeholder="Chọn loại">
                                {CATEGORY_OPTIONS.map((c) => (
                                    <Option key={c.value} value={c.value}>{c.label}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Thời gian (phút)"
                            name="durationMinutes"
                            rules={[{ required: true, message: 'Vui lòng nhập thời gian' }]}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="30" />
                        </Form.Item>

                        <Form.Item
                            label="Hệ số điểm"
                            name="pointMultiplier"
                            rules={[{ required: true, message: 'Vui lòng nhập hệ số điểm' }]}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="1" />
                        </Form.Item>
                    </div>

                    <div className="service-form-row service-form-row--2col">
                        <Form.Item
                            label="Giá cho Sedan (VNĐ)"
                            name="priceForSedan"
                            rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                        >
                            <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                                placeholder="100000"
                                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Giá cho SUV (VNĐ)"
                            name="priceForSuv"
                            rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                        >
                            <InputNumber
                                min={0}
                                style={{ width: '100%' }}
                                placeholder="150000"
                                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            />
                        </Form.Item>
                    </div>

                    <Form.Item
                        label="Hình ảnh (URL)"
                        name="image"
                        rules={[{ required: true, message: 'Vui lòng nhập đường dẫn ảnh' }]}
                    >
                        <Input placeholder="https://..." />
                    </Form.Item>

                    {/* Dynamic steps */}
                    <Form.Item label="Các bước thực hiện">
                        <Form.List name="steps">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...rest }) => (
                                        <div key={key} className="service-form-dynamic-row">
                                            <Form.Item
                                                {...rest}
                                                name={name}
                                                rules={[{ required: true, message: 'Nhập nội dung bước' }]}
                                                style={{ flex: 1, marginBottom: 0 }}
                                            >
                                                <Input placeholder={`Bước ${name + 1}`} />
                                            </Form.Item>
                                            <MinusCircleOutlined
                                                className="service-form-remove-icon"
                                                onClick={() => remove(name)}
                                            />
                                        </div>
                                    ))}
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        icon={<PlusOutlined />}
                                        className="service-form-dynamic-add-btn"
                                        block
                                    >
                                        Thêm bước
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Form.Item>

                    {/* Dynamic highlights */}
                    <Form.Item label="Điểm nổi bật">
                        <Form.List name="highLights">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...rest }) => (
                                        <div key={key} className="service-form-dynamic-row">
                                            <Form.Item
                                                {...rest}
                                                name={name}
                                                rules={[{ required: true, message: 'Nhập nội dung' }]}
                                                style={{ flex: 1, marginBottom: 0 }}
                                            >
                                                <Input placeholder="VD: Bảo vệ sơn xe" />
                                            </Form.Item>
                                            <MinusCircleOutlined
                                                className="service-form-remove-icon"
                                                onClick={() => remove(name)}
                                            />
                                        </div>
                                    ))}
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        icon={<PlusOutlined />}
                                        className="service-form-dynamic-add-btn"
                                        block
                                    >
                                        Thêm điểm nổi bật
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}