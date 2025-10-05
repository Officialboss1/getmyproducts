import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

const { Title } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      
      const response = await api.post("/auth/login", {
        email: values.email,
        password: values.password,
      });

      console.log("Response ", response.data);

      let user, token;
      
      // Handle NESTED structure (correct backend response)
      if (response.data.user && response.data.token) {
        user = response.data.user;
        token = response.data.token;
      } 
      // Handle FLAT structure (incorrect backend response)
      else if (response.data._id && response.data.role && response.data.token) {
        const { _id, firstName, lastName, email, role, token: flatToken } = response.data;
        user = { _id, firstName, lastName, email, role };
        token = flatToken;
      } 
      // Invalid response
      else {
        throw new Error("Invalid server response structure");
      }

      // Validate user and token
      if (!user || !user.role || !token) {
        throw new Error("Missing required user data or token");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      message.success("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      
      if (err.response?.status === 401) {
        message.error("Invalid email or password");
      } else {
        message.error(err.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card className="w-96 shadow-lg">
        <Title level={3} style={{ textAlign: "center", marginBottom: "1rem" }}>
          Sales Tracker Login
        </Title>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please enter your email!" },
              { type: "email", message: "Enter a valid email!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;