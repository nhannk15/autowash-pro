import { Form, Input, Button, Checkbox, Divider, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginGoogle } from "../../service/authService";
import googleIcon from '../../assets/google.svg';
import "./LoginForm.css";

export function LoginForm() {

    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try {
            await login(values.email, values.password);
            message.success("Đăng nhập thành công!");
            setTimeout(() => {
                navigate("/");
            }, 1000);
        } catch (e) {
            const errorMsg = e.response?.data?.message || e.message || "Đăng nhập thất bại. Vui lòng thử lại!";
            message.error(errorMsg);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log("Failed:", errorInfo);
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Đăng nhập Autowash Pro</h2>
            <Form
                name="basic"
                initialValues={{ remember: false }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
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
                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                >
                    <Input.Password size="large" placeholder="Vui lòng nhập mật khẩu" />
                </Form.Item>

                <Form.Item name="remember" valuePropName="checked">
                    <Checkbox>Ghi nhớ thông tin đăng nhập</Checkbox>
                </Form.Item>

                <Form.Item>
                    <Button block type="primary" htmlType="submit" size="large">
                        Đăng nhập
                    </Button>
                </Form.Item>

                <Form.Item>
                    <p>Chưa có tài khoản?</p>
                    <Button className="register-btn" block type="default" size="large" onClick={() => { navigate("/signup") }}>
                        Đăng ký
                    </Button>
                </Form.Item>

                <Form.Item>
                    <p>Quên mật khẩu?</p>
                    <Button className="forgot-password-btn" block type="default" size="large">
                        Quên mật khẩu
                    </Button>
                </Form.Item>
            </Form>
            <Divider />
            <Form.Item>
                <Button
                    block
                    icon={<img src={googleIcon} />}
                    className="google-btn"
                    onClick={loginGoogle}
                    size="large"
                >
                    Đăng nhập với Google
                </Button>
            </Form.Item>
        </div>
    );
}