import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Tooltip,
  Badge,
  Modal,
  Form,
  message,
  Popconfirm,
  Divider,
} from 'antd';
import { superAdminAPI } from '../../services/superAdminApi';
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  UserOutlined,
  CrownOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const SalespersonsManagement = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [salespersons, setSalespersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  // Forms
  const [detailsForm] = Form.useForm();
  const [messageForm] = Form.useForm();

  useEffect(() => {
    fetchSalespersons();
  }, []);

  const fetchSalespersons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await superAdminAPI.getAllSalespersons();
      const payload = res?.data || res || [];
      const allUsers = Array.isArray(payload) ? payload : payload.items || [];

      // Filter only users with role 'salesperson'
      const salesUsers = allUsers.filter(user => (user.role || '').toLowerCase() === 'salesperson');
      setSalespersons(salesUsers);
    } catch (err) {
      console.error('Error fetching salespersons', err);
      setError(err?.message || 'Failed to load salespersons');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setEditingUser(null);
    detailsForm.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status || 'active',
    });
    setDetailsModalVisible(true);
  };

  const handleEditUser = () => {
    setEditingUser(selectedUser);
    // Ensure form is populated with current values
    detailsForm.setFieldsValue({
      firstName: selectedUser.firstName,
      lastName: selectedUser.lastName,
      email: selectedUser.email,
      phone: selectedUser.phone,
      role: selectedUser.role,
      status: selectedUser.status || 'active',
    });
  };

  const handleUpdateUser = async (values) => {
    try {
      await superAdminAPI.updateUser(selectedUser._id, values);
      message.success('User updated successfully');
      setDetailsModalVisible(false);
      setEditingUser(null);
      fetchSalespersons(); // Refresh the list
    } catch (error) {
      message.error(error.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    try {
      await superAdminAPI.deleteUser(selectedUser._id);
      message.success('User deleted successfully');
      setDetailsModalVisible(false);
      setSelectedUser(null);
      fetchSalespersons(); // Refresh the list
    } catch (error) {
      message.error(error.message || 'Failed to delete user');
    }
  };

  const handleSendMessage = (user) => {
    setSelectedUser(user);
    messageForm.resetFields();
    setMessageModalVisible(true);
  };

  const handleSendMessageSubmit = async (values) => {
    try {
      // For now, we'll use a simple approach - you might want to add a backend endpoint for this
      await superAdminAPI.sendMessage(selectedUser._id, values);
      message.success('Message sent successfully');
      setMessageModalVisible(false);
      messageForm.resetFields();
    } catch (error) {
      message.error(error.message || 'Failed to send message');
    }
  };

  // Statistics
  const stats = {
    total: salespersons.length,
    active: salespersons.filter(sp => sp.status === 'active').length,
    teamHeads: salespersons.filter(sp => sp.isTeamHead).length,
    averagePerformance: salespersons.length
      ? Math.round(salespersons.reduce((acc, sp) => acc + (sp.totalOrders || 0), 0) / salespersons.length)
      : 0,
  };

  // Filtered data
  const filteredSalespersons = salespersons.filter(sp =>
    (sp.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
     sp.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
     sp.email?.toLowerCase().includes(searchText.toLowerCase())) &&
    (statusFilter === 'all' || sp.status === statusFilter) &&
    (teamFilter === 'all' || sp.team === teamFilter)
  );

  const columns = [
    {
      title: 'Salesperson',
      key: 'name',
      render: (_, record) => (
        <Space>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            {record.firstName?.[0]}{record.lastName?.[0]}
          </div>
          <div>
            <Space>
              <Text strong>{record.firstName} {record.lastName}</Text>
              {record.isTeamHead && (
                <Tooltip title="Team Head">
                  <CrownOutlined style={{ color: '#faad14' }} />
                </Tooltip>
              )}
            </Space>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <MailOutlined /> {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Contact',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <Space>
          <PhoneOutlined />
          <Text>{phone || 'Not set'}</Text>
        </Space>
      ),
    },
    {
      title: 'Team & Admin',
      key: 'team',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.team || 'N/A'}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Managed by: {record.admin || 'N/A'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge status={status === 'active' ? 'success' : 'default'} text={status?.toUpperCase() || 'N/A'} />
      ),
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (_, record) => {
        const totalSales = record.totalOrders || 0;
        const performance = totalSales > 0 ? Math.min(100, (totalSales / 10) * 100) : 0; // Example: 10 sales = 100%
        return (
          <Space direction="vertical" style={{ width: 150 }}>
            <Progress
              percent={performance}
              size="small"
              status={performance >= 80 ? 'success' : performance >= 60 ? 'active' : 'exception'}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {totalSales} sales
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Last Active',
      key: 'lastActive',
      render: (_, record) => (
        <Text type="secondary">{record.lastOrder ? new Date(record.lastOrder).toLocaleDateString() : 'Never'}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          </Tooltip>
          <Tooltip title="Send Message">
            <Button type="link" icon={<MailOutlined />} onClick={() => handleSendMessage(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <UserOutlined /> Salespersons Management
          </Title>
          <Text type="secondary">
            Manage all salespersons across the system
          </Text>
        </Col>
      </Row>

      {/* Statistics */}
      {error && (
        <Card style={{ marginBottom: 16 }}>
          <Text type="danger">{error}</Text>
        </Card>
      )}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6} key="total">
          <Card>
            <Statistic
              title="Total Salespersons"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} key="active">
          <Card>
            <Statistic title="Active" value={stats.active} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={6} key="teamHeads">
          <Card>
            <Statistic
              title="Team Heads"
              value={stats.teamHeads}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6} key="performance">
          <Card>
            <Statistic
              title="Avg Performance"
              value={stats.averagePerformance}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Search salespersons..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all" key="all-status">All Status</Option>
              <Option value="active" key="active-status">Active</Option>
              <Option value="inactive" key="inactive-status">Inactive</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Filter by team"
              style={{ width: '100%' }}
              value={teamFilter}
              onChange={setTeamFilter}
            >
              <Option value="all" key="all-teams">All Teams</Option>
              <Option value="North Region" key="north-region">North Region</Option>
              <Option value="South Region" key="south-region">South Region</Option>
              <Option value="East Region" key="east-region">East Region</Option>
              <Option value="West Region" key="west-region">West Region</Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Button icon={<FilterOutlined />} style={{ width: '100%' }}>
              Apply Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Salespersons Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredSalespersons}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} salespersons`,
          }}
          loading={loading}
        />
      </Card>

      {/* User Details Modal */}
      <Modal
        title="User Details & Management"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setDetailsModalVisible(false)}>
            Cancel
          </Button>,
          <Popconfirm
            title="Delete User"
            description="Are you sure you want to delete this user? This action cannot be undone."
            onConfirm={handleDeleteUser}
            okText="Yes, Delete"
            cancelText="Cancel"
          >
            <Button key="delete" danger>
              Delete User
            </Button>
          </Popconfirm>,
          editingUser ? (
            <Button key="save" type="primary" onClick={() => detailsForm.submit()}>
              Save Changes
            </Button>
          ) : (
            <Button key="edit" type="primary" onClick={handleEditUser}>
              Edit User
            </Button>
          ),
        ]}
      >
        {selectedUser && (
          <div>
            {/* User Info Display */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Card size="small" title="Basic Information">
                  <p><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Role:</strong> {selectedUser.role}</p>
                  <p><strong>Phone:</strong> {selectedUser.phone || 'Not set'}</p>
                  <p><strong>Status:</strong> {selectedUser.status || 'active'}</p>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Performance Stats">
                  <p><strong>Total Sales:</strong> {selectedUser.totalOrders || 0}</p>
                  <p><strong>Total Revenue:</strong> ${selectedUser.totalSpent?.toFixed(2) || '0.00'}</p>
                  <p><strong>Last Active:</strong> {selectedUser.lastOrder ? new Date(selectedUser.lastOrder).toLocaleDateString() : 'Never'}</p>
                  <p><strong>Created:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Unknown'}</p>
                </Card>
              </Col>
            </Row>

            {/* Edit Form */}
            {editingUser && (
              <Divider>Edit User Information</Divider>
            )}
            <Form
              form={detailsForm}
              layout="vertical"
              onFinish={handleUpdateUser}
              style={{ display: editingUser ? 'block' : 'none' }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="First Name" name="firstName" rules={[{ required: true }]} key="firstName">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Last Name" name="lastName" rules={[{ required: true }]} key="lastName">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]} key="email">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Phone" name="phone" key="phone">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Role" name="role" rules={[{ required: true }]} key="role">
                    <Select>
                      <Option value="salesperson" key="role-salesperson">Salesperson</Option>
                      <Option value="admin" key="role-admin">Admin</Option>
                      <Option value="customer" key="role-customer">Customer</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Status" name="status" key="status">
                    <Select>
                      <Option value="active" key="status-active">Active</Option>
                      <Option value="inactive" key="status-inactive">Inactive</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        )}
      </Modal>

      {/* Send Message Modal */}
      <Modal
        title={`Send Message to ${selectedUser?.firstName} ${selectedUser?.lastName}`}
        open={messageModalVisible}
        onCancel={() => setMessageModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setMessageModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="send" type="primary" onClick={() => messageForm.submit()}>
            <SendOutlined /> Send Message
          </Button>,
        ]}
      >
        <Form
          form={messageForm}
          layout="vertical"
          onFinish={handleSendMessageSubmit}
        >
          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: 'Please enter a subject' }]}
            key="subject"
          >
            <Input placeholder="Message subject" />
          </Form.Item>
          <Form.Item
            label="Message"
            name="message"
            rules={[{ required: true, message: 'Please enter a message' }]}
            key="message"
          >
            <Input.TextArea
              rows={6}
              placeholder="Type your message here..."
            />
          </Form.Item>
          <Text type="secondary">
            This message will be sent via email to {selectedUser?.email}
          </Text>
        </Form>
      </Modal>
    </div>
  );
};

export default SalespersonsManagement;
