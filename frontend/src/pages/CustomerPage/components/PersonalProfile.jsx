import { useEffect } from 'react';
import { Form, Input, Button, Tabs, message } from 'antd';
import { useAuth } from '../../../context/AuthContext';
import './Profile.css';

export default function PersonalProfile() {
    const { user } = useAuth();
    const [form] = Form.useForm();

    // Update form when user data is available
    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                fullname: user.fullname || '',
                phone: user.phone || user.phoneNumber || '',
                email: user.email || '',
                address: user.address || ''
            });
        }
    }, [user, form]);

    const onFinish = (values) => {
        console.log('Update profile values:', values);
        message.success('Cập nhật thông tin thành công! (Tính năng mockup)');
    };

    const personalInfoTab = (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="profile-form"
            requiredMark={false}
        >
            <div className="profile-form__row">
                <Form.Item
                    label="HỌ VÀ TÊN"
                    name="fullname"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                    className="profile-form__item"
                >
                    <Input size="large" placeholder="Nguyễn Văn A" />
                </Form.Item>

                <Form.Item
                    label="SỐ ĐIỆN THOẠI"
                    name="phone"
                    className="profile-form__item"
                >
                    <Input size="large" placeholder="0901234567" />
                </Form.Item>
            </div>

            <Form.Item
                label="ĐỊA CHỈ EMAIL"
                name="email"
                rules={[
                    { type: 'email', message: 'Email không hợp lệ!' },
                    { required: true, message: 'Vui lòng nhập email!' }
                ]}
            >
                <Input size="large" placeholder="nguyen.vana@example.com" disabled />
            </Form.Item>

            <Form.Item
                label="ĐỊA CHỈ MẶC ĐỊNH"
                name="address"
            >
                <Input.TextArea size="large" rows={4} placeholder="123 Đường Detailing, Quận 1, TP. Hồ Chí Minh" />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" size="large" className="profile-form__btn-submit">
                    LƯU THAY ĐỔI
                </Button>
            </Form.Item>
        </Form>
    );

    const changePasswordTab = (
        <Form layout="vertical" className="profile-form" requiredMark={false}>
            <Form.Item
                label="MẬT KHẨU HIỆN TẠI"
                name="currentPassword"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
            >
                <Input.Password size="large" placeholder="Nhập mật khẩu hiện tại" />
            </Form.Item>
            <Form.Item
                label="MẬT KHẨU MỚI"
                name="newPassword"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
            >
                <Input.Password size="large" placeholder="Nhập mật khẩu mới" />
            </Form.Item>
            <Form.Item
                label="XÁC NHẬN MẬT KHẨU MỚI"
                name="confirmPassword"
                rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới!' }]}
            >
                <Input.Password size="large" placeholder="Xác nhận mật khẩu mới" />
            </Form.Item>
            <Form.Item>
                <Button type="primary" size="large" className="profile-form__btn-submit">
                    ĐỔI MẬT KHẨU
                </Button>
            </Form.Item>
        </Form>
    );

    const notificationsTab = (
        <div className="profile-notifications">
            <p style={{ color: '#666' }}>Không có thông báo mới nào.</p>
        </div>
    );

    const tabItems = [
        {
            key: '1',
            label: 'Thông tin cá nhân',
            children: personalInfoTab,
        },
        {
            key: '2',
            label: 'Đổi mật khẩu',
            children: changePasswordTab,
        },
        {
            key: '3',
            label: 'Thông báo',
            children: notificationsTab,
        },
    ];

    return (
        <div className="profile-container">
            <h1 className="profile-title">QUẢN LÝ HỒ SƠ</h1>
            <p className="profile-subtitle">Quản lý thông tin tài khoản và cấu hình hệ thống của bạn.</p>
            <Tabs defaultActiveKey="1" items={tabItems} className="profile-tabs" />
        </div>
    );
}
