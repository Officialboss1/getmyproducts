import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Avatar,
  Typography,
  Row,
  Col,
  Divider,
  Space,
  message,
  Switch,
  List,
  Tag,
  Statistic,
  Progress,
  Alert,
  Descriptions,
  Select,
} from 'antd';
import {
  UserOutlined,
  CameraOutlined,
  SaveOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined,
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  LockOutlined,
  BellOutlined,
  SecurityScanOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ProfilePage = ({ user }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    salesAlerts: true,
    competitionUpdates: true,
    weeklyReports: true,
    pushNotifications: false,
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      // TODO: Replace with actual profile API endpoint
      // const response = await api.users.getUserById(user._id);
      
      // Mock profile data
      const mockProfileData = {
        ...user,
        phone: '+1 (555) 123-4567',
        address: '123 Sales Street, Business City, BC 12345',
        joinDate: '2024-01-15',
        department: 'Sales',
        position: 'Senior Sales Representative',
        bio: 'Dedicated sales professional with 3+ years of experience in driving revenue growth and building strong client relationships. Passionate about achieving targets and helping customers find the right solutions.',
        skills: ['B2B Sales', 'Client Relations', 'Negotiation', 'CRM Software', 'Product Knowledge'],
        performance: {
          totalSales: 245,
          successRate: 78,
          customerSatisfaction: 92,
          averageDealSize: 2500,
        }
      };

      setProfileData(mockProfileData);
      form.setFieldsValue(mockProfileData);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      message.error('Failed to load profile data');
    }
  };

  const handleSaveProfile = async (values) => {
    setLoading(true);
    try {
      // TODO: Replace with actual update profile API
      // await api.users.updateUser(user._id, values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProfileData(prev => ({ ...prev, ...values }));
      setEditing(false);
      message.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      // Handle avatar upload success
      setAvatarUrl(info.file.response.url);
      message.success('Avatar updated successfully!');
    }
  };

  const handleNotificationChange = (key, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
    message.success('Notification settings updated!');
  };

  const handlePasswordChange = async (values) => {
    try {
      // TODO: Implement password change API
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Password updated successfully!');
      form.setFieldsValue({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      message.error('Failed to update password');
    }
  };

  const beforeAvatarUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const avatarUploadProps = {
    name: 'avatar',
    listType: 'picture',
    showUploadList: false,
    beforeUpload: beforeAvatarUpload,
    onChange: handleAvatarChange,
    customRequest: ({ file, onSuccess }) => {
      // Simulate upload
      setTimeout(() => {
        onSuccess("ok");
      }, 1000);
    },
  };

  if (!profileData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/dashboard')}
            style={{ marginBottom: 16 }}
          >
            Back to Dashboard
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            <UserOutlined /> My Profile
          </Title>
          <Text type="secondary">
            Manage your personal information and account settings
          </Text>
        </Col>
        <Col>
          {!editing ? (
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <Space>
              <Button onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                icon={<SaveOutlined />}
                loading={loading}
                onClick={() => form.submit()}
              >
                Save Changes
              </Button>
            </Space>
          )}
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Left Column - Profile Information */}
        <Col xs={24} lg={16}>
          <Card 
            title="Personal Information" 
            style={{ marginBottom: 24 }}
            loading={!profileData}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveProfile}
              disabled={!editing}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[{ required: true, message: 'Please enter your first name' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="First Name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[{ required: true, message: 'Please enter your last name' }]}
                  >
                    <Input placeholder="Last Name" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="Email" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Phone"
                    name="phone"
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="Phone Number" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Address"
                name="address"
              >
                <Input prefix={<EnvironmentOutlined />} placeholder="Full Address" />
              </Form.Item>

              <Form.Item
                label="Bio"
                name="bio"
              >
                <TextArea
                  rows={4}
                  placeholder="Tell us about yourself, your experience, and your goals..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <Form.Item
                label="Department"
                name="department"
              >
                <Select placeholder="Select Department">
                  <Option value="Sales">Sales</Option>
                  <Option value="Marketing">Marketing</Option>
                  <Option value="Business Development">Business Development</Option>
                  <Option value="Customer Success">Customer Success</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="Position"
                name="position"
              >
                <Input placeholder="Your position or title" />
              </Form.Item>
            </Form>
          </Card>

          {/* Performance Stats */}
          <Card title="Performance Overview" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Total Sales"
                  value={profileData.performance.totalSales}
                  prefix={<ShoppingCartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Success Rate"
                  value={profileData.performance.successRate}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Customer Satisfaction"
                  value={profileData.performance.customerSatisfaction}
                  suffix="%"
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Avg Deal Size"
                  value={profileData.performance.averageDealSize}
                  prefix="$"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>
          </Card>

          {/* Skills */}
          <Card title="Skills & Expertise">
            <Descriptions column={1}>
              <Descriptions.Item label="Skills">
                <Space wrap>
                  {profileData.skills.map((skill, index) => (
                    <Tag key={index} color="blue">{skill}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Member Since">
                <Space>
                  <CalendarOutlined />
                  {dayjs(profileData.joinDate).format('MMMM D, YYYY')}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                <Tag color="green">{profileData.role?.replace('_', ' ').toUpperCase()}</Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Right Column - Avatar & Settings */}
        <Col xs={24} lg={8}>
          {/* Avatar Upload */}
          <Card style={{ marginBottom: 24, textAlign: 'center' }}>
            <Upload {...avatarUploadProps}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  size={100}
                  icon={<UserOutlined />}
                  src={avatarUrl}
                  style={{ marginBottom: 16 }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 10,
                    right: 0,
                    background: '#1890ff',
                    borderRadius: '50%',
                    padding: 4,
                    cursor: 'pointer',
                  }}
                >
                  <CameraOutlined style={{ color: 'white', fontSize: 16 }} />
                </div>
              </div>
            </Upload>
            <Title level={4} style={{ margin: 0 }}>
              {profileData.firstName} {profileData.lastName}
            </Title>
            <Text type="secondary">{profileData.position}</Text>
            <Divider />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Click the camera icon to update your profile picture
            </Text>
          </Card>

          {/* Notification Settings */}
          <Card title="Notification Settings" style={{ marginBottom: 24 }}>
            <List
              size="small"
              dataSource={[
                {
                  key: 'emailNotifications',
                  title: 'Email Notifications',
                  description: 'Receive important updates via email',
                  enabled: notificationSettings.emailNotifications,
                },
                {
                  key: 'salesAlerts',
                  title: 'Sales Alerts',
                  description: 'Get notified about new sales and targets',
                  enabled: notificationSettings.salesAlerts,
                },
                {
                  key: 'competitionUpdates',
                  title: 'Competition Updates',
                  description: 'Stay updated on competition rankings',
                  enabled: notificationSettings.competitionUpdates,
                },
                {
                  key: 'weeklyReports',
                  title: 'Weekly Reports',
                  description: 'Receive weekly performance summaries',
                  enabled: notificationSettings.weeklyReports,
                },
                {
                  key: 'pushNotifications',
                  title: 'Push Notifications',
                  description: 'Get real-time notifications',
                  enabled: notificationSettings.pushNotifications,
                },
              ]}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Switch
                      key={item.key}
                      size="small"
                      checked={item.enabled}
                      onChange={(checked) => handleNotificationChange(item.key, checked)}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={<Text style={{ fontSize: '14px' }}>{item.title}</Text>}
                    description={<Text type="secondary" style={{ fontSize: '12px' }}>{item.description}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>

          {/* Change Password */}
          <Card title="Security">
            <Form
              layout="vertical"
              onFinish={handlePasswordChange}
            >
              <Form.Item
                label="Current Password"
                name="currentPassword"
                rules={[{ required: true, message: 'Please enter current password' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Current password" />
              </Form.Item>
              <Form.Item
                label="New Password"
                name="newPassword"
                rules={[
                  { required: true, message: 'Please enter new password' },
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}
              >
                <Input.Password placeholder="New password" />
              </Form.Item>
              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm password' },
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
                <Input.Password placeholder="Confirm new password" />
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SecurityScanOutlined />}
                  block
                >
                  Change Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;