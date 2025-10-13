import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Popconfirm,
  Tooltip,
  Tabs,
  Badge,
  Switch,
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CrownOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useUsers } from '../../hooks/useUsers';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const UserManagement = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [activeTab, setActiveTab] = useState('salespersons');
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  const {
    users: allUsersFromBackend,
    loading,
    error: _error,
    updateUser,
    createUser,
    deleteUser,
    refetch: _refetch,
  } = useUsers(''); // Try with empty string to get all users

  // Mock customers fallback (used if backend returns no customers)
  const mockCustomers = [
    {
      id: '1',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Inc.',
      status: 'active',
      totalOrders: 15,
      joinDate: '2024-01-15',
    },
    {
      id: '2',
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@example.com',
      phone: '+1 (555) 987-6543',
      company: 'Global Solutions Ltd.',
      status: 'active',
      totalOrders: 8,
      joinDate: '2024-02-20',
    },
  ];

  const handleCreateUser = async (values) => {
    try {
      await createUser(values);
      message.success('User created successfully!');
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleUpdateUser = async (values) => {
    try {
      await updateUser(editingUser.id, values);
      message.success('User updated successfully!');
      setModalVisible(false);
      setEditingUser(null);
      form.resetFields();
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      message.success('User deleted successfully!');
    } catch (error) {
      message.error(error.message);
    }
  };

  const promoteToTeamHead = async (userId) => {
    try {
      await updateUser(userId, { role: 'team_head' });
      message.success('User promoted to Team Head!');
    } catch (error) {
      message.error(error.message);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      status: user.status,
    });
    setModalVisible(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const salespersonColumns = [
    {
      title: 'Salesperson',
      dataIndex: 'firstName',
      key: 'name',
      render: (text, record) => (
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#1890ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            {record.firstName?.[0]}
            {record.lastName?.[0]}
          </div>
          <div>
            <Space>
              <Text strong>
                {record.firstName} {record.lastName}
              </Text>
              {record.role === 'team_head' && (
                <Tooltip title="Team Head">
                  <CrownOutlined style={{ color: '#faad14' }} />
                </Tooltip>
              )}
            </Space>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Contact',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || <Text type="secondary">Not set</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === 'active' ? 'success' : 'default'}
          text={status?.toUpperCase()}
        />
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'team_head' ? 'gold' : 'blue'}>
          {role?.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="link" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="Edit User">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          {record.role !== 'team_head' && (
            <Tooltip title="Promote to Team Head">
              <Button
                type="link"
                icon={<CrownOutlined />}
                onClick={() => promoteToTeamHead(record.id)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Delete User"
            description="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete User">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const customerColumns = [
    {
      title: 'Customer',
      dataIndex: 'firstName',
      key: 'name',
      render: (text, record) => (
        <Space>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#13c2c2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            {record.firstName?.[0]}
            {record.lastName?.[0]}
          </div>
          <div>
            <Text strong>
              {record.firstName} {record.lastName}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: 'Contact',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <Space>
          <PhoneOutlined />
          <Text>{phone}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === 'active' ? 'success' : 'default'}
          text={status?.toUpperCase()}
        />
      ),
    },
    {
      title: 'Orders',
      dataIndex: 'totalOrders',
      key: 'orders',
      align: 'center',
      render: (orders) => <Text strong>{orders}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="link" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="Contact Customer">
            <Button type="link" icon={<MailOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Use users returned from backend. Filter by role locally.
  const allUsers = Array.isArray(allUsersFromBackend)
    ? allUsersFromBackend
    : [];

  const salesTeam = allUsers.filter((u) => {
    const role = u.role || '';
    return role === 'salesperson' || role === 'team_head';
  });

  const customers = allUsers.filter((u) => (u.role || '') === 'customer');

  const filteredSalespersons = salesTeam.filter(
    (user) =>
      user.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredCustomers = (
    customers.length > 0 ? customers : mockCustomers
  ).filter(
    (customer) =>
      customer.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      (customer.company || '').toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Title level={2} style={{ margin: 0 }}>
            <TeamOutlined /> User Management
          </Title>
          <Text type="secondary">
            Manage sales team members and customer accounts
          </Text>
        </Col>
        <Col xs={24} md={12}>
          <Row justify="end" gutter={[8, 8]}>
            <Col xs={24} sm={12} md={16}>
              <Input
                placeholder="Search users..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={openCreateModal}
                block
              >
                Add User
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Sales Team" key="salespersons">
            <Table
              columns={salespersonColumns}
              dataSource={filteredSalespersons}
              loading={loading}
              rowKey={(record) => record.id || record._id}
              scroll={{ x: 800 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} salespersons`,
              }}
            />
          </TabPane>

          <TabPane tab="Customers" key="customers">
            <Table
              columns={customerColumns}
              dataSource={filteredCustomers}
              rowKey={(record) => record.id || record._id}
              scroll={{ x: 800 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} customers`,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingUser ? 'Edit User' : 'Create New User'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingUser ? handleUpdateUser : handleCreateUser}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true, message: 'Please enter first name' }]}
              >
                <Input prefix={<UserAddOutlined />} placeholder="First Name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true, message: 'Please enter last name' }]}
              >
                <Input placeholder="Last Name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email address" />
          </Form.Item>

          <Form.Item label="Phone" name="phone">
            <Input prefix={<PhoneOutlined />} placeholder="Phone number" />
          </Form.Item>

          <Form.Item label="Status" name="status" initialValue="active">
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          {!editingUser && (
            <Form.Item label="Role" name="role" initialValue="sales_person">
              <Select>
                <Option value="sales_person">Sales Person</Option>
                <Option value="team_head">Team Head</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
              <Button onClick={handleModalCancel}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
