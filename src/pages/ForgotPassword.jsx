import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Row, Col } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await authAPI.forgotPassword(values.email);
      setEmailSent(true);
      message.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      message.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: '100vh', padding: 24 }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={8}>
          <Card style={{ textAlign: 'center' }}>
            <MailOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 24 }} />
            <Title level={3}>Check Your Email</Title>
            <Text>
              We've sent a password reset link to your email address.
              The link will expire in 15 minutes.
            </Text>
            <br />
            <br />
            <Link to="/login">
              <Button type="primary" icon={<ArrowLeftOutlined />}>
                Back to Login
              </Button>
            </Link>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh', padding: 24 }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={8}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2}>Forgot Password</Title>
            <Text type="secondary">
              Enter your email address and we'll send you a link to reset your password.
            </Text>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter your email"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                Send Reset Link
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/login">
              <Button type="link" icon={<ArrowLeftOutlined />}>
                Back to Login
              </Button>
            </Link>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default ForgotPassword;