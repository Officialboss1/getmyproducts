import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Typography,
  Space,
  Button,
  Progress,
  Tag,
  Spin,
  Alert,
} from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  TrophyOutlined,
  EyeOutlined,
  ReloadOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { superAdminAPI } from '../../services/superAdminApi';

const { Title, Text } = Typography;

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [error, setError] = useState(null);

  const fetchSystemData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch live data from backend
      const [summaryRes, activitiesRes, usersRes] = await Promise.all([
        superAdminAPI.getSalesSummary(),
        superAdminAPI.getRecentActivities(),
        superAdminAPI.getAllUsers(),
      ]);

      const summaryData = summaryRes?.data || {};
      const activities = Array.isArray(activitiesRes?.data) ? activitiesRes.data : [];
      const users = Array.isArray(usersRes?.data) ? usersRes.data : [];

      const analytics = {
        totalSales: summaryData.totalSales ?? 0,
        totalRevenue: summaryData.totalRevenue ?? 0,
        topPerformers: summaryData.topPerformers || [],
        totalAdmins: users.filter(u => u.role === 'admin').length,
        totalSalespersons: users.filter(u => u.role === 'salesperson').length,
        totalCustomers: users.filter(u => u.role === 'customer').length,
        systemHealth: 98, // placeholder health metric
      };

      setSummary(analytics);
      setRecentActivities(activities);
    } catch (err) {
      console.error('Error fetching system data:', err);
      setError(err?.message || 'Failed to fetch system data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 60000);
    return () => clearInterval(interval);
  }, []);

  const data = summary || {};

  const kpiCards = [
  {
    title: 'Total Sales',
    value: data.totalSales ?? 0,
    prefix: <ShoppingCartOutlined />,
    valueStyle: { color: '#1890ff' },
    suffix: 'units',
  },
  {
    title: 'Total Revenue',
    value: data.totalRevenue != null ? data.totalRevenue.toLocaleString() : '0',
    prefix: <DollarOutlined />,
    valueStyle: { color: '#52c41a' },
  },
  {
    title: 'Admins',
    value: data.totalAdmins ?? 0,
    prefix: <UserOutlined />,
    valueStyle: { color: '#722ed1' },
  },
  {
    title: 'Salespersons',
    value: data.totalSalespersons ?? 0,
    prefix: <TeamOutlined />,
    valueStyle: { color: '#fa8c16' },
  },
  {
    title: 'Customers',
    value: data.totalCustomers ?? 0,
    prefix: <UserOutlined />,
    valueStyle: { color: '#13c2c2' },
  },
  {
    title: 'System Health',
    value: data.systemHealth ?? 0,
    suffix: '%',
    valueStyle: { color: (data.systemHealth ?? 0) > 95 ? '#52c41a' : '#faad14' },
  },
];


  const topPerformersColumns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      render: (_, __, index) => (
        <Tag color={index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'default'}>
          #{index + 1}
        </Tag>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Sales',
      dataIndex: 'totalSales',
      key: 'sales',
      align: 'center',
      render: (sales) => <Text strong>{sales}</Text>,
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => (
        <Progress
          percent={Math.min(100, (record.totalSales / 100) * 100)}
          size="small"
          style={{ width: 100 }}
        />
      ),
    },
  ];

  const activitiesColumns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user) => <Text strong>{user?.name || 'N/A'}</Text>,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => {
        if (!action) return null;
        return (
          <Tag
            color={
              action.includes('create')
                ? 'green'
                : action.includes('update')
                ? 'blue'
                : action.includes('delete')
                ? 'red'
                : 'default'
            }
          >
            {action}
          </Tag>
        );
      },
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
    },
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'time',
      render: (timestamp) => new Date(timestamp).toLocaleString(),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <BarChartOutlined /> System Overview
          </Title>
          <Text type="secondary">
            Complete system analytics and management dashboard
          </Text>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchSystemData}
              loading={loading}
            >
              Refresh
            </Button>
            <Button type="primary" onClick={() => navigate('/analytics')}>
              Detailed Analytics
            </Button>
          </Space>
        </Col>
      </Row>

      <Spin spinning={loading}>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        {/* System KPIs */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {kpiCards.map((card, index) => (
            <Col xs={24} sm={12} lg={8} xl={4} key={index}>
              <Card>
                <Statistic
                  title={card.title}
                  value={card.value}
                  prefix={card.prefix}
                  suffix={card.suffix}
                  valueStyle={card.valueStyle}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[24, 24]}>
          {/* Top Performers */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <TrophyOutlined />
                  Top Performers
                </Space>
              }
              extra={
                <Button type="link" onClick={() => navigate('/salespersons')}>
                  View All
                </Button>
              }
            >
              <Table
                columns={topPerformersColumns}
                dataSource={data.topPerformers || []}
                rowKey={(record, index) => record._id || `top-${index}`}
                pagination={false}
                size="small"
                locale={{ emptyText: 'No performance data available' }}
              />
            </Card>
          </Col>

          {/* Recent System Activities */}
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <EyeOutlined />
                  Recent Activities
                </Space>
              }
              extra={
                <Button type="link" onClick={() => navigate('/audit')}>
                  View All
                </Button>
              }
            >
              <Table
                columns={activitiesColumns}
                dataSource={recentActivities}
                rowKey={(record, index) => record._id || `activity-${index}`}
                pagination={false}
                size="small"
                locale={{ emptyText: 'No recent activities' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Card title="Quick Actions" style={{ marginTop: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card
                hoverable
                onClick={() => navigate('/admins')}
                style={{ textAlign: 'center' }}
              >
                <UserOutlined
                  style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }}
                />
                <Title level={5}>Manage Admins</Title>
                <Text type="secondary">Create and manage admin accounts</Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card
                hoverable
                onClick={() => navigate('/targets')}
                style={{ textAlign: 'center' }}
              >
                <BarChartOutlined
                  style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }}
                />
                <Title level={5}>Global Targets</Title>
                <Text type="secondary">Set system-wide sales targets</Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card
                hoverable
                onClick={() => navigate('/referral-settings')}
                style={{ textAlign: 'center' }}
              >
                <TeamOutlined
                  style={{ fontSize: 32, color: '#faad14', marginBottom: 8 }}
                />
                <Title level={5}>Referral Settings</Title>
                <Text type="secondary">Configure referral system</Text>
              </Card>
            </Col>
          </Row>
        </Card>
      </Spin>
    </div>
  );
};

export default SuperAdminDashboard;
