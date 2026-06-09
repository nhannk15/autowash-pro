import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Spin, Alert, Empty, Card, Button, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, CarOutlined, DeleteOutlined } from '@ant-design/icons';
import './MyCars.css';

export default function MyCars() {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();

    const customerId = 3; // Sử dụng ID khách hàng là 3 theo yêu cầu (không sửa backend)

    // Tải danh sách xe của khách hàng
    const fetchVehicles = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/vehicles/user/${customerId}`);
            if (!response.ok) {
                throw new Error("Không thể tải danh sách xe của bạn.");
            }
            const result = await response.json();
            const vehicleList = result && result.data ? result.data : [];
            setVehicles(vehicleList);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Tải danh sách phân khúc xe (Sedan, SUV...) để điền vào Form thêm xe
    const fetchVehicleTypes = async () => {
        try {
            const response = await fetch('/api/vehicle-types');
            if (response.ok) {
                const result = await response.json();
                setVehicleTypes(result && result.data ? result.data : []);
            }
        } catch (err) {
            console.error("Lỗi tải danh sách phân khúc xe:", err);
        }
    };

    useEffect(() => {
        fetchVehicles();
        fetchVehicleTypes();
    }, [user]);

    // Xử lý Thêm xe mới
    const handleAddVehicle = async (values) => {
        setSubmitting(true);
        try {
            const response = await fetch('/api/vehicles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    brand: values.brand,
                    model: values.model,
                    licensePlate: values.licensePlate,
                    color: values.color,
                    vehicleType: {
                        id: values.vehicleTypeId
                    },
                    customer: {
                        id: customerId
                    },
                    isActive: true
                }),
            });

            if (!response.ok) {
                throw new Error("Không thể thêm xe mới. Biển số xe có thể đã tồn tại!");
            }

            message.success("Thêm xe mới thành công!");
            setIsModalOpen(false);
            form.resetFields();
            fetchVehicles(); // Tải lại danh sách xe
        } catch (err) {
            message.error(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Xử lý Xóa xe
    const handleDeleteVehicle = async (vehicleId) => {
        try {
            const response = await fetch(`/api/vehicles/${vehicleId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error("Không thể xóa xe.");
            }
            message.success("Xóa xe thành công!");
            fetchVehicles(); // Tải lại danh sách xe
        } catch (err) {
            message.error(err.message);
        }
    };

    return (
        <div className="mycars-container">
            {/* Header */}
            <div className="mycars-header">
                <div>
                    <h1 className="mycars-title">XE CỦA TÔI</h1>
                    <p className="mycars-subtitle">Quản lý danh sách phương tiện của bạn đăng ký trong hệ thống.</p>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    className="mycars-add-btn"
                    onClick={() => setIsModalOpen(true)}
                    size="large"
                >
                    THÊM XE MỚI
                </Button>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <Spin size="large" tip="Đang tải danh sách xe..." />
                </div>
            ) : error ? (
                <Alert message="Có lỗi xảy ra" description={error} type="error" showIcon style={{ marginBottom: '24px' }} />
            ) : vehicles.length === 0 ? (
                <Empty 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                    description="Bạn chưa đăng ký phương tiện nào." 
                    style={{ padding: '60px 0' }}
                >
                    <Button type="primary" onClick={() => setIsModalOpen(true)}>Đăng ký xe ngay</Button>
                </Empty>
            ) : (
                <div className="mycars-grid">
                    {vehicles.map((vehicle) => {
                        const isSedan = vehicle.typeName === 'SEDAN';
                        return (
                            <Card key={vehicle.vehicleId} className="mycar-card" bordered={false}>
                                <div className="mycar-card__content">
                                    {/* Nút xóa xe */}
                                    <div className="mycar-card__badge-active">
                                        <Popconfirm
                                            title="Xóa phương tiện"
                                            description="Bạn có chắc chắn muốn xóa xe này ra khỏi danh sách?"
                                            onConfirm={() => handleDeleteVehicle(vehicle.vehicleId)}
                                            okText="Xóa"
                                            cancelText="Hủy"
                                            okButtonProps={{ danger: true }}
                                        >
                                            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                                        </Popconfirm>
                                    </div>

                                    {/* Icon phân khúc xe */}
                                    <div className="mycar-card__icon-wrapper">
                                        {isSedan ? <CarOutlined /> : <span style={{ fontSize: '24px' }}>🚙</span>}
                                    </div>

                                    {/* Tên hãng & model */}
                                    <h3 className="mycar-card__name">{vehicle.brand} {vehicle.model}</h3>
                                    
                                    {/* Phân khúc xe */}
                                    <span className="mycar-card__type">
                                        {isSedan ? 'Sedan (4-5 chỗ)' : 'SUV (5-7 chỗ)'}
                                    </span>

                                    {/* Chi tiết biển số & màu sắc */}
                                    <div className="mycar-card__details">
                                        <div className="mycar-detail-row">
                                            <span className="mycar-detail-label">Biển số:</span>
                                            <span className="mycar-detail-value license-plate">{vehicle.licensePlate}</span>
                                        </div>
                                        <div className="mycar-detail-row">
                                            <span className="mycar-detail-label">Màu sắc:</span>
                                            <span className="mycar-detail-value">{vehicle.color || 'Chưa cập nhật'}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Modal Thêm xe mới */}
            <Modal
                title={<span style={{ fontSize: '18px', fontWeight: 'bold', color: '#002b7f' }}>ĐĂNG KÝ PHƯƠNG TIỆN MỚI</span>}
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                }}
                footer={null}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddVehicle}
                    style={{ marginTop: '16px' }}
                >
                    <Form.Item
                        label="HÃNG XE"
                        name="brand"
                        rules={[{ required: true, message: 'Vui lòng nhập hãng xe (ví dụ: Toyota, Honda)!' }]}
                    >
                        <Input placeholder="Toyota, Honda, Mazda..." />
                    </Form.Item>

                    <Form.Item
                        label="DÒNG XE (MODEL)"
                        name="model"
                        rules={[{ required: true, message: 'Vui lòng nhập dòng xe (ví dụ: Camry, Civic)!' }]}
                    >
                        <Input placeholder="Camry, Civic, CX-5..." />
                    </Form.Item>

                    <Form.Item
                        label="BIỂN SỐ XE"
                        name="licensePlate"
                        rules={[
                            { required: true, message: 'Vui lòng nhập biển số xe!' },
                            { pattern: /^[0-9]{2}[A-Z]-[0-9]{3,5}(\.[0-9]{2})?$/, message: 'Định dạng biển số không hợp lệ! (Ví dụ đúng: 30A-123.45 hoặc 51F-6789)' }
                        ]}
                    >
                        <Input placeholder="Ví dụ: 30A-123.45" />
                    </Form.Item>

                    <Form.Item
                        label="MÀU SẮC"
                        name="color"
                    >
                        <Input placeholder="Đen, Trắng, Đỏ..." />
                    </Form.Item>

                    <Form.Item
                        label="PHÂN KHÚC XE"
                        name="vehicleTypeId"
                        rules={[{ required: true, message: 'Vui lòng chọn phân khúc xe!' }]}
                    >
                        <Select placeholder="Chọn phân khúc xe phù hợp">
                            {vehicleTypes.map((type) => (
                                <Select.Option key={type.id} value={type.id}>
                                    {type.typeName === 'SEDAN' ? 'SEDAN (Xe 4 - 5 chỗ)' : 'SUV (Xe 5 - 7 chỗ / Bán tải)'}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Button 
                            onClick={() => {
                                setIsModalOpen(false);
                                form.resetFields();
                            }} 
                            style={{ marginRight: '8px' }}
                        >
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" loading={submitting} className="mycars-add-btn">
                            ĐĂNG KÝ XE
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
