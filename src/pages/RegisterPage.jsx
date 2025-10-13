import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Typography,
  message,
  Card,
  Space,
  Progress,
  Alert,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  GoogleOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../src/api/services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Capture referral code from URL (e.g. ?ref=ABCD123)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('ref');
    if (code) setReferralCode(code);
  }, [location.search]);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    let strength = 0;
    let feedback = [];

    if (password.length >= 8) strength += 25;
    else feedback.push('At least 8 characters');

    if (/[A-Z]/.test(password)) strength += 25;
    else feedback.push('One uppercase letter');

    if (/[a-z]/.test(password)) strength += 25;
    else feedback.push('One lowercase letter');

    if (/[0-9]/.test(password)) strength += 12.5;
    else feedback.push('One number');

    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5;
    else feedback.push('One special character');

    setPasswordStrength(strength);
    setPasswordFeedback(feedback.length > 0 ? `Missing: ${feedback.join(', ')}` : 'Strong password!');
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return '#ff4d4f';
    if (passwordStrength < 50) return '#faad14';
    if (passwordStrength < 75) return '#1890ff';
    return '#52c41a';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  // ✅ Handle form submission
  const onFinish = async (values) => {
    try {
      setLoading(true);

      // remove confirmPassword before sending to backend
      const { confirmPassword, ...cleanedValues } = values;

      const payload = {
        ...cleanedValues,
        ...(values.role === 'customer' && values.customerCode
          ? { customerCode: values.customerCode }
          : {}),
        ...(referralCode ? { referralCode } : {})
      };

      console.log("Payload sent to backend:", payload); // optional sanity check

      const res = await authAPI.register(payload);

      // Show success state
      setRegistrationSuccess(true);
      message.success({
        content: 'Registration successful! Redirecting to login...',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        duration: 3,
      });

      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }

      // Redirect after showing success message
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      console.error('Registration error:', err.response?.data || err);

      // Enhanced error messages
      let errorMessage = 'Registration failed. Try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errorType === 'ValidationError') {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0];
        errorMessage = firstError?.message || 'Validation failed';
      } else if (err.response?.data?.errorType === 'DuplicateKeyError') {
        errorMessage = err.response.data.message;
      }

      message.error({
        content: errorMessage,
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 grid place-items-center p-3 sm:p-4 md:p-6 overflow-hidden transition-all duration-300 ${registrationSuccess ? 'bg-green-50' : ''}`}>
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl px-2 sm:px-0">
        <Card
          className={`shadow-sm sm:shadow-md md:shadow-lg border-0 rounded-lg sm:rounded-xl overflow-y-auto max-h-[90vh] sm:max-h-[85vh] px-3 sm:px-4 md:px-6 transition-all duration-300 ${registrationSuccess ? 'shadow-green-200 border-green-200' : ''}`}
          bodyStyle={{
            padding: '1rem'
          }}
        >
          <Space direction="vertical" size="small" className="w-full">
            {/* Success Alert */}
            {registrationSuccess && (
              <Alert
                message={
                  <div className="flex items-center gap-2">
                    <CheckCircleOutlined className="text-green-600" />
                    <span className="font-medium">Registration Successful!</span>
                  </div>
                }
                description="Your account has been created successfully. You will be redirected to the login page shortly."
                type="success"
                showIcon={false}
                className="mb-4 animate-pulse"
              />
            )}

            {/* Logo */}
            <div className="text-center">
              <Title
                level={2}
                className={`text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl m-0 transition-colors duration-300 ${registrationSuccess ? 'text-green-600' : ''}`}
                style={{ color: registrationSuccess ? '#16a34a' : '#4f46e5' }}
              >
                {registrationSuccess ? (
                  <>
                    <CheckCircleOutlined className="mr-2" />
                    Welcome Aboard!
                  </>
                ) : (
                  'Sales Tracker'
                )}
              </Title>
            </div>

            {/* Welcome Text */}
            <div className="text-center">
              <Title
                level={3}
                className="text-base sm:text-lg md:text-xl lg:text-2xl m-0 mb-1 sm:mb-2"
              >
                {registrationSuccess ? 'Account Created' : 'Create Account'}
              </Title>
              <Text type="secondary" className="text-xs sm:text-sm md:text-base">
                {registrationSuccess
                  ? 'Your journey to better sales tracking begins now'
                  : 'Join us and start tracking your sales'
                }
              </Text>
            </div>

            {/* Registration Form */}
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              size="large"
              className={`w-full transition-opacity duration-300 ${registrationSuccess ? 'opacity-50 pointer-events-none' : ''}`}
              disabled={registrationSuccess}
            >
              <Space direction="vertical" size="small" className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter your first name',
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: '#6b7280' }} />}
                      placeholder="John"
                      className="rounded-md sm:rounded-lg text-sm sm:text-base"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[
                      {
                        required: true,
                        message: 'Please enter your last name',
                      },
                    ]}
                  >
                    <Input
                      placeholder="Doe"
                      className="rounded-md sm:rounded-lg text-sm sm:text-base"
                      size="large"
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Enter a valid email address' },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: '#6b7280' }} />}
                    placeholder="example@email.com"
                    className="rounded-md sm:rounded-lg text-sm sm:text-base"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <div className="flex items-center gap-2">
                      <span>Password</span>
                      <Tooltip title="Password must contain: 8+ characters, uppercase & lowercase letters, numbers, and special characters">
                        <span className="text-gray-400 cursor-help">ℹ️</span>
                      </Tooltip>
                    </div>
                  }
                  name="password"
                  rules={[
                    { required: true, message: 'Please enter a password' },
                    {
                      min: 8,
                      message: 'Password must be at least 8 characters',
                    },
                    {
                      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                      message: 'Password must contain uppercase, lowercase, number, and special character',
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#6b7280' }} />}
                    placeholder="Create password"
                    className="rounded-md sm:rounded-lg text-sm sm:text-base"
                    size="large"
                    onChange={(e) => checkPasswordStrength(e.target.value)}
                    iconRender={(visible) =>
                      visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>

                {/* Password Strength Indicator */}
                {passwordStrength > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <Text type="secondary" className="text-xs">
                        Password Strength
                      </Text>
                      <Text
                        style={{ color: getPasswordStrengthColor() }}
                        className="text-xs font-medium"
                      >
                        {getPasswordStrengthText()}
                      </Text>
                    </div>
                    <Progress
                      percent={passwordStrength}
                      showInfo={false}
                      strokeColor={getPasswordStrengthColor()}
                      size="small"
                      className="mb-1"
                    />
                    <Text
                      type={passwordStrength >= 75 ? 'success' : 'secondary'}
                      className="text-xs"
                    >
                      {passwordFeedback}
                    </Text>
                  </div>
                )}

                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Please confirm your password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error('Passwords do not match')
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#6b7280' }} />}
                    placeholder="Confirm password"
                    className="rounded-md sm:rounded-lg text-sm sm:text-base"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Role"
                  name="role"
                  rules={[{ required: true, message: 'Please select a role' }]}
                >
                  <Select
                    placeholder="Select your role"
                    className="rounded-md sm:rounded-lg text-sm sm:text-base"
                    size="large"
                    onChange={(value) => {
                      // Clear customer code when role changes
                      if (value !== 'customer') {
                        form.setFieldsValue({ customerCode: undefined });
                      }
                    }}
                  >
                    <Option value="salesperson">Salesperson</Option>
                    <Option value="customer">Customer</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}
                >
                  {({ getFieldValue }) =>
                    getFieldValue('role') === 'customer' && (
                      <Form.Item
                        label="Customer Code"
                        name="customerCode"
                        rules={[
                          { required: true, message: 'Customer code is required for registration' }
                        ]}
                      >
                        <Input
                          placeholder="Enter customer code"
                          className="rounded-md sm:rounded-lg text-sm sm:text-base"
                          size="large"
                        />
                      </Form.Item>
                    )
                  }
                </Form.Item>

                <Form.Item label="Referral Code (Optional)">
                  <Input
                    placeholder="Enter referral code"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
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
                    className={`rounded-md sm:rounded-lg font-semibold h-10 sm:h-11 md:h-12 text-sm sm:text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${registrationSuccess ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    style={{
                      background: registrationSuccess
                        ? '#16a34a'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                    }}
                  >
                    {registrationSuccess ? (
                      <>
                        <CheckCircleOutlined className="mr-2" />
                        Account Created!
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </Form.Item>
              </Space>
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

            {/* Google Sign Up */}
            <Button
              block
              size="large"
              icon={<GoogleOutlined />}
              className="rounded-md sm:rounded-lg border-gray-300 hover:border-gray-400 h-10 sm:h-11 md:h-12 text-sm sm:text-base"
            >
              Sign up with Google
            </Button>

            {/* Links */}
            <div className="text-center">
              <Text type="secondary" className="text-xs sm:text-sm md:text-base">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Sign in
                </Link>
              </Text>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;



