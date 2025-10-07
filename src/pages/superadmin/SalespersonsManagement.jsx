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

  // Statistics
  const stats = {
    total: salespersons.length,
    active: salespersons.filter(sp => sp.status === 'active').length,
    teamHeads: salespersons.filter(sp => sp.isTeamHead).length,
    averagePerformance: salespersons.length
      ? Math.round(salespersons.reduce((acc, sp) => acc + (sp.performance || 0), 0) / salespersons.length)
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
      render: (_, record) => (
        <Space direction="vertical" style={{ width: 150 }}>
          <Progress
            percent={record.performance || 0}
            size="small"
            status={record.performance >= 80 ? 'success' : record.performance >= 60 ? 'active' : 'exception'}
          />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.totalSales || 0} sales
          </Text>
        </Space>
      ),
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActive',
      key: 'lastActive',
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
            <Button type="link" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="Send Message">
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
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Salespersons"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic title="Active" value={stats.active} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Team Heads"
              value={stats.teamHeads}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
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
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Filter by team"
              style={{ width: '100%' }}
              value={teamFilter}
              onChange={setTeamFilter}
            >
              <Option value="all">All Teams</Option>
              <Option value="North Region">North Region</Option>
              <Option value="South Region">South Region</Option>
              <Option value="East Region">East Region</Option>
              <Option value="West Region">West Region</Option>
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
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} salespersons`,
          }}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default SalespersonsManagement;
