import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Card, Typography, message } from "antd";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api"; 


const { Title, Text } = Typography;
const { Option } = Select;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Capture referral code from URL (e.g. ?ref=ABCD123)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("ref");
    if (code) setReferralCode(code);
  }, [location.search]);

  // ✅ Handle form submission
  const onFinish = async (values) => {
    try {
      setLoading(true);
      const payload = { ...values, referralCode: referralCode || null };

      const res = await authAPI.register(payload);
      message.success("Registration successful!");

      // Optional: auto-login or store token if your API returns it
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      message.error(
        err.response?.data?.message || "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f0f2f5",
        padding: "2rem",
      }}
    >
      <Card
        style={{
          width: 420,
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          borderRadius: 10,
        }}
      >
        <Title level={3} style={{ textAlign: "center", marginBottom: 30 }}>
          Create an Account
        </Title>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[{ required: true, message: "Please enter your first name" }]}
          >
            <Input placeholder="John" />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[{ required: true, message: "Please enter your last name" }]}
          >
            <Input placeholder="Doe" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Enter a valid email address" },
            ]}
          >
            <Input placeholder="example@email.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter a password" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select placeholder="Select role">
              <Option value="salesperson">Salesperson</Option>
              <Option value="customer">Customer</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Referral Code">
            <Input
              placeholder="Optional referral code"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ marginTop: 10 }}
            >
              Register
            </Button>
          </Form.Item>
        </Form>

        <Text type="secondary" style={{ display: "block", textAlign: "center" }}>
          Already have an account? <Link to="/login">Login</Link>
        </Text>
      </Card>
    </div>
  );
};

export default Register;
