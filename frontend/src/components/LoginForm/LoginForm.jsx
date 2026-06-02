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
            }, 500);
        } catch (e) {
            message.error("Sai tài khoản hoặc mật khẩu!");
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log("Failed:", errorInfo);
    };

    return (
        <div className="login-container">
            <h2 className="login-title">Login to Autowash Pro</h2>
            <Form
                name="basic"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
            >
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, message: "Please enter your email", type: "email" }]}
                >
                    <Input size="large" placeholder="Enter your email" />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[{ required: true, message: "Please enter your password" }]}
                >
                    <Input.Password size="large" placeholder="Enter your password" />
                </Form.Item>

                <Form.Item name="remember" valuePropName="unchecked">
                    <Checkbox>Remember me</Checkbox>
                </Form.Item>

                <Form.Item>
                    <Button block type="primary" htmlType="submit" size="large">
                        Login
                    </Button>
                </Form.Item>

                <Form.Item>
                    <p>Don't have an account?</p>
                    <Button className="register-btn" block type="default" size="large">
                        Register
                    </Button>
                </Form.Item>

                <Form.Item>
                    <p>Forgot password?</p>
                    <Button className="forgot-password-btn" block type="default" size="large">
                        Forgot password
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
                    Login with Google
                </Button>
            </Form.Item>
        </div>
    );
}