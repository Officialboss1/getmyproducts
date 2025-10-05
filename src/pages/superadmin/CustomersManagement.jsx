import React, { useState } from 'react';
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
  Tooltip,
  Badge,
  Descriptions,
} from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const CustomersManagement = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Mock data - replace with actual API call
  const customers = [
    {
      id: '1',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      phone: '+1 (555) 123-4567',
      company: 'TechCorp Inc.',
      position: 'Procurement Manager',
      status: 'active',
      totalOrders: 15,
      totalSpent: 45000,
      lastOrder: '2025-10-01',
      joinDate: '2024-01-15',
      address: '123 Business Ave, New York, NY 10001',
      notes: 'VIP customer - prefers email communication',
    },
    {
      id: '2',
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@example.com',
      phone: '+1 (555) 987-6543',
      company: 'Global Solutions Ltd.',
      position: 'Director of Operations',
      status: 'active',
      totalOrders: 8,
      totalSpent: 22000,
      lastOrder: '2025-09-28',
      joinDate: '2024-02-20',
      address: '456 Corporate Blvd, Chicago, IL 60601',
      notes: 'Interested in bulk orders',
    },
    {
      id: '3',
      firstName: 'Carol',
      lastName: 'Williams',
      email: 'carol.williams@example.com',
      phone: '+1 (555) 456-7890',
      company: 'StartUp Innovations',
      position: 'CEO',
      status: 'inactive',
      totalOrders: 3,
      totalSpent: 7500,
      lastOrder: '2025-08-15',
      joinDate: '2024-03-10',
      address: '789 Enterprise St, San Francisco, CA 94102',
      notes: 'No recent activity - follow up needed',
    },
  ];

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    totalRevenue: customers.reduce((acc, c) => acc + c.totalSpent, 0),
    averageOrderValue: Math.round(customers.reduce((acc, c) => acc + c.totalSpent, 0) / customers.reduce((acc, c) => acc + c.totalOrders, 0)),
  };

  const filteredCustomers = customers.filter(customer =>
    (customer.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
     customer.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
     customer.email?.toLowerCase().includes(searchText.toLowerCase()) ||
     customer.company?.toLowerCase().includes(searchText.toLowerCase())) &&
    (statusFilter === 'all' || customer.status === statusFilter)
  );

  const showCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setDetailModalVisible(true);
  };

  const columns = [
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
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <MailOutlined /> {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Company & Position',
      key: 'company',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.company}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.position}
          </Text>
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
          text={status.toUpperCase()}
        />
      ),
    },
    {
      title: 'Orders & Revenue',
      key: 'orders',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.totalOrders} orders</Text>
          <Text type="success" style={{ fontSize: '12px' }}>
            ${record.totalSpent?.toLocaleString()}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Last Order',
      dataIndex: 'lastOrder',
      key: 'lastOrder',
      render: (date) => (
        <Text type="secondary">
          {date ? new Date(date).toLocaleDateString() : 'Never'}
        </Text>
      ),
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
              onClick={() => showCustomerDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Contact Customer">
            <Button type="link" icon={<MailOutlined />} />
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
            <UserOutlined /> Customers Management
          </Title>
          <Text type="secondary">
            Manage all customer accounts and relationships
          </Text>
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Customers"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Active Customers"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix="$"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Avg Order Value"
              value={stats.averageOrderValue}
              prefix="$"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12}>
            <Input
              placeholder="Search customers by name, email, or company..."
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
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Button type="primary" icon={<SearchOutlined />} style={{ width: '100%' }}>
              Search
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Customers Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredCustomers}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} customers`,
          }}
        />
      </Card>

      {/* Customer Details Modal */}
      <Modal
        title="Customer Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedCustomer && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Full Name" span={2}>
              {selectedCustomer.firstName} {selectedCustomer.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedCustomer.email}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {selectedCustomer.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Company">
              {selectedCustomer.company}
            </Descriptions.Item>
            <Descriptions.Item label="Position">
              {selectedCustomer.position}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedCustomer.status === 'active' ? 'green' : 'red'}>
                {selectedCustomer.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Total Orders">
              {selectedCustomer.totalOrders}
            </Descriptions.Item>
            <Descriptions.Item label="Total Spent">
              <Text strong>${selectedCustomer.totalSpent?.toLocaleString()}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Last Order">
              {selectedCustomer.lastOrder ? new Date(selectedCustomer.lastOrder).toLocaleDateString() : 'Never'}
            </Descriptions.Item>
            <Descriptions.Item label="Member Since">
              {new Date(selectedCustomer.joinDate).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>
              {selectedCustomer.address}
            </Descriptions.Item>
            <Descriptions.Item label="Notes" span={2}>
              {selectedCustomer.notes}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CustomersManagement;