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
  Alert,
  Descriptions,
  Select,
  Spin,
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
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useUserProfile } from '../../hooks/useUserProfile';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ProfilePage = ({ userId }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    salesAlerts: true,
    competitionUpdates: true,
    weeklyReports: true,
    pushNotifications: false,
  });

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const targetUserId = userId || currentUser._id;

  const { profile, loading, error, canEdit, updateProfile, deleteUserAvatar } =
    useUserProfile(targetUserId);

  useEffect(() => {
    if (profile) {
      form.setFieldsValue(profile);
    }
  }, [profile, form]);

  const handleSaveProfile = async (values) => {
    try {
      const formData = new FormData();

      // Add form values
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      // Add avatar if selected
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await updateProfile(formData);

      // Update localStorage user data if this is the current user's profile
      if (isOwnProfile) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          firstName: values.firstName || currentUser.firstName,
          lastName: values.lastName || currentUser.lastName,
          email: values.email || currentUser.email,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Dispatch custom event to notify other components of user data update
        window.dispatchEvent(
          new CustomEvent('userDataUpdated', { detail: updatedUser })
        );
      }

      setEditing(false);
      setAvatarFile(null);
      message.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile');
    }
  };

  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      message.success('Avatar updated successfully!');
    } else if (info.file.status === 'error') {
      message.error('Avatar upload failed');
    }
  };

  const handleAvatarSelect = ({ file }) => {
    setAvatarFile(file);
  };

  const handleDeleteAvatar = async () => {
    try {
      await deleteUserAvatar();
      message.success('Avatar deleted successfully!');
    } catch (error) {
      message.error('Failed to delete avatar');
    }
  };

  const handleNotificationChange = (key, value) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    message.success('Notification settings updated!');
  };

  const handlePasswordChange = async (values) => {
    try {
      // TODO: Implement password change API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success('Password updated successfully!');
      form.setFieldsValue({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      message.error('Failed to update password');
    }
  };

  const beforeAvatarUpload = (file) => {
    const isJpgOrPng =
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      file.type === 'image/gif' ||
      file.type === 'image/webp';
    if (!isJpgOrPng) {
      message.error('You can only upload image files!');
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
    }
    return isJpgOrPng && isLt5M;
  };

  const avatarUploadProps = {
    name: 'avatar',
    listType: 'picture',
    showUploadList: false,
    beforeUpload: beforeAvatarUpload,
    onChange: handleAvatarChange,
    customRequest: ({ file, onSuccess, onError }) => {
      // Store file for later upload with form
      setAvatarFile(file);
      onSuccess();
    },
  };

  // Role-based field configurations
  const getEditableFields = () => {
    if (!canEdit) return [];

    const currentUserRole = currentUser.role;
    const targetUserRole = profile?.role;

    if (currentUserRole === 'super_admin') {
      return [
        'firstName',
        'lastName',
        'email',
        'phone',
        'address',
        'bio',
        'department',
        'position',
        'company',
        'status',
        'notes',
      ];
    }

    if (currentUserRole === 'admin') {
      const lowerRoles = ['salesperson', 'customer', 'team_head'];
      if (lowerRoles.includes(targetUserRole)) {
        return [
          'firstName',
          'lastName',
          'email',
          'phone',
          'address',
          'bio',
          'department',
          'position',
          'status',
          'notes',
        ];
      }
      return [
        'firstName',
        'lastName',
        'phone',
        'address',
        'bio',
        'department',
        'position',
      ];
    }

    // Own profile
    return [
      'firstName',
      'lastName',
      'phone',
      'address',
      'bio',
      'department',
      'position',
    ];
  };

  const editableFields = getEditableFields();

  if (loading && !profile) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        style={{ margin: '24px' }}
      />
    );
  }

  if (!profile) {
    return (
      <Alert
        message="Profile Not Found"
        description="The requested profile could not be found."
        type="warning"
        showIcon
        style={{ margin: '24px' }}
      />
    );
  }

  const isOwnProfile = currentUser._id === targetUserId;

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
            <UserOutlined />{' '}
            {isOwnProfile
              ? 'My Profile'
              : `${profile.firstName} ${profile.lastName}'s Profile`}
          </Title>
          <Text type="secondary">
            {isOwnProfile
              ? 'Manage your personal information and account settings'
              : 'View and manage user profile'}
          </Text>
        </Col>
        <Col>
          {canEdit && !editing ? (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </Button>
          ) : editing ? (
            <Space>
              <Button
                onClick={() => {
                  setEditing(false);
                  setAvatarFile(null);
                }}
              >
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
          ) : null}
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Left Column - Profile Information */}
        <Col xs={24} lg={16}>
          <Card
            title="Personal Information"
            style={{ marginBottom: 24 }}
            loading={loading}
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
                    rules={[
                      { required: true, message: 'Please enter first name' },
                    ]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="First Name" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[
                      { required: true, message: 'Please enter last name' },
                    ]}
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
                      { required: true, message: 'Please enter email' },
                      { type: 'email', message: 'Please enter a valid email' },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="Email"
                      disabled={!editableFields.includes('email')}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Phone" name="phone">
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="Phone Number"
                      disabled={!editableFields.includes('phone')}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="Address" name="address">
                <Input
                  prefix={<EnvironmentOutlined />}
                  placeholder="Full Address"
                  disabled={!editableFields.includes('address')}
                />
              </Form.Item>

              <Form.Item label="Bio" name="bio">
                <TextArea
                  rows={4}
                  placeholder="Tell us about yourself, your experience, and your goals..."
                  maxLength={500}
                  showCount
                  disabled={!editableFields.includes('bio')}
                />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label="Department" name="department">
                    <Select
                      placeholder="Select Department"
                      disabled={!editableFields.includes('department')}
                    >
                      <Option value="Sales">Sales</Option>
                      <Option value="Marketing">Marketing</Option>
                      <Option value="Business Development">
                        Business Development
                      </Option>
                      <Option value="Customer Success">Customer Success</Option>
                      <Option value="IT">IT</Option>
                      <Option value="HR">HR</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Position" name="position">
                    <Input
                      placeholder="Your position or title"
                      disabled={!editableFields.includes('position')}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Admin fields */}
              {(currentUser.role === 'super_admin' ||
                currentUser.role === 'admin') && (
                <>
                  <Divider>Administrative Information</Divider>
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item label="Company" name="company">
                        <Input
                          placeholder="Company"
                          disabled={!editableFields.includes('company')}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Status" name="status">
                        <Select
                          placeholder="Select Status"
                          disabled={!editableFields.includes('status')}
                        >
                          <Option value="active">Active</Option>
                          <Option value="inactive">Inactive</Option>
                          <Option value="suspended">Suspended</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item label="Notes" name="notes">
                    <TextArea
                      rows={3}
                      placeholder="Administrative notes..."
                      disabled={!editableFields.includes('notes')}
                    />
                  </Form.Item>
                </>
              )}
            </Form>
          </Card>

          {/* Performance Stats for salespeople and customers */}
          {(profile.role === 'salesperson' ||
            profile.role === 'customer' ||
            profile.role === 'team_head') && (
            <Card title="Performance Overview" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Total Sales"
                    value={profile.totalSales || 0}
                    prefix={<ShoppingCartOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Total Orders"
                    value={profile.totalOrders || 0}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Total Spent"
                    value={profile.totalSpent || 0}
                    prefix="$"
                    valueStyle={{ color: '#faad14' }}
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Statistic
                    title="Performance"
                    value={profile.performance || 0}
                    suffix="%"
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
              </Row>
            </Card>
          )}

          {/* Account Information */}
          <Card title="Account Information">
            <Descriptions column={1}>
              <Descriptions.Item label="Role">
                <Tag
                  color={
                    profile.role === 'super_admin'
                      ? 'red'
                      : profile.role === 'admin'
                        ? 'orange'
                        : profile.role === 'salesperson'
                          ? 'blue'
                          : profile.role === 'customer'
                            ? 'green'
                            : 'default'
                  }
                >
                  {profile.role?.replace('_', ' ').toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Member Since">
                <Space>
                  <CalendarOutlined />
                  {profile.createdAt
                    ? dayjs(profile.createdAt).format('MMMM D, YYYY')
                    : 'N/A'}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Last Login">
                <Space>
                  <CalendarOutlined />
                  {profile.lastLogin
                    ? dayjs(profile.lastLogin).format('MMMM D, YYYY HH:mm')
                    : 'Never'}
                </Space>
              </Descriptions.Item>
              {profile.lastOrder && (
                <Descriptions.Item label="Last Order">
                  <Space>
                    <ShoppingCartOutlined />
                    {dayjs(profile.lastOrder).format('MMMM D, YYYY')}
                  </Space>
                </Descriptions.Item>
              )}
              {profile.team && (
                <Descriptions.Item label="Team">
                  <Tag>{profile.team}</Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Right Column - Avatar & Settings */}
        <Col xs={24} lg={8}>
          {/* Avatar Upload */}
          <Card style={{ marginBottom: 24, textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                size={100}
                icon={<UserOutlined />}
                src={
                  avatarFile
                    ? URL.createObjectURL(avatarFile) // Show selected file preview
                    : profile.avatar
                      ? `http://localhost:5000/${profile.avatar}` // Show uploaded avatar
                      : undefined // Show default icon
                }
                style={{ marginBottom: 16 }}
              />
              {canEdit && (
                <Upload {...avatarUploadProps} onChange={handleAvatarSelect}>
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
                </Upload>
              )}
              {profile.avatar && canEdit && (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={handleDeleteAvatar}
                  style={{ position: 'absolute', top: 10, right: 10 }}
                >
                  Remove
                </Button>
              )}
            </div>
            <Title level={4} style={{ margin: 0 }}>
              {profile.firstName} {profile.lastName}
            </Title>
            <Text type="secondary">
              {profile.position || profile.role?.replace('_', ' ')}
            </Text>
            <Divider />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {canEdit
                ? 'Click the camera icon to update your profile picture'
                : 'Profile picture'}
            </Text>
          </Card>

          {/* Notification Settings - only for own profile */}
          {isOwnProfile && (
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
                        onChange={(checked) =>
                          handleNotificationChange(item.key, checked)
                        }
                      />,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Text style={{ fontSize: '14px' }}>{item.title}</Text>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {item.description}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}

          {/* Change Password - only for own profile */}
          {isOwnProfile && (
            <Card title="Security">
              <Form layout="vertical" onFinish={handlePasswordChange}>
                <Form.Item
                  label="Current Password"
                  name="currentPassword"
                  rules={[
                    {
                      required: true,
                      message: 'Please enter current password',
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Current password"
                  />
                </Form.Item>
                <Form.Item
                  label="New Password"
                  name="newPassword"
                  rules={[
                    { required: true, message: 'Please enter new password' },
                    {
                      min: 6,
                      message: 'Password must be at least 6 characters',
                    },
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
                        return Promise.reject(
                          new Error('Passwords do not match')
                        );
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
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;
