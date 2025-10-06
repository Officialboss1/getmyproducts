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
  DatePicker,
  Select,
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
const { Option } = Select;
const { RangePicker } = DatePicker;

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [systemData, setSystemData] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    setLoading(true);
    try {
      const [analyticsResponse, performersResponse, activitiesResponse] = await Promise.all([
        superAdminAPI.getSystemAnalytics(),
        superAdminAPI.getAllSalespersons({ limit: 10, sort: 'performance' }),
        superAdminAPI.getAuditLogs({ limit: 10 }),
      ]);

      setSystemData(analyticsResponse.data);
      setTopPerformers(performersResponse.data || []);
      setRecentActivities(activitiesResponse.data || []);
    } catch (error) {
      console.error('Error fetching system data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockSystemData = {
    totalSales: 12500,
    totalRevenue: 2500000,
    totalAdmins: 8,
    totalSalespersons: 156,
    totalCustomers: 2450,
    activeCompetitions: 12,
    systemHealth: 98.5,
    monthlyGrowth: 15.2,
  };

  const data = systemData || mockSystemData;

  const kpiCards = [
    {
      title: 'Total Sales',
      value: data.totalSales,
      prefix: <ShoppingCartOutlined />,
      valueStyle: { color: '#1890ff' },
      suffix: 'units',
    },
    {
      title: 'Total Revenue',
      value: data.totalRevenue,
      prefix: <DollarOutlined />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Admins',
      value: data.totalAdmins,
      prefix: <UserOutlined />,
      valueStyle: { color: '#722ed1' },
    },
    {
      title: 'Salespersons',
      value: data.totalSalespersons,
      prefix: <TeamOutlined />,
      valueStyle: { color: '#fa8c16' },
    },
    {
      title: 'Customers',
      value: data.totalCustomers,
      prefix: <UserOutlined />,
      valueStyle: { color: '#13c2c2' },
    },
    {
      title: 'System Health',
      value: data.systemHealth,
      suffix: '%',
      valueStyle: { color: data.systemHealth > 95 ? '#52c41a' : '#faad14' },
    },
  ];

  const topPerformersColumns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      render: (rank) => (
        <Tag color={rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'default'}>
          #{rank}
        </Tag>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          {record.teamHead && <Tag color="blue">Team Head</Tag>}
        </Space>
      ),
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      key: 'sales',
      align: 'center',
      render: (sales) => <Text strong>{sales}</Text>,
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      align: 'right',
      render: (revenue) => <Text strong>${revenue?.toLocaleString()}</Text>,
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => (
        <Progress 
          percent={Math.min(100, (record.sales / 100) * 100)} 
          size="small" 
          style={{ width: 100 }}
        />
      ),
    },
  ];

  const activitiesColumns = [
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'user',
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          <Tag size="small">{record.userRole}</Tag>
        </Space>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Tag color={
          action.includes('create') ? 'green' :
          action.includes('update') ? 'blue' :
          action.includes('delete') ? 'red' : 'default'
        }>
          {action}
        </Tag>
      ),
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
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
            <Button 
              type="primary"
              onClick={() => navigate('/analytics')}
            >
              Detailed Analytics
            </Button>
          </Space>
        </Col>
      </Row>

      <Spin spinning={loading}>
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
                <Button 
                  type="link" 
                  onClick={() => navigate('/salespersons')}
                >
                  View All
                </Button>
              }
            >
              <Table
                columns={topPerformersColumns}
                dataSource={topPerformers.slice(0, 5)}
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
                <Button 
                  type="link" 
                  onClick={() => navigate('/audit')}
                >
                  View All
                </Button>
              }
            >
              <Table
                columns={activitiesColumns}
                dataSource={recentActivities.slice(0, 5)}
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
                <UserOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
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
                <BarChartOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
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
                <TeamOutlined style={{ fontSize: 32, color: '#faad14', marginBottom: 8 }} />
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