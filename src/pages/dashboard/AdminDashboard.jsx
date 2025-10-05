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
  Select,
  Progress,
  Tag,
  Spin,
  Alert,
  List,
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
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/adminApi';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [systemData, setSystemData] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsResponse, performersResponse] = await Promise.all([
        adminAPI.getSystemAnalytics(),
        adminAPI.getLeaderboard({ limit: 5 }),
      ]);

      setSystemData(analyticsResponse.data);
      setTopPerformers(performersResponse.data || []);
      
      // Mock recent activities
      setRecentActivities([
        { id: 1, user: 'John Doe', action: 'New sale recorded', time: '2 hours ago' },
        { id: 2, user: 'Sarah Wilson', action: 'Joined competition', time: '4 hours ago' },
        { id: 3, user: 'Mike Johnson', action: 'Achieved monthly target', time: '6 hours ago' },
        { id: 4, user: 'Jane Smith', action: 'Referred new salesperson', time: '1 day ago' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockSystemData = {
    totalSales: 8500,
    totalRevenue: 1700000,
    activeSalespersons: 45,
    activeCustomers: 890,
    ongoingCompetitions: 8,
    monthlyGrowth: 12.5,
    targetAchievement: 78,
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
      prefix: '$',
    },
    {
      title: 'Active Salespersons',
      value: data.activeSalespersons,
      prefix: <TeamOutlined />,
      valueStyle: { color: '#722ed1' },
    },
    {
      title: 'Active Customers',
      value: data.activeCustomers,
      prefix: <UserOutlined />,
      valueStyle: { color: '#fa8c16' },
    },
    {
      title: 'Ongoing Competitions',
      value: data.ongoingCompetitions,
      prefix: <TrophyOutlined />,
      valueStyle: { color: '#13c2c2' },
    },
    {
      title: 'Target Achievement',
      value: data.targetAchievement,
      suffix: '%',
      valueStyle: { color: data.targetAchievement > 75 ? '#52c41a' : '#faad14' },
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
      dataIndex: 'value',
      key: 'sales',
      align: 'center',
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => (
        <Progress 
          percent={Math.min(100, (record.value / 100) * 100)} 
          size="small" 
          style={{ width: 100 }}
        />
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <BarChartOutlined /> Admin Dashboard
          </Title>
          <Text type="secondary">
            Overview of your sales team performance and system analytics
          </Text>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<ReloadOutlined />}
              onClick={fetchDashboardData}
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
                {card.title === 'Total Revenue' && (
                  <div style={{ marginTop: 8 }}>
                    <Text type={data.monthlyGrowth > 0 ? 'success' : 'danger'}>
                      {data.monthlyGrowth > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                      {Math.abs(data.monthlyGrowth)}% from last month
                    </Text>
                  </div>
                )}
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
                dataSource={topPerformers}
                pagination={false}
                size="small"
                locale={{ emptyText: 'No performance data available' }}
              />
            </Card>
          </Col>

          {/* Recent Activities */}
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
              <List
                dataSource={recentActivities}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<Text>{item.user}</Text>}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">{item.action}</Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {item.time}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
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
                onClick={() => navigate('/salespersons')}
                style={{ textAlign: 'center' }}
              >
                <TeamOutlined style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }} />
                <Title level={5}>Manage Sales Team</Title>
                <Text type="secondary">View and manage salespersons</Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card 
                hoverable
                onClick={() => navigate('/targets')}
                style={{ textAlign: 'center' }}
              >
                <BarChartOutlined style={{ fontSize: 32, color: '#52c41a', marginBottom: 8 }} />
                <Title level={5}>Set Targets</Title>
                <Text type="secondary">Configure sales targets</Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card 
                hoverable
                onClick={() => navigate('/competitions')}
                style={{ textAlign: 'center' }}
              >
                <TrophyOutlined style={{ fontSize: 32, color: '#faad14', marginBottom: 8 }} />
                <Title level={5}>Create Competition</Title>
                <Text type="secondary">Launch new sales competition</Text>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* System Health */}
        <Card title="System Health" style={{ marginTop: 24 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Progress
                type="circle"
                percent={95}
                format={percent => `API ${percent}%`}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Text strong>API Status</Text>
              </div>
            </Col>
            <Col span={8}>
              <Progress
                type="circle"
                percent={98}
                format={percent => `DB ${percent}%`}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Text strong>Database</Text>
              </div>
            </Col>
            <Col span={8}>
              <Progress
                type="circle"
                percent={99}
                format={percent => `Cache ${percent}%`}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <Text strong>Cache</Text>
              </div>
            </Col>
          </Row>
        </Card>
      </Spin>
    </div>
  );
};

export default AdminDashboard;