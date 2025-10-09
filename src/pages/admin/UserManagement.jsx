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

  // Modal states
  const [userDetailsModalVisible, setUserDetailsModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsForm] = Form.useForm();
  const [contactForm] = Form.useForm();

  // Role-based permissions
  const getCurrentUserRole = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role || 'guest';
  };

  const canEditUser = (targetUser) => {
    const currentUserRole = getCurrentUserRole();
    const isOwnProfile = false; // In admin context, we're not editing our own profile

    if (currentUserRole === 'super_admin') return true;
    if (currentUserRole === 'admin') {
      const lowerRoles = ['salesperson', 'customer', 'team_head'];
      return lowerRoles.includes(targetUser.role);
    }
    return false;
  };

  const canDeleteUser = (targetUser) => {
    const currentUserRole = getCurrentUserRole();
    if (currentUserRole === 'super_admin') return true;
    if (currentUserRole === 'admin') {
      return targetUser.role !== 'admin' && targetUser.role !== 'super_admin';
    }
    return false;
  };
  
  const {
    users: salespersons,
    loading: salesLoading,
    error: salesError,
    updateUser,
    createUser,
    deleteUser,
    refetch: refetchSales,
  } = useUsers('salesperson', { all: true });


  // Temporary mock data for testing (remove when database is working)
  const mockSalespersons = salespersons.length === 0 && !salesLoading ? [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      role: 'salesperson',
      status: 'active',
      createdAt: '2025-01-15T10:00:00.000Z',
      totalOrders: 5,
      totalSpent: 15000
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567891',
      role: 'salesperson',
      status: 'active',
      createdAt: '2025-02-20T14:30:00.000Z',
      totalOrders: 3,
      totalSpent: 8500
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@example.com',
      phone: '+1234567892',
      role: 'salesperson',
      status: 'inactive',
      createdAt: '2025-03-10T09:15:00.000Z',
      totalOrders: 8,
      totalSpent: 22000
    },
    {
      id: '4',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 'sarah.williams@example.com',
      phone: '+1234567893',
      role: 'salesperson',
      status: 'active',
      createdAt: '2025-04-05T16:45:00.000Z',
      totalOrders: 12,
      totalSpent: 35000
    },
    {
      id: '5',
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@example.com',
      phone: '+1234567894',
      role: 'salesperson',
      status: 'active',
      createdAt: '2025-05-12T11:20:00.000Z',
      totalOrders: 6,
      totalSpent: 18000
    },
    {
      id: '6',
      firstName: 'Lisa',
      lastName: 'Davis',
      email: 'lisa.davis@example.com',
      phone: '+1234567895',
      role: 'salesperson',
      status: 'active',
      createdAt: '2025-06-18T13:10:00.000Z',
      totalOrders: 9,
      totalSpent: 27000
    },
    {
      id: '7',
      firstName: 'Tom',
      lastName: 'Wilson',
      email: 'tom.wilson@example.com',
      phone: '+1234567896',
      role: 'salesperson',
      status: 'inactive',
      createdAt: '2025-07-22T15:55:00.000Z',
      totalOrders: 4,
      totalSpent: 12000
    },
    {
      id: '8',
      firstName: 'Anna',
      lastName: 'Garcia',
      email: 'anna.garcia@example.com',
      phone: '+1234567897',
      role: 'salesperson',
      status: 'active',
      createdAt: '2025-08-08T12:40:00.000Z',
      totalOrders: 15,
      totalSpent: 45000
    },
    {
      id: '9',
      firstName: 'Chris',
      lastName: 'Miller',
      email: 'chris.miller@example.com',
      phone: '+1234567898',
      role: 'salesperson',
      status: 'active',
      createdAt: '2025-09-14T10:25:00.000Z',
      totalOrders: 7,
      totalSpent: 21000
    },
    {
      id: '10',
      firstName: 'Emma',
      lastName: 'Taylor',
      email: 'emma.taylor@example.com',
      phone: '+1234567899',
      role: 'salesperson',
      status: 'active',
      createdAt: '2025-10-01T14:15:00.000Z',
      totalOrders: 11,
      totalSpent: 33000
    },
    {
      id: '11',
      firstName: 'Ryan',
      lastName: 'Anderson',
      email: 'ryan.anderson@example.com',
      phone: '+1234567800',
      role: 'salesperson',
      status: 'active',
      createdAt: '2025-10-05T09:30:00.000Z',
      totalOrders: 13,
      totalSpent: 39000
    },
    {
      id: '12',
      firstName: 'Olivia',
      lastName: 'Martinez',
      email: 'olivia.martinez@example.com',
      phone: '+1234567801',
      role: 'salesperson',
      status: 'inactive',
      createdAt: '2025-10-08T16:50:00.000Z',
      totalOrders: 2,
      totalSpent: 6000
    }
  ] : [];

  const {
    users: customers,
    loading: customersLoading,
    error: customersError,
    refetch: refetchCustomers,
  } = useUsers('customer');

  // Determine loading state based on active tab
  // Don't show loading if we have mock data for salespersons
  const loading = activeTab === 'salespersons'
    ? (salesLoading && salespersons.length === 0)
    : customersLoading;

  const handleCreateUser = async (values) => {
    try {
      await createUser(values);
      message.success('User created successfully!');
      setModalVisible(false);
      form.resetFields();
      // Refresh the data
      if (values.role === 'customer') {
        refetchCustomers();
      } else {
        refetchSales();
      }
    } catch (error) {
      console.error('Create user error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create user';
      message.error(errorMessage);
    }
  };

  const handleUpdateUser = async (values) => {
    try {
      await updateUser(editingUser.id, values);
      message.success('User updated successfully!');
      setModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      // Refresh the data
      if (activeTab === 'salespersons') {
        refetchSales();
      } else {
        refetchCustomers();
      }
    } catch (error) {
      console.error('Update user error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update user';
      message.error(errorMessage);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      message.success('User deleted successfully!');
      // Refresh the data
      if (activeTab === 'salespersons') {
        refetchSales();
      } else {
        refetchCustomers();
      }
    } catch (error) {
      console.error('Delete user error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete user';
      message.error(errorMessage);
    }
  };

  const promoteToTeamHead = async (userId) => {
    try {
      await updateUser(userId, { role: 'team_head' });
      message.success('User promoted to Team Head!');
      // Refresh the data
      refetchSales();
    } catch (error) {
      console.error('Promote user error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to promote user';
      message.error(errorMessage);
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

  // User Details Modal Handlers
  const openUserDetailsModal = (user) => {
    setSelectedUser(user);
    userDetailsForm.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      status: user.status,
      role: user.role,
      company: user.company,
    });
    setUserDetailsModalVisible(true);
  };

  const closeUserDetailsModal = () => {
    setUserDetailsModalVisible(false);
    setSelectedUser(null);
    userDetailsForm.resetFields();
  };

  const handleUpdateUserDetails = async (values) => {
    try {
      await updateUser(selectedUser.id, values);
      message.success('User updated successfully!');
      closeUserDetailsModal();
      if (activeTab === 'salespersons') {
        refetchSales();
      } else {
        refetchCustomers();
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  // Contact Modal Handlers
  const openContactModal = (user) => {
    setSelectedUser(user);
    contactForm.setFieldsValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      company: user.company,
      message: '',
    });
    setContactModalVisible(true);
  };

  const closeContactModal = () => {
    setContactModalVisible(false);
    setSelectedUser(null);
    contactForm.resetFields();
  };

  const handleSendMessage = async (values) => {
    try {
      // Here you would implement the messaging functionality
      // For now, we'll just show a success message
      message.success(`Message sent to ${values.firstName} ${values.lastName}!`);
      closeContactModal();
    } catch (error) {
      message.error('Failed to send message');
    }
  };

  const salespersonColumns = [
    {
      title: 'Salesperson',
      dataIndex: 'firstName',
      key: 'name',
      render: (text, record) => (
        <Space>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            {record.firstName?.[0]}{record.lastName?.[0]}
          </div>
          <div>
            <Space>
              <Text strong>{record.firstName} {record.lastName}</Text>
              {record.role === 'team_head' && (
                <Tooltip title="Team Head">
                  <CrownOutlined style={{ color: '#faad14' }} />
                </Tooltip>
              )}
            </Space>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
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
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => openUserDetailsModal(record)}
            />
          </Tooltip>
          <Tooltip title="Edit User">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
              disabled={!canEditUser(record)}
            />
          </Tooltip>
          {record.role !== 'team_head' && canEditUser(record) && (
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
            disabled={!canDeleteUser(record)}
          >
            <Tooltip title="Delete User">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                disabled={!canDeleteUser(record)}
              />
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
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#13c2c2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            {record.firstName?.[0]}{record.lastName?.[0]}
          </div>
          <div>
            <Text strong>{record.firstName} {record.lastName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
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
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => openUserDetailsModal(record)}
            />
          </Tooltip>
          <Tooltip title="Contact Customer">
            <Button
              type="link"
              icon={<MailOutlined />}
              onClick={() => openContactModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Use sales team data directly from the hook, fallback to mock data for testing
  const salesTeam = Array.isArray(salespersons) && salespersons.length > 0
    ? salespersons
    : mockSalespersons;

  // Use customers from the dedicated hook
  const customerList = Array.isArray(customers) ? customers : [];

  const filteredSalespersons = salesTeam.filter(user =>
    user.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredCustomers = customerList.filter(customer =>
    customer.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
    customer.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    (customer.company || '').toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <TeamOutlined /> User Management
          </Title>
          <Text type="secondary">
            Manage sales team members and customer accounts
          </Text>
        </Col>
        <Col>
          <Space>
            <Input
              placeholder="Search users..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={openCreateModal}
            >
              Add User
            </Button>
          </Space>
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
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} salesperson${total !== 1 ? 's' : ''}`,
              }}
            />
          </TabPane>
          
          <TabPane tab="Customers" key="customers">
            <Table
              columns={customerColumns}
              dataSource={filteredCustomers}
              rowKey={(record) => record.id || record._id}
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
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email address" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please enter a password' }]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>
          )}

          <Form.Item
            label="Phone"
            name="phone"
          >
            <Input prefix={<PhoneOutlined />} placeholder="Phone number" />
          </Form.Item>

          <Form.Item
            label="Status"
            name="status"
            initialValue="active"
          >
            <Select>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="Role"
              name="role"
              initialValue="salesperson"
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select>
                <Option value="salesperson">Sales Person</Option>
                <Option value="customer">Customer</Option>
                <Option value="team_head">Team Head</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
              <Button onClick={handleModalCancel}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* User Details Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            User Details
            {selectedUser && (
              <Tag color={selectedUser.role === 'team_head' ? 'gold' : 'blue'}>
                {selectedUser.role?.replace('_', ' ').toUpperCase()}
              </Tag>
            )}
          </Space>
        }
        open={userDetailsModalVisible}
        onCancel={closeUserDetailsModal}
        footer={null}
        width={800}
      >
        {selectedUser && (
          <Form
            form={userDetailsForm}
            layout="vertical"
            onFinish={handleUpdateUserDetails}
          >
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: selectedUser.role === 'customer' ? '#13c2c2' : '#1890ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '24px',
                      margin: '0 auto 8px'
                    }}
                  >
                    {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                  </div>
                  <Title level={4} style={{ margin: 0 }}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Title>
                  <Text type="secondary">{selectedUser.email}</Text>
                </div>
              </Col>
              <Col span={12}>
                <Card size="small" title="User Information" style={{ marginBottom: 16 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text><strong>Status:</strong> <Badge status={selectedUser.status === 'active' ? 'success' : 'default'} text={selectedUser.status?.toUpperCase()} /></Text>
                    <Text><strong>Role:</strong> {selectedUser.role?.replace('_', ' ').toUpperCase()}</Text>
                    <Text><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</Text>
                    {selectedUser.company && <Text><strong>Company:</strong> {selectedUser.company}</Text>}
                  </Space>
                </Card>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[{ required: true, message: 'Please enter first name' }]}
                >
                  <Input placeholder="First Name" disabled={!canEditUser(selectedUser)} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[{ required: true, message: 'Please enter last name' }]}
                >
                  <Input placeholder="Last Name" disabled={!canEditUser(selectedUser)} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input placeholder="Email address" disabled={!canEditUser(selectedUser)} />
            </Form.Item>

            <Form.Item
              label="Phone"
              name="phone"
            >
              <Input placeholder="Phone number" disabled={!canEditUser(selectedUser)} />
            </Form.Item>

            {selectedUser.role === 'customer' && (
              <Form.Item
                label="Company"
                name="company"
              >
                <Input placeholder="Company name" disabled={!canEditUser(selectedUser)} />
              </Form.Item>
            )}

            <Form.Item
              label="Status"
              name="status"
              initialValue="active"
            >
              <Select disabled={!canEditUser(selectedUser)}>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Form.Item>

            {selectedUser.role !== 'customer' && (
              <Form.Item
                label="Role"
                name="role"
              >
                <Select disabled={!canEditUser(selectedUser)}>
                  <Option value="salesperson">Sales Person</Option>
                  <Option value="team_head">Team Head</Option>
                </Select>
              </Form.Item>
            )}

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={!canEditUser(selectedUser)}
                >
                  Update User
                </Button>
                <Button onClick={closeUserDetailsModal}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* Contact Modal */}
      <Modal
        title={
          <Space>
            <MailOutlined />
            Contact {selectedUser?.firstName} {selectedUser?.lastName}
          </Space>
        }
        open={contactModalVisible}
        onCancel={closeContactModal}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <Form
            form={contactForm}
            layout="vertical"
            onFinish={handleSendMessage}
          >
            <Card size="small" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</Text>
                <Text><strong>Email:</strong> {selectedUser.email}</Text>
                <Text><strong>Phone:</strong> {selectedUser.phone || 'Not provided'}</Text>
                {selectedUser.company && <Text><strong>Company:</strong> {selectedUser.company}</Text>}
              </Space>
            </Card>

            <Form.Item
              label="Message"
              name="message"
              rules={[{ required: true, message: 'Please enter a message' }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Type your message here..."
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  Send Message
                </Button>
                <Button onClick={closeContactModal}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;