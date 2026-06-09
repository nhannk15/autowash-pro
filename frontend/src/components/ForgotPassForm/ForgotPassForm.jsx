import { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { forgotPasswordApi, verifyOtpApi, resetPasswordApi } from "../../service/authService";
import "./ForgotPassForm.css";

export default function ForgotPassForm() {

    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (values) => {
        setLoading(true);
        try {
            // Tạm thời comment API call để test UI
            // await forgotPasswordApi(values.email);
            setEmail(values.email);
            message.success("Mã OTP đã được gửi đến email của bạn! (OTP Test: 123456)");
            setStep(2);
        } catch (e) {
            const errorMsg = e.response?.data?.message || e.message || "Gửi OTP thất bại. Vui lòng thử lại!";
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (values) => {
        setLoading(true);
        try {
            // Tạm thời comment API call và hardcode check OTP
            // await verifyOtpApi(email, values.otp);
            if (values.otp !== "123456") {
                throw new Error("Mã OTP không hợp lệ! (Sử dụng 123456 để test)");
            }
            setOtp(values.otp);
            message.success("Xác minh OTP thành công!");
            setStep(3);
        } catch (e) {
            const errorMsg = e.response?.data?.message || e.message || "Mã OTP không hợp lệ!";
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        try {
            // Tạm thời comment API call
            // await forgotPasswordApi(email);
            message.success("Mã OTP mới đã được gửi! (OTP Test: 123456)");
        } catch (e) {
            const errorMsg = e.response?.data?.message || e.message || "Gửi lại OTP thất bại!";
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (values) => {
        setLoading(true);
        try {
            // Tạm thời comment API call
            // await resetPasswordApi(email, otp, values.newPassword, values.confirmPassword);
            message.success("Thiết lập mật khẩu mới thành công! (Test mode)");
            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (e) {
            const errorMsg = e.response?.data?.message || e.message || "Thiết lập mật khẩu mới thất bại!";
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgotpass-container">
            {step === 1 && (
                <>
                    <h2 className="forgotpass-title">Tìm tài khoản của bạn</h2>
                    <p className="forgotpass-desc">
                        Hãy nhập email bạn dùng để đăng ký tài khoản
                    </p>
                    <Form
                        onFinish={handleSendOtp}
                        name="forgotpass-email"
                        size="large"
                    >
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[{
                                required: true, message: "Vui lòng nhập email"
                            }, {
                                validator(_, value) {
                                    if (!value) return Promise.resolve();
                                    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|icloud|hotmail)\.com$/;
                                    if (!emailRegex.test(value)) {
                                        return Promise.reject(new Error("Email không đúng định dạng"));
                                    }
                                    return Promise.resolve();
                                }
                            }]}
                        >
                            <Input size="large" placeholder="Vui lòng nhập email" />
                        </Form.Item>

                        <Form.Item>
                            <Button block type="primary" htmlType="submit" size="large" loading={loading}>
                                Tiếp tục
                            </Button>
                        </Form.Item>

                        <Form.Item>
                            <Button className="forgotpass-back-btn" block type="default" size="large" onClick={() => navigate("/login")}>
                                Quay lại đăng nhập
                            </Button>
                        </Form.Item>
                    </Form>
                </>
            )}

            {step === 2 && (
                <>
                    <h2 className="forgotpass-title">Xác minh mã OTP</h2>
                    <p className="forgotpass-desc">
                        Mã OTP đã được gửi đến <strong>{email}</strong>. Mã sẽ có hiệu lực trong 3 phút.
                    </p>
                    <Form
                        onFinish={handleVerifyOtp}
                        name="forgotpass-otp"
                        size="large"
                    >
                        <Form.Item
                            name="otp"
                            rules={[{
                                required: true, message: "Vui lòng nhập mã OTP"
                            }, {
                                pattern: /^\d{6}$/,
                                message: "Mã OTP phải gồm 6 chữ số"
                            }]}
                        >
                            <Input.OTP length={6} size="large" />
                        </Form.Item>

                        <Form.Item>
                            <Button block type="primary" htmlType="submit" size="large" loading={loading}>
                                Xác minh
                            </Button>
                        </Form.Item>

                        <Form.Item>
                            <div className="forgotpass-resend">
                                <span>Không nhận được mã?</span>
                                <Button type="default" onClick={handleResendOtp} loading={loading}>
                                    Gửi lại mã OTP
                                </Button>
                            </div>
                        </Form.Item>

                        <Form.Item>
                            <Button className="forgotpass-back-btn" block type="default" size="large" onClick={() => setStep(1)}>
                                Quay lại
                            </Button>
                        </Form.Item>
                    </Form>
                </>
            )}

            {step === 3 && (
                <>
                    <h2 className="forgotpass-title">Đặt lại mật khẩu</h2>
                    <p className="forgotpass-desc">
                        Nhập mật khẩu mới cho tài khoản <strong>{email}</strong>
                    </p>
                    <Form
                        onFinish={handleResetPassword}
                        name="forgotpass-reset"
                        size="large"
                    >
                        <Form.Item
                            label="Mật khẩu mới"
                            name="newPassword"
                            rules={[{
                                required: true, message: "Vui lòng nhập mật khẩu mới"
                            }, {
                                min: 8, message: "Mật khẩu ít nhất 8 ký tự"
                            }]}
                        >
                            <Input.Password size="large" placeholder="Nhập mật khẩu mới" />
                        </Form.Item>

                        <Form.Item
                            label="Xác nhận mật khẩu"
                            name="confirmPassword"
                            rules={[
                                { required: true, message: "Vui lòng xác nhận mật khẩu" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("newPassword") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error("Mật khẩu không khớp!"));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password size="large" placeholder="Xác nhận mật khẩu mới" />
                        </Form.Item>

                        <Form.Item>
                            <Button block type="primary" htmlType="submit" size="large" loading={loading}>
                                Đặt lại mật khẩu
                            </Button>
                        </Form.Item>
                    </Form>
                </>
            )}
        </div>
    );
}