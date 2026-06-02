import { Form, Input, Button, Divider, message } from "antd";
import { useNavigate } from "react-router-dom";

export default function RegisterForm() {

    const navigate = useNavigate();

    return (
        <div className="register-container">
            <h2 className="register-title">Register to Autowash Pro</h2>
            <Form
                name="register"
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

                <Form.Item
                    label="Confirm Password"
                    name="confirmPassword"
                    rules={[{ required: true, message: "Please confirm your password" }]}
                >
                    <Input.Password size="large" placeholder="Confirm your password" />
                </Form.Item>

                <Form.Item
                    label="Full Name"
                    name="fullName"
                    rules={[{ required: true, message: "Please enter your full name" }]}
                >
                    <Input size="large" placeholder="Enter your full name" />
                </Form.Item>

                <Form.Item
                    label="Date of Birth"
                    name="dob"
                    rules={[{ required: true, message: "Please enter your date of birth", type: "date" }]}
                >
                    <Input size="large" placeholder="Enter your date of birth" />
                </Form.Item>

                <Form.Item
                    label="Phone"
                    name="phone"
                    rules={[{ required: true, message: "Please enter your phone" }]}
                >
                    <Input size="large" placeholder="Enter your phone" />
                </Form.Item>

                <Form.Item>
                    <Button block type="primary" htmlType="submit" size="large">
                        Register
                    </Button>
                </Form.Item>

                <Form.Item>
                    <p>Already have an account?</p>
                    <Button className="register-btn" block type="default" size="large" onClick={() => { navigate("/login") }}>
                        Login
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}