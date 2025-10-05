import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
  Typography,
  Table,
  Progress,
  Tag,
  Space,
  Button,
  Tabs,
} from 'antd';
import {
  BarChartOutlined,
  DownloadOutlined,
  FilterOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { adminAPI } from '../../services/adminApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('monthly');
  const [teamFilter, setTeamFilter] = useState('all');
  const [dateRange, setDateRange] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [period, teamFilter]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const filters = {
        period,
        team: teamFilter !== 'all' ? teamFilter : undefined,
        startDate: dateRange?.[0]?.toISOString(),
        endDate: dateRange?.[1]?.toISOString(),
      };

      const response = await adminAPI.getSystemAnalytics(filters);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data
  const mockAnalyticsData = {
    totalSales: 12500,
    totalRevenue: 2500000,
    activeUsers: 45,
    conversionRate: 23.5,
    averageOrderValue: 200,
    growthRate: 15.2,
    teamPerformance: [
      { team: 'North Region', sales: 3200, target: 3000, progress: 107 },
      { team: 'South Region', sales: 2800, target: 3000, progress: 93 },
      { team: 'East Region', sales: 3500, target: 3200, progress: 109 },
      { team: 'West Region', sales: 3000, target: 2800, progress: 107 },
    ],
    topProducts: [
      { product: 'iPhone 15', sales: 4500, revenue: 900000 },
      { product: 'MacBook Air', sales: 2800, revenue: 4200000 },
      { product: 'Apple Watch', sales: 3200, revenue: 1280000 },
      { product: 'iPad Pro', sales: 2000, revenue: 1800000 },
    ],
    salesTrend: [
      { month: 'Jan', sales: 1200 },
      { month: 'Feb', sales: 1800 },
      { month: 'Mar', sales: 1500 },
      { month: 'Apr', sales: 2200 },
      { month: 'May', sales: 2800 },
      { month: 'Jun', sales: 3200 },
    ],
  };

  const data = analyticsData || mockAnalyticsData;

  const teamPerformanceColumns = [
    {
      title: 'Team',
      dataIndex: 'team',
      key: 'team',
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales) => <Text strong>{sales.toLocaleString()}</Text>,
    },
    {
      title: 'Target',
      dataIndex: 'target',
      key: 'target',
      render: (target) => <Text>{target.toLocaleString()}</Text>,
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => (
        <Space direction="vertical" style={{ width: 150 }}>
          <Progress 
            percent={Math.min(100, record.progress)} 
            status={record.progress >= 100 ? 'success' : 'active'}
            size="small"
          />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.progress}%
          </Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag color={record.progress >= 100 ? 'success' : record.progress >= 90 ? 'warning' : 'error'}>
          {record.progress >= 100 ? 'Achieved' : record.progress >= 90 ? 'Close' : 'Behind'}
        </Tag>
      ),
    },
  ];

  const productColumns = [
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Units Sold',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales) => <Text strong>{sales.toLocaleString()}</Text>,
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue) => <Text type="success">${revenue.toLocaleString()}</Text>,
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (_, record, index) => (
        <Tag color={index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'default'}>
          #{index + 1}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <BarChartOutlined /> Sales Analytics
          </Title>
          <Text type="secondary">
            Comprehensive sales performance and team analytics
          </Text>
        </Col>
        <Col>
          <Space>
            <Button icon={<DownloadOutlined />}>
              Export Report
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <Select
              value={period}
              onChange={setPeriod}
              style={{ width: '100%' }}
            >
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
              <Option value="quarterly">Quarterly</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Filter by Team"
              style={{ width: '100%' }}
              value={teamFilter}
              onChange={setTeamFilter}
            >
              <Option value="all">All Teams</Option>
              <Option value="north">North Region</Option>
              <Option value="south">South Region</Option>
              <Option value="east">East Region</Option>
              <Option value="west">West Region</Option>
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={setDateRange}
            />
          </Col>
          <Col xs={24} md={4}>
            <Button 
              type="primary" 
              icon={<FilterOutlined />}
              onClick={fetchAnalyticsData}
              loading={loading}
              style={{ width: '100%' }}
            >
              Apply
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Key Metrics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Sales"
              value={data.totalSales}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix="units"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={data.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            //   prefix="$"
            />
            <div style={{ marginTop: 8 }}>
              <Text type={data.growthRate > 0 ? 'success' : 'danger'}>
                {data.growthRate > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                {Math.abs(data.growthRate)}% from last period
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Sales Team"
              value={data.activeUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Conversion Rate"
              value={data.conversionRate}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Avg Order Value"
              value={data.averageOrderValue}
              prefix="$"
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Target Achievement"
              value={85}
              suffix="%"
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Active Competitions"
              value={6}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="teams">
        <TabPane tab="Team Performance" key="teams">
          <Card>
            <Table
              columns={teamPerformanceColumns}
              dataSource={data.teamPerformance}
              pagination={false}
              loading={loading}
            />
          </Card>
        </TabPane>

        <TabPane tab="Product Performance" key="products">
          <Card>
            <Table
              columns={productColumns}
              dataSource={data.topProducts}
              pagination={false}
              loading={loading}
            />
          </Card>
        </TabPane>

        <TabPane tab="Sales Trend" key="trend">
          <Card>
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <BarChartOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: 16 }} />
              <Title level={4} type="secondary">
                Sales Trend Analysis
              </Title>
              <Text type="secondary">
                Visual charts and trend analysis coming in next update
              </Text>
              <div style={{ marginTop: 16 }}>
                <Text strong>Recent Months Performance:</Text>
                <div style={{ marginTop: 8 }}>
                  {data.salesTrend.map((item, index) => (
                    <Tag key={index} color="blue" style={{ margin: '4px' }}>
                      {item.month}: {item.sales} units
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Analytics;