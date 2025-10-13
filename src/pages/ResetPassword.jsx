import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Row, Col } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../../src/api/services/api';

const { Title, Text } = Typography;

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [form] = Form.useForm();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      message.error('Invalid reset link');
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (values) => {
    if (!token) return;

    setLoading(true);
    try {
      await authAPI.resetPassword(token, values.newPassword);
      setResetSuccess(true);
      message.success('Password reset successfully!');
    } catch (error) {
      message.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <Row
        justify="center"
        align="middle"
        style={{ minHeight: '100vh', padding: 24 }}
      >
        <Col xs={24} sm={20} md={16} lg={12} xl={8}>
          <Card style={{ textAlign: 'center' }}>
            <CheckCircleOutlined
              style={{ fontSize: 48, color: '#52c41a', marginBottom: 24 }}
            />
            <Title level={3}>Password Reset Successful</Title>
            <Text>
              Your password has been reset successfully. You can now log in with
              your new password.
            </Text>
            <br />
            <br />
            <Link to="/login">
              <Button type="primary">Go to Login</Button>
            </Link>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Row
      justify="center"
      align="middle"
      style={{ minHeight: '100vh', padding: 24 }}
    >
      <Col xs={24} sm={20} md={16} lg={12} xl={8}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2}>Reset Password</Title>
            <Text type="secondary">Enter your new password below.</Text>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                { required: true, message: 'Please enter your new password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter new password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Confirm New Password"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm new password"
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
                Reset Password
              </Button>
            </Form.Item>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Link to="/login">
              <Button type="link">Back to Login</Button>
            </Link>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default ResetPassword;



