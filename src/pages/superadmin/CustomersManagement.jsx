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
  Tooltip,
  Badge,
  Descriptions,
  Modal,
} from 'antd';
import { superAdminAPI } from '../../services/superAdminApi';
import {
  SearchOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const CustomersManagement = () => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await superAdminAPI.getAllCustomers();
      const payload = res?.data || res || [];
      const allUsers = Array.isArray(payload) ? payload : payload.items || [];
      
      // Filter only users with role 'customer'
      const customerUsers = allUsers.filter(user => (user.role || '').toLowerCase() === 'customer');
      setCustomers(customerUsers);
    } catch (err) {
      console.error('Error fetching customers', err);
      setError(err?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    totalRevenue: customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0),
    averageOrderValue: (() => {
      const totalOrders = customers.reduce((acc, c) => acc + (c.totalOrders || 0), 0);
      return totalOrders ? Math.round(customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0) / totalOrders) : 0;
    })(),
  };

  // Filtered customers
  const filteredCustomers = customers.filter(c =>
    (c.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
     c.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
     c.email?.toLowerCase().includes(searchText.toLowerCase()) ||
     c.company?.toLowerCase().includes(searchText.toLowerCase())) &&
    (statusFilter === 'all' || c.status === statusFilter)
  );

  const showCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'Customer',
      key: 'name',
      render: (_, record) => (
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
          <Text strong>{record.company || 'N/A'}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.position || 'N/A'}</Text>
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge status={status === 'active' ? 'success' : 'default'} text={status?.toUpperCase() || 'N/A'} />
      ),
    },
    {
      title: 'Orders & Revenue',
      key: 'orders',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.totalOrders || 0} orders</Text>
          <Text type="success" style={{ fontSize: '12px' }}>
            ${record.totalSpent?.toLocaleString() || 0}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Last Order',
      dataIndex: 'lastOrder',
      key: 'lastOrder',
      render: (date) => (
        <Text type="secondary">{date ? new Date(date).toLocaleDateString() : 'Never'}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button type="link" icon={<EyeOutlined />} onClick={() => showCustomerDetails(record)} />
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
          <Text type="secondary">Manage all customer accounts and relationships</Text>
        </Col>
      </Row>

      {/* Statistics */}
      {error && <Card style={{ marginBottom: 16 }}><Text type="danger">{error}</Text></Card>}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic title="Total Customers" value={stats.total} prefix={<UserOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic title="Active Customers" value={stats.active} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic title="Total Revenue" value={stats.totalRevenue} prefix="$" valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic title="Avg Order Value" value={stats.averageOrderValue} prefix="$" valueStyle={{ color: '#722ed1' }} />
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
            <Button type="primary" icon={<SearchOutlined />} style={{ width: '100%' }}>Search</Button>
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
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} customers`,
          }}
          loading={loading}
        />
      </Card>

      {/* Customer Details Modal */}
      <Modal
        title="Customer Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>Close</Button>,
        ]}
        width={700}
      >
        {selectedCustomer && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Full Name" span={2}>
              {selectedCustomer.firstName} {selectedCustomer.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">{selectedCustomer.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{selectedCustomer.phone || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Company">{selectedCustomer.company || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Position">{selectedCustomer.position || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedCustomer.status === 'active' ? 'green' : 'red'}>
                {selectedCustomer.status?.toUpperCase() || 'N/A'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Total Orders">{selectedCustomer.totalOrders || 0}</Descriptions.Item>
            <Descriptions.Item label="Total Spent">
              <Text strong>${selectedCustomer.totalSpent?.toLocaleString() || 0}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Last Order">
              {selectedCustomer.lastOrder ? new Date(selectedCustomer.lastOrder).toLocaleDateString() : 'Never'}
            </Descriptions.Item>
            <Descriptions.Item label="Member Since">
              {selectedCustomer.joinDate ? new Date(selectedCustomer.joinDate).toLocaleDateString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>{selectedCustomer.address || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Notes" span={2}>{selectedCustomer.notes || 'N/A'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CustomersManagement;
