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

// servicePrices: [{ price, vehicleType: { typeName: 'SEDAN' | 'SUV' } }]
const getPriceByVehicleType = (service, typeName) => {
    const found = service?.servicePrices?.find(
        (sp) => sp.vehicleType?.typeName?.toUpperCase() === typeName.toUpperCase()
    );
    return found?.price;
};

export default function Service() {
    const [loading, setLoading] = useState(false);
    const [allData, setAllData] = useState([]); // dữ liệu gốc từ API
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

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await getAllServices();
            const list = Array.isArray(response)
                ? response
                : response?.data ?? response?.content ?? [];
            setAllData(Array.isArray(list) ? list : []);
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: "Không thể tải danh sách dịch vụ"
            });
        } finally {
            setLoading(false);
        }
    };

    // Lọc + tìm kiếm + sắp xếp ở FE vì API hiện chỉ trả toàn bộ danh sách (không hỗ trợ page/sort)
    const getFilteredData = () => {
        let result = Array.isArray(allData) ? [...allData] : [];

        if (searchName) {
            const keyword = searchName.toLowerCase();
            result = result.filter((s) => s.serviceName?.toLowerCase().includes(keyword));
        }

        if (categoryFilter) {
            result = result.filter((s) => s.category === categoryFilter);
        }

        if (sortValue) {
            const [field, order] = sortValue.split("_");
            result.sort((a, b) => {
                let valA, valB;
                if (field === "priceForSedan") {
                    valA = getPriceByVehicleType(a, 'SEDAN') ?? 0;
                    valB = getPriceByVehicleType(b, 'SEDAN') ?? 0;
                } else {
                    valA = a[field];
                    valB = b[field];
                }
                if (typeof valA === "string") {
                    return order === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
                }
                return order === "asc" ? valA - valB : valB - valA;
            });
        }

        return result;
    };

    const filteredData = getFilteredData();

    const handleSearch = (value) => {
        setSearchName(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleCategoryChange = (value) => {
        setCategoryFilter(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleSortChange = (value) => {
        setSortValue(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const showDetail = (record) => {
        setSelectedService(record);
        setDetailOpen(true);
    };

    const handleDelete = (record) => {
        confirm({
            title: "Xác nhận xóa",
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc muốn xóa dịch vụ "${record.serviceName}" không?`,
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await deleteService(record.serviceId);
                    notification.success({
                        message: "Thành công",
                        description: `Đã xóa dịch vụ "${record.serviceName}"`,
                    });
                    fetchServices();
                } catch (error) {
                    notification.error({
                        message: "Lỗi",
                        description: "Không thể xóa dịch vụ",
                    });
                }
            }
        });
    };

    // TODO: chờ backend bổ sung API PUT /api/admin/services/{id}/recover
    const handleRecover = (record) => {
        confirm({
            title: "Xác nhận khôi phục",
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc muốn khôi phục dịch vụ "${record.serviceName}" không?`,
            okText: "Khôi phục",
            okType: "primary",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await recoverService(record.serviceId);
                    notification.success({
                        message: "Thành công",
                        description: `Đã khôi phục dịch vụ "${record.serviceName}"`,
                    });
                    fetchServices();
                } catch (error) {
                    notification.error({
                        message: "Lỗi",
                        description: "Không thể khôi phục dịch vụ (API có thể chưa sẵn sàng)",
                    });
                }
            }
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
            notification.success({
                message: "Thành công",
                description: "Đã tạo dịch vụ mới"
            });
            form.resetFields();
            setModalOpen(false);
            fetchServices();
        } catch (error) {
            if (error?.errorFields) return;
            notification.error({
                message: "Lỗi",
                description: "Không thể tạo dịch vụ mới"
            });
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
            <List.Item key={service.serviceId} style={{ padding: 0, marginBottom: 16 }}>
                <div style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: 16,
                    background: '#fff',
                    border: '1px solid #f0f0f0',
                    borderRadius: 12,
                    padding: 16,
                    opacity: isActive ? 1 : 0.6,
                }}>
                    {/* Ảnh bên trái */}
                    <div style={{ flexShrink: 0, width: 160, height: 120 }}>
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

                    {/* Thông tin giữa */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <Space align="center" style={{ marginBottom: 4 }}>
                            <span style={{ fontWeight: 600, fontSize: 16 }}>{service.serviceName}</span>
                            <Tag color={categoryMeta.color}>{categoryMeta.label}</Tag>
                            <Badge
                                status={isActive ? 'success' : 'error'}
                                text={
                                    <span style={{ fontSize: 12, color: isActive ? '#52c41a' : '#ff4d4f' }}>
                                        {isActive ? 'Sẵn sàng' : 'Ngừng hoạt động'}
                                    </span>
                                }
                            />
                        </Space>
                        <p style={{
                            color: '#666',
                            margin: '4px 0 8px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                        }}>
                            {service.description || 'Chưa có mô tả'}
                        </p>
                        <Space size={16} wrap>
                            <span><CarOutlined /> Sedan: <strong>{formatCurrency(priceSedan)}</strong></span>
                            <span><CarOutlined /> SUV: <strong>{formatCurrency(priceSuv)}</strong></span>
                            <span><ClockCircleOutlined /> {service.duration ? `${service.duration} phút` : '—'}</span>
                            <span><StarOutlined /> x{service.pointMultiplier ?? 0} điểm</span>
                        </Space>
                    </div>

                    {/* Nút tác vụ bên phải */}
                    <div style={{
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: 8,
                        minWidth: 130,
                    }}>
                        <Button icon={<EyeOutlined />} onClick={() => showDetail(service)} block>
                            Xem chi tiết
                        </Button>
                        {isActive ? (
                            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(service)} block>
                                Xóa
                            </Button>
                        ) : (
                            <Button icon={<RedoOutlined />} style={{ color: 'green' }} onClick={() => handleRecover(service)} block>
                                Khôi phục
                            </Button>
                        )}
                    </div>
                </div>
            </List.Item>
        );
    };

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 16,
                flexWrap: 'wrap',
                alignItems: 'center',
            }}>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
                    Thêm dịch vụ
                </Button>
                <Space wrap>
                    <Select
                        placeholder="Lọc theo loại..."
                        allowClear
                        style={{ width: 170 }}
                        onChange={handleCategoryChange}
                    >
                        {CATEGORY_OPTIONS.map((c) => (
                            <Option key={c.value} value={c.value}>{c.label}</Option>
                        ))}
                    </Select>
                    <Select
                        placeholder="Sắp xếp theo..."
                        allowClear
                        style={{ width: 220 }}
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
                        style={{ width: 220 }}
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value);
                            if (!e.target.value) handleSearch('');
                        }}
                        onPressEnter={() => handleSearch(searchInput)}
                    />
                    <Button type="primary" icon={<SearchOutlined />} onClick={() => handleSearch(searchInput)}>
                        Tìm kiếm
                    </Button>
                </Space>
            </div>

            <List
                dataSource={filteredData}
                loading={loading}
                locale={{ emptyText: <Empty description="Không có dịch vụ nào" /> }}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: filteredData.length,
                    onChange: (page, pageSize) => setPagination({ current: page, pageSize })
                }}
                renderItem={renderServiceItem}
            />

            {/* Modal chi tiết dịch vụ */}
            <Modal
                title={selectedService?.serviceName}
                open={detailOpen}
                onCancel={() => setDetailOpen(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailOpen(false)}>Đóng</Button>
                ]}
                width={680}
            >
                {selectedService && (
                    <div>
                        <Image
                            src={selectedService.image}
                            alt={selectedService.serviceName}
                            style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
                            fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='680' height='280' viewBox='0 0 680 280'%3E%3Crect width='680' height='280' fill='%23f0f0f0'/%3E%3C/svg%3E"
                        />

                        <Descriptions column={2} bordered size="small">
                            <Descriptions.Item label="Loại dịch vụ" span={2}>
                                {getCategoryMeta(selectedService.category).label}
                            </Descriptions.Item>
                            <Descriptions.Item label="Giá Sedan">{formatCurrency(getPriceByVehicleType(selectedService, 'SEDAN'))}</Descriptions.Item>
                            <Descriptions.Item label="Giá SUV">{formatCurrency(getPriceByVehicleType(selectedService, 'SUV'))}</Descriptions.Item>
                            <Descriptions.Item label="Thời gian thực hiện">{selectedService.duration} phút</Descriptions.Item>
                            <Descriptions.Item label="Điểm tích lũy">x{selectedService.pointMultiplier}</Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left" style={{ fontSize: 14 }}>Mô tả</Divider>
                        <p>{selectedService.description || "Chưa có mô tả"}</p>

                        {selectedService.steps?.length > 0 && (
                            <>
                                <Divider orientation="left" style={{ fontSize: 14 }}>Các bước thực hiện</Divider>
                                <ol style={{ paddingLeft: 20 }}>
                                    {[...selectedService.steps]
                                        .sort((a, b) => (a.step ?? 0) - (b.step ?? 0))
                                        .map((s, idx) => (
                                            <li key={s.step ?? idx} style={{ marginBottom: 4 }}>{s.stepDescription}</li>
                                        ))}
                                </ol>
                            </>
                        )}

                        {selectedService.highlights?.length > 0 && (
                            <>
                                <Divider orientation="left" style={{ fontSize: 14 }}>Điểm nổi bật</Divider>
                                <Space direction="vertical" size={4}>
                                    {selectedService.highlights.map((h, idx) => (
                                        <Space key={idx}>
                                            - {h.highlightDescription}
                                        </Space>
                                    ))}
                                </Space>
                            </>
                        )}
                    </div>
                )}
            </Modal>

            {/* Modal thêm dịch vụ */}
            <Modal
                title={
                    <Space>
                        <PlusOutlined />
                        <span>Thêm dịch vụ mới</span>
                    </Space>
                }
                open={modalOpen}
                onOk={handleAddService}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                okText="Tạo dịch vụ"
                cancelText="Hủy"
                confirmLoading={addLoading}
                destroyOnClose
                width={640}
            >
                <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
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

                    <Space style={{ width: '100%' }} size={16}>
                        <Form.Item
                            label="Loại dịch vụ"
                            name="category"
                            rules={[{ required: true, message: 'Vui lòng chọn loại dịch vụ' }]}
                            style={{ flex: 1 }}
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
                            style={{ flex: 1 }}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="30" />
                        </Form.Item>

                        <Form.Item
                            label="Hệ số điểm"
                            name="pointMultiplier"
                            rules={[{ required: true, message: 'Vui lòng nhập hệ số điểm' }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="1" />
                        </Form.Item>
                    </Space>

                    <Space style={{ width: '100%' }} size={16}>
                        <Form.Item
                            label="Giá cho Sedan (VNĐ)"
                            name="priceForSedan"
                            rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="100000"
                                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>

                        <Form.Item
                            label="Giá cho SUV (VNĐ)"
                            name="priceForSuv"
                            rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="150000"
                                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                    </Space>

                    <Form.Item
                        label="Hình ảnh (URL)"
                        name="image"
                        rules={[{ required: true, message: 'Vui lòng nhập đường dẫn ảnh' }]}
                    >
                        <Input placeholder="https://..." />
                    </Form.Item>

                    {/* Danh sách các bước thực hiện - nhập động */}
                    <Form.Item label="Các bước thực hiện">
                        <Form.List name="steps">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...rest }) => (
                                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                            <Form.Item
                                                {...rest}
                                                name={name}
                                                style={{ marginBottom: 0, width: 480 }}
                                                rules={[{ required: true, message: 'Nhập nội dung bước' }]}
                                            >
                                                <Input placeholder={`Bước ${name + 1}`} />
                                            </Form.Item>
                                            <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f' }} />
                                        </Space>
                                    ))}
                                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                                        Thêm bước
                                    </Button>
                                </>
                            )}
                        </Form.List>
                    </Form.Item>

                    {/* Danh sách điểm nổi bật - nhập động */}
                    <Form.Item label="Điểm nổi bật">
                        <Form.List name="highLights">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...rest }) => (
                                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                            <Form.Item
                                                {...rest}
                                                name={name}
                                                style={{ marginBottom: 0, width: 480 }}
                                                rules={[{ required: true, message: 'Nhập nội dung' }]}
                                            >
                                                <Input placeholder="VD: Bảo vệ sơn xe" />
                                            </Form.Item>
                                            <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f' }} />
                                        </Space>
                                    ))}
                                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
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