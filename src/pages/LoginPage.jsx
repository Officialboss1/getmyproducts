import React, { useState } from 'react';
import { Form, Input, Button, Typography, App, Card, Space } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axios';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp();

  const onFinish = async (values) => {
    try {
      setLoading(true);

      localStorage.removeItem('user');
      localStorage.removeItem('token');

      const response = await api.post('/auth/login', {
        email: values.email,
        password: values.password,
      });

      console.log('Response ', response.data);

      let user, token;

      // Handle NESTED structure (correct backend response)
      if (response.data.user && response.data.token) {
        user = response.data.user;
        token = response.data.token;
      }
      // Handle FLAT structure (incorrect backend response)
      else if (response.data._id && response.data.role && response.data.token) {
        const {
          _id,
          firstName,
          lastName,
          email,
          role,
          token: flatToken,
        } = response.data;
        user = { _id, firstName, lastName, email, role };
        token = flatToken;
      }
      // Invalid response
      else {
        throw new Error('Invalid server response structure');
      }

      // Validate user and token
      if (!user || !user.role || !token) {
        throw new Error('Missing required user data or token');
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      console.log('LoginPage: Stored user:', user, 'token:', token);

      message.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      if (err.response?.status === 401) {
        message.error('Invalid email or password');
      } else {
        message.error(
          err.response?.data?.message || 'Login failed. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 grid place-items-center p-3 sm:p-4 md:p-6 overflow-hidden">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl px-2 sm:px-0">
        <Card
          className="shadow-sm sm:shadow-md md:shadow-lg border-0 rounded-lg sm:rounded-xl overflow-y-auto max-h-[90vh] sm:max-h-[85vh] px-3 sm:px-4 md:px-6"
          bodyStyle={{
            padding: '1rem'
          }}
        >
          <Space direction="vertical" size="small" className="w-full">
            {/* Logo */}
            <div className="text-center">
              <Title
                level={2}
                className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl m-0"
                style={{ color: '#4f46e5' }}
              >
                Sales Tracker
              </Title>
            </div>

            {/* Welcome Text */}
            <div className="text-center">
              <Title
                level={3}
                className="text-base sm:text-lg md:text-xl lg:text-2xl m-0 mb-1 sm:mb-2"
              >
                Welcome back
              </Title>
              <Text type="secondary" className="text-xs sm:text-sm md:text-base">
                Please sign in to your account
              </Text>
            </div>

            {/* Login Form */}
            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              autoComplete="off"
              size="large"
              className="w-full"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email!' },
                  { type: 'email', message: 'Enter a valid email!' },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#6b7280' }} />}
                  placeholder="Email address"
                  className="rounded-md sm:rounded-lg text-sm sm:text-base"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Please enter your password!' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#6b7280' }} />}
                  placeholder="Password"
                  className="rounded-md sm:rounded-lg text-sm sm:text-base"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  className="rounded-md sm:rounded-lg font-semibold h-10 sm:h-11 md:h-12 text-sm sm:text-base"
                  style={{
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                  }}
                >
                  Sign in
                </Button>
              </Form.Item>
            </Form>

            {/* Divider */}
            <div className="relative my-4 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              block
              size="large"
              icon={<GoogleOutlined />}
              className="rounded-md sm:rounded-lg border-gray-300 hover:border-gray-400 h-10 sm:h-11 md:h-12 text-sm sm:text-base"
            >
              Sign in with Google
            </Button>

            {/* Links */}
            <div className="text-center space-y-1 sm:space-y-2">
              <div>
                <Link
                  to="/forgot-password"
                  className="text-indigo-600 hover:text-indigo-500 font-medium text-xs sm:text-sm md:text-base"
                >
                  Forgot your password?
                </Link>
              </div>
              <div>
                <Text type="secondary" className="text-xs sm:text-sm md:text-base">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-indigo-600 hover:text-indigo-500 font-medium"
                  >
                    Sign up
                  </Link>
                </Text>
              </div>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
