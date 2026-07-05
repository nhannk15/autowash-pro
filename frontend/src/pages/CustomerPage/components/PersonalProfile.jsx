import React, { useState } from 'react';
import { Button, Typography, Modal, Form, Input, message } from 'antd';
import { useAuth } from '../../../context/AuthContext';
import { checkPasswordApi, changePasswordApi, forgotPasswordApi, verifyOtpApi, resetPasswordApi } from '../../../service/authService';
import './Profile.css';

const { Text } = Typography;

export default function PersonalProfile() {
    const { user } = useAuth();
    console.log("Current user info:", user);
    
    // Modals state
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    
    // Password Change State
    const [passwordForm] = Form.useForm();
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Forgot Password Flow State
    const [isForgotFlow, setIsForgotFlow] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: Reset
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotOtp, setForgotOtp] = useState('');
    const [isForgotLoading, setIsForgotLoading] = useState(false);

    const [forgotEmailForm] = Form.useForm();
    const [forgotOtpForm] = Form.useForm();
    const [forgotResetForm] = Form.useForm();

    // Reset modals on close
    const handleCloseModal = () => {
        setIsPasswordModalVisible(false);
        setIsForgotFlow(false);
        setForgotStep(1);
        passwordForm.resetFields();
        forgotEmailForm.resetFields();
        forgotOtpForm.resetFields();
        forgotResetForm.resetFields();
    };

    const handleChangePassword = async (values) => {
        setIsChangingPassword(true);
        try {
            // Step 1: Check if current password is correct
            const checkRes = await checkPasswordApi(values.currentPassword);
            if (checkRes && checkRes.valid) {
                // Step 2: Change password
                await changePasswordApi(values.newPassword);
                message.success('Đổi mật khẩu thành công!');
                handleCloseModal();
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Đổi mật khẩu thất bại!';
            message.error(errorMsg);
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Forgot Password Handlers
    const handleSendOtp = async (values) => {
        setIsForgotLoading(true);
        try {
            await forgotPasswordApi(values.email);
            setForgotEmail(values.email);
            message.success("Mã OTP đã được gửi đến email của bạn!");
            setForgotStep(2);
        } catch (e) {
            const errorMsg = e.response?.data?.message || e.message || "Gửi OTP thất bại!";
            message.error(errorMsg);
        } finally {
            setIsForgotLoading(false);
        }
    };

    const handleVerifyOtp = async (values) => {
        setIsForgotLoading(true);
        try {
            await verifyOtpApi(forgotEmail, values.otp);
            setForgotOtp(values.otp);
            message.success("Xác minh OTP thành công!");
            setForgotStep(3);
        } catch (e) {
            const errorMsg = e.response?.data?.message || e.message || "Mã OTP không hợp lệ!";
            message.error(errorMsg);
        } finally {
            setIsForgotLoading(false);
        }
    };

    const handleResetPassword = async (values) => {
        setIsForgotLoading(true);
        try {
            await resetPasswordApi(forgotEmail, forgotOtp, values.newPassword, values.confirmPassword);
            message.success("Thiết lập mật khẩu mới thành công!");
            handleCloseModal();
        } catch (e) {
            const errorMsg = e.response?.data?.message || e.message || "Thiết lập mật khẩu mới thất bại!";
            message.error(errorMsg);
        } finally {
            setIsForgotLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <h1 className="profile-title">QUẢN LÝ HỒ SƠ</h1>
            <p className="profile-subtitle">Thông tin tài khoản của bạn</p>
            
            <div className="profile-info-card">
                <div className="profile-info-row">
                    <Text className="profile-info-label">HỌ VÀ TÊN</Text>
                    <Text className="profile-info-value">{user?.fullname || 'Chưa cập nhật'}</Text>
                </div>
                
                <div className="profile-info-row">
                    <Text className="profile-info-label">SỐ ĐIỆN THOẠI</Text>
                    <Text className="profile-info-value">{user?.phone || user?.phoneNumber || 'Chưa cập nhật'}</Text>
                </div>
                
                <div className="profile-info-row">
                    <Text className="profile-info-label">ĐỊA CHỈ EMAIL</Text>
                    <Text className="profile-info-value">{user?.email || 'Chưa cập nhật'}</Text>
                </div>

                <div style={{ marginTop: '32px' }}>
                    <Button 
                        type="primary" 
                        size="large" 
                        className="profile-btn-change-password"
                        onClick={() => setIsPasswordModalVisible(true)}
                    >
                        ĐỔI MẬT KHẨU
                    </Button>
                </div>
            </div>

            <Modal
                title={isForgotFlow ? "Quên mật khẩu" : "Đổi mật khẩu"}
                open={isPasswordModalVisible}
                onCancel={handleCloseModal}
                footer={null}
                destroyOnClose
            >
                {!isForgotFlow ? (
                    // CHANGE PASSWORD FORM
                    <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handleChangePassword}
                        requiredMark={false}
                        style={{ marginTop: '16px' }}
                    >
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
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password size="large" placeholder="Xác nhận mật khẩu mới" />
                        </Form.Item>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                            <Button type="link" onClick={() => {
                                setIsForgotFlow(true);
                                forgotEmailForm.setFieldsValue({ email: user?.email || '' });
                            }} style={{ padding: 0 }}>
                                Quên mật khẩu?
                            </Button>
                            
                            <Button type="primary" htmlType="submit" loading={isChangingPassword} size="large">
                                Đổi mật khẩu
                            </Button>
                        </div>
                    </Form>
                ) : (
                    // FORGOT PASSWORD FLOW
                    <div className="forgot-flow-container" style={{ marginTop: '16px' }}>
                        {forgotStep === 1 && (
                            <Form form={forgotEmailForm} layout="vertical" onFinish={handleSendOtp}>
                                <p style={{ marginBottom: 16 }}>Nhập email của bạn để nhận mã OTP khôi phục mật khẩu.</p>
                                <Form.Item
                                    label="Email"
                                    name="email"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập email!' },
                                        { type: 'email', message: 'Email không hợp lệ!' }
                                    ]}
                                >
                                    <Input size="large" placeholder="Email của bạn" disabled={!!user?.email} />
                                </Form.Item>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                                    <Button onClick={() => setIsForgotFlow(false)} size="large">Hủy</Button>
                                    <Button type="primary" htmlType="submit" loading={isForgotLoading} size="large">
                                        Gửi OTP
                                    </Button>
                                </div>
                            </Form>
                        )}

                        {forgotStep === 2 && (
                            <Form form={forgotOtpForm} layout="vertical" onFinish={handleVerifyOtp}>
                                <p style={{ marginBottom: 16 }}>Mã OTP đã được gửi đến <b>{forgotEmail}</b>. Vui lòng kiểm tra hộp thư.</p>
                                <Form.Item
                                    label="Mã OTP"
                                    name="otp"
                                    rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }]}
                                >
                                    <Input.OTP size="large" />
                                </Form.Item>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                                    <Button onClick={() => setForgotStep(1)} size="large">Quay lại</Button>
                                    <Button type="primary" htmlType="submit" loading={isForgotLoading} size="large">
                                        Xác nhận
                                    </Button>
                                </div>
                            </Form>
                        )}

                        {forgotStep === 3 && (
                            <Form form={forgotResetForm} layout="vertical" onFinish={handleResetPassword}>
                                <p style={{ marginBottom: 16 }}>Thiết lập mật khẩu mới cho tài khoản của bạn.</p>
                                <Form.Item
                                    label="Mật khẩu mới"
                                    name="newPassword"
                                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }]}
                                >
                                    <Input.Password size="large" />
                                </Form.Item>
                                <Form.Item
                                    label="Xác nhận mật khẩu mới"
                                    name="confirmPassword"
                                    dependencies={['newPassword']}
                                    rules={[
                                        { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('newPassword') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password size="large" />
                                </Form.Item>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                                    <Button type="primary" htmlType="submit" loading={isForgotLoading} size="large">
                                        Cập nhật mật khẩu
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
