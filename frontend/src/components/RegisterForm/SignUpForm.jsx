import { Form, Input, Button, DatePicker, Divider, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./SignUpForm.css";

export default function SignUpForm() {

    const { signup } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            await signup(values.email, values.password, values.confirmPassword, values.fullName, values.dob, values.phone);
            message.success("Đăng kí thành công!");
            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (e) {
            const errorMsg = e.response?.data?.message || e.message || "Đăng ký thất bại. Vui lòng thử lại!";
            message.error(errorMsg);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log("Failed:", errorInfo);
    };

    return (
        <div className="signup-container">
            <h2 className="signup-title">Đăng kí Autowash Pro</h2>
            <Form
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                name="signup"
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

                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{
                        required: true, message: "Vui lòng nhập mật khẩu"
                    }, {
                        min: 8, message: "Mật khẩu ít nhất 8 ký tự"
                    }]}
                >
                    <Input.Password size="large" placeholder="Vui lòng nhập mật khẩu" />
                </Form.Item>

                <Form.Item
                    label="Xác nhận mật khẩu"
                    name="confirmPassword"
                    rules={[
                        { required: true, message: "Vui lòng xác nhận mật khẩu" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("password") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error("Mật khẩu không khớp!"));
                            },
                        }),
                    ]}
                >
                    <Input.Password size="large" placeholder="Vui lòng xác nhận mật khẩu" />
                </Form.Item>

                <Form.Item
                    label="Họ và tên"
                    name="fullName"
                    rules={[{
                        required: true, message: "Vui lòng nhập họ và tên"
                    }, {
                        validator(_, value) {
                            if (!value) return Promise.resolve();
                            if (/^\s|\s$/.test(value)) {
                                return Promise.reject(new Error("Họ tên không được bắt đầu hoặc kết thúc bằng khoảng trắng"));
                            }
                            if (/\s{2,}/.test(value)) {
                                return Promise.reject(new Error("Họ tên không được chứa nhiều khoảng trắng liên tiếp"));
                            }
                            if (!/^[A-Za-zÀ-Ỹà-ỹ\s]+$/.test(value)) {
                                return Promise.reject(new Error("Họ tên không được chứa ký tự đặc biệt hoặc số"));
                            }
                            return Promise.resolve();
                        }
                    }]}
                >
                    <Input size="large" placeholder="Vui lòng nhập họ và tên" />
                </Form.Item>

                <Form.Item
                    label="Ngày sinh"
                    name="dob"
                    rules={[{ required: true, message: "Vui lòng nhập ngày sinh", type: "date" }]}
                >
                    <DatePicker size="large" placeholder="Vui lòng nhập ngày sinh" format="DD/MM/YYYY" />
                </Form.Item>

                <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[{
                        required: true, message: "Vui lòng nhập số điện thoại"
                    }, {
                        pattern: /^(0[35789])+([0-9]{8})$/,
                        message: "Số điện thoại không hợp lệ!"
                    }]}
                >
                    <Input size="large" placeholder="Vui lòng nhập số điện thoại" />
                </Form.Item>

                <Form.Item>
                    <Button block type="primary" htmlType="submit" size="large">
                        Đăng ký
                    </Button>
                </Form.Item>

                <Divider />

                <Form.Item>
                    <p>Đã có tài khoản?</p>
                    <Button className="signup-btn" block type="default" size="large" onClick={() => { navigate("/login") }}>
                        Đăng nhập
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}