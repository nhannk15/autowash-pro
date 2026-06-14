import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Spin, Alert, Empty, Card, Button, Modal, Form, Input, Select, message, Popconfirm, Upload } from 'antd';
import { PlusOutlined, CarOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import './MyCars.css';
import axios from 'axios';

function VehicleImage({ src, alt, fallbackIcon }) {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return fallbackIcon;
    }

    return (
        <img
            src={src}
            alt={alt}
            className="mycar-card__image"
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
        />
    );
}

export default function MyCars() {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [typesLoading, setTypesLoading] = useState(false)
    const [error, setError] = useState(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([])
    // Tải danh sách xe của khách hàng
    const fetchVehicles = async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/api/vehicles/user`);
            // nếu không có await nó sẽ chạy tiếp code bên dưới và biến respone không chứa dữ liệu thực mà chỉ chứa đối tượng Promise. khi đó các dòng code đọc dữ liệu phía sau sẽ báo lỗi vì dữ liệu chưa kịp tải về
            // Khi bạn gọi await axios.get(...), Axios trả về một đối tượng chứa toàn bộ thông tin của phản hồi HTTP (gọi là Axios Response). Đối tượng response này có các thuộc tính cố định do Axios quy định:

            // response = {
            //   data: {...},        // Phần thân (Body) của phản hồi chứa JSON từ server
            //   status: 200,        // Mã trạng thái HTTP (200, 404, 500...)
            //   statusText: "OK",   // Trạng thái HTTP dạng chữ
            //   headers: {...},     // HTTP Headers nhận về từ server
            //   config: {...}       // Cấu hình request gửi đi
            // }

            // Sau khi dòng này chạy xong, toàn bộ dữ liệu phản hồi (bao gồm trạng thái, header, và phần thân JSON) đã được tải về máy của bạn thành công và lưu vào biến response dưới dạng một đối tượng JavaScript thông thường.
            // const result = response.data
            //             cấu trúc của response.data được định nghĩa bởi lớp
            //             ApiResponse.java
            //  ở Backend, bao gồm 3 thuộc tính chính:
            //             json
            //             {
            //                 "statusCode": 200,       Mã trạng thái HTTP (ở đây là 200 - Thành công)
            //                     "message": "Success", Thông báo đi kèm từ Backend (thường là "Success")
            //                         "data": [...]      Dữ liệu thực tế (chứa mảng danh sách xe)
            //             }
            const result = response.data
            const vehicleList = result?.data || [];
            // Nếu result có dữ liệu thì lấy result.data, nếu không có thì trả về undefined (không bị crash app). || []: Nếu vế trước là undefined hoặc null thì lập tức lấy mảng rỗng[].
            setVehicles(vehicleList);

        }
        catch (err) {
            setError(err.response?.data.message || err.message || 'không thể tải danh sách xe của bạn')
            // axios bắt lỗi và tạo đối tượng err có dạng: err = {
            //   message: "Request failed with status code 400", // Lỗi chung của Axios
            //   response: {
            //     status: 400,
            //     data: {
            //       statusCode: 400,
            //       message: "Bạn không thể xóa xe của người khác", // Tin nhắn cụ thể từ Backend
            //       data: null
            //     }
            //   }
            // }
            // err.response là đối tượng phản hồi lỗi từ server (400, 404,..) được axios tự động đính kèm
            // err.respose.data: backend trả về phản hồi lỗi dưới dạng json gồm statusCode, message, và data. err.response.data.message: Chính là thông báo lỗi cụ thể do Backend gửi về (ví dụ: "Người dùng không tồn tại.", "Biển số xe đã tồn tại!").
            // err.message): Nếu server sập hoặc lỗi mạng (không có ưu tiên 1), hệ thống sẽ lấy lỗi mặc định của Axios/Trình duyệt (ví dụ: "Network Error").
        } finally {
            setLoading(false);
        }
    };

    // Tải danh sách phân khúc xe (Sedan, SUV...) để điền vào Form thêm xe
    const fetchVehicleTypes = async () => {
        setTypesLoading(true)
        try {
            const response = await axios.get('/api/vehicle-types');

            const result = response.data
            setVehicleTypes(result || []);
        } catch (err) {
            setError(err.response?.data.message || err.message || 'không thể tải danh sách các loại xe')
        } finally {
            setTypesLoading(false)
        }
    };

    useEffect(() => {
        fetchVehicles();
        fetchVehicleTypes();
    }, [user]);

    // Xử lý Thêm xe mới
    const handleAddVehicle = async (values) => {
        if (!user) return;
        setSubmitting(true);
        try {
            let uploadedImageUrl = null;

            // 1. kiểm tra nếu người dùng có chọn ảnh
            if (fileList.length > 0) {
                const file = fileList[0].originFileObj
                const formData = new FormData()
                formData.append("file", file)
                formData.append("upload_preset", "autowash_vehicle")

                const uploadRes = await axios.post("https://api.cloudinary.com/v1_1/dyws8cvor/image/upload", formData)
                uploadedImageUrl = uploadRes.data.secure_url
            }
            await axios.post('/api/vehicles', {
                brand: values.brand,
                model: values.model,
                licensePlate: values.licensePlate,
                color: values.color,
                vehicleTypeId: values.vehicleTypeId,
                image: uploadedImageUrl
            });
            message.success("Thêm xe mới thành công!");
            setIsModalOpen(false);
            form.resetFields();
            setFileList([]);
            fetchVehicles(); // Tải lại danh sách xe
        } catch (err) {
            message.error(err.response?.data?.message || err.message || "Không thể thêm xe mới");
        } finally {
            setSubmitting(false);
        }
    };

    // Xử lý Xóa xe
    const handleDeleteVehicle = async (vehicleId) => {
        try {
            await axios.delete(`/api/vehicles/${vehicleId}`);
            message.success("Xóa xe thành công!");
            fetchVehicles(); // Tải lại danh sách xe
        } catch (err) {
            message.error(err.response?.data?.message || err.message || "Không thể xóa xe");
        }
    };

    // Hiển thị thông tin liên hệ để khôi phục xe
    const handleShowRestoreInfo = (vehicle) => {
        Modal.info({
            title: 'Khôi phục phương tiện',
            content: (
                <div>
                    <p>Để khôi phục xe <strong>{vehicle.brand} {vehicle.model}</strong> (Biển số: <strong>{vehicle.licensePlate}</strong>), vui lòng liên hệ với ban quản trị hệ thống qua:</p>
                    <ul style={{ marginTop: '12px', paddingLeft: '20px', listStyleType: 'disc' }}>
                        <li style={{ marginBottom: '6px' }}><strong>Hotline:</strong> 1900 XXXX</li>
                        <li><strong>Email:</strong> support@autowashpro.com</li>
                    </ul>
                </div>
            ),
            okText: 'Đóng',
            maskClosable: true,
        });
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
            ) : typesLoading ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <Spin size="large" tip="Đang tải danh sách loại xe" />
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
                        const isCarActive = vehicle.active !== false && vehicle.isActive !== false;
                        return (
                            <Card
                                key={vehicle.vehicleId}
                                className={`mycar-card ${!isCarActive ? 'mycar-card--inactive' : ''}`}
                                bordered={false}
                            >
                                <div className="mycar-card__content">
                                    {/* Nút xóa xe - Chỉ hiện cho xe đang hoạt động */}
                                    {isCarActive && (
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
                                    )}

                                    {/* Hình ảnh xe hoặc Icon phân khúc xe */}
                                    <div className="mycar-card__image-wrapper">
                                        <VehicleImage
                                            src={vehicle.image}
                                            alt={`${vehicle.brand} ${vehicle.model}`}
                                            fallbackIcon={
                                                <div className="mycar-card__icon-wrapper">
                                                    {isSedan ? <CarOutlined /> : <span style={{ fontSize: '24px' }}>🚙</span>}
                                                </div>
                                            }
                                        />
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

                                    {/* Nút Liên hệ khôi phục - Chỉ hiện cho xe đã ẩn */}
                                    {!isCarActive && (
                                        <Button
                                            type="primary"
                                            ghost
                                            size="middle"
                                            style={{ marginTop: '16px', width: '100%', borderRadius: '8px', fontWeight: '600' }}
                                            onClick={() => handleShowRestoreInfo(vehicle)}
                                        >
                                            Liên hệ khôi phục
                                        </Button>
                                    )}
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
                    setFileList([]);
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
                        label="HÌNH ẢNH XE"
                    >
                        <Upload
                            beforeUpload={() => false} // Không tự động upload ngay khi chọn file
                            fileList={fileList}
                            onChange={({ fileList: newFileList }) => setFileList(newFileList.slice(-1))} // Chỉ cho phép chọn tối đa 1 ảnh
                            accept="image/*" // Chỉ chấp nhận file ảnh
                            listType="picture"
                        >
                            {fileList.length < 1 && (
                                <Button icon={<UploadOutlined />}>Chọn ảnh từ thiết bị</Button>
                            )}
                        </Upload>
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
                                setFileList([]);
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
