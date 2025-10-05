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
  Progress,
  Tooltip,
  Badge,
} from 'antd';
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

  // Mock data - replace with actual API call
  const salespersons = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      phone: '+1 (555) 123-4567',
      status: 'active',
      team: 'North Region',
      admin: 'Sarah Wilson',
      joinDate: '2024-01-15',
      totalSales: 245,
      monthlyTarget: 900,
      performance: 85,
      isTeamHead: true,
      lastActive: '2025-10-02',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@company.com',
      phone: '+1 (555) 987-6543',
      status: 'active',
      team: 'South Region',
      admin: 'Mike Johnson',
      joinDate: '2024-02-20',
      totalSales: 189,
      monthlyTarget: 900,
      performance: 65,
      isTeamHead: false,
      lastActive: '2025-10-01',
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@company.com',
      phone: '+1 (555) 456-7890',
      status: 'inactive',
      team: 'East Region',
      admin: 'Sarah Wilson',
      joinDate: '2024-03-10',
      totalSales: 0,
      monthlyTarget: 900,
      performance: 0,
      isTeamHead: false,
      lastActive: '2025-09-15',
    },
  ];

  const stats = {
    total: salespersons.length,
    active: salespersons.filter(sp => sp.status === 'active').length,
    teamHeads: salespersons.filter(sp => sp.isTeamHead).length,
    averagePerformance: Math.round(salespersons.reduce((acc, sp) => acc + sp.performance, 0) / salespersons.length),
  };

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
          <Text>{phone}</Text>
        </Space>
      ),
    },
    {
      title: 'Team & Admin',
      key: 'team',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.team}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Managed by: {record.admin}
          </Text>
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
      title: 'Performance',
      key: 'performance',
      render: (_, record) => (
        <Space direction="vertical" style={{ width: 150 }}>
          <Progress 
            percent={record.performance} 
            size="small" 
            status={record.performance >= 80 ? 'success' : record.performance >= 60 ? 'active' : 'exception'}
          />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.totalSales} sales
          </Text>
        </Space>
      ),
    },
    {
      title: 'Last Active',
      dataIndex: 'lastActive',
      key: 'lastActive',
      render: (date) => (
        <Text type="secondary">
          {new Date(date).toLocaleDateString()}
        </Text>
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
            <Statistic
              title="Active"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
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
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} salespersons`,
          }}
        />
      </Card>
    </div>
  );
};

export default SalespersonsManagement;