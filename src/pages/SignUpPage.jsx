import React, { useState } from "react";
import { Form, Input, Button, Card, Radio, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "axios"; // Import axios
import toast from "react-hot-toast";
import "../styles.css";

const SignupPage = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm(); // Add form instance

    const onFinish = async (values) => {
        setLoading(true);
        try {
        const response = await axios.post("http://localhost:5000/auth/signup", values);

        toast.success("Signup successful!"); // Show success toast
        form.resetFields(); // Clear the form

        } catch (error) {
            if (error.response) {
                if (error.response.status === 409) { // Check for 409 Conflict
                    toast.error("Username is already taken. Please choose another username.");
                } else if(error.response.status === 400){
                    toast.error(error.response.data.error)
                }
                else {
                    toast.error(error.response.data.error || "Signup failed. Please try again.");
                }
            } else if (error.request) {
                    toast.error("Network error. Please try again.");
            } else {
                toast.error("An unexpected error occurred. Please try again.");
            }
            console.error("Signup error:", error);
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="dark-app-container">
      <Card className="dark-form-card">
        <h2 className="dark-form-title">Sign Up</h2>
        <Form name="signup-form" onFinish={onFinish} form={form} className="dark-form-content">
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
            name="fullname"
            rules={[{ required: true, message: "Please enter your full name!" }]}
          >
            <div className="dark-input-group">
              <label className="dark-input-label">Full Name</label>
              <Input prefix={<UserOutlined />} placeholder="Enter full name" className="placeholder-white" />
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

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <div className="dark-input-group">
              <label className="dark-input-label">Confirm Password</label>
              <Input.Password prefix={<LockOutlined />} placeholder="Confirm password" className="placeholder-white" />
            </div>
          </Form.Item>

          <Form.Item name="admin" className="dark-input-group">
            <Radio.Group>
              <Radio value={true} style={{ color: "white" }}>
                Admin
              </Radio>
              <Radio value={false} style={{ color: "white" }}>
                User
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="dark-submit-btn"
              loading={loading}
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SignupPage;