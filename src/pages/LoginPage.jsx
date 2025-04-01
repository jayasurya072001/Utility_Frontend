import React from "react";
import { Form, Input, Button, Card } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import "../styles.css"

const LoginPage = () => {
  const onFinish = (values) => {
    console.log("Received values:", values);
  };

  return (
    <div className="dark-app-container">
      <Card className="dark-form-card">
        <h2 className="dark-form-title">Login</h2>
        <Form name="login-form" onFinish={onFinish} className="dark-form-content">
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please enter your username!" }]}
          >
            <div className="dark-input-group">
              <label className="dark-input-label">Username</label>
              <Input prefix={<UserOutlined />} placeholder="Enter username" className="placeholder-white" />
            </div>
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <div className="dark-input-group">
              <label className="dark-input-label">Password</label>
              <Input.Password prefix={<LockOutlined />} placeholder="Enter password" className="placeholder-white" />
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="dark-submit-btn">
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
