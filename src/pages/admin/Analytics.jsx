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
  LineChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { adminAPI } from '../../api/services/adminApi';

const { Text, Title } = Typography;
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

  const data = analyticsData || {};

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
      render: (sales) => <Text strong>{sales?.toLocaleString() || 0}</Text>,
    },
    {
      title: 'Target',
      dataIndex: 'target',
      key: 'target',
      render: (target) => <Text>{target?.toLocaleString() || 0}</Text>,
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => (
        <Space direction="vertical" style={{ width: 150 }}>
          <Progress
            percent={Math.min(100, record.progress || 0)}
            status={record.progress >= 100 ? 'success' : 'active'}
            size="small"
          />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.progress || 0}%
          </Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Tag
          color={
            record.progress >= 100
              ? 'success'
              : record.progress >= 90
                ? 'warning'
                : 'error'
          }
        >
          {record.progress >= 100
            ? 'Achieved'
            : record.progress >= 90
              ? 'Close'
              : 'Behind'}
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
      render: (sales) => <Text strong>{sales?.toLocaleString() || 0}</Text>,
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue) => (
        <Text type="success">${revenue?.toLocaleString() || 0}</Text>
      ),
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (_, __, index) => (
        <Tag
          color={
            index === 0
              ? 'gold'
              : index === 1
                ? 'silver'
                : index === 2
                  ? 'bronze'
                  : 'default'
          }
        >
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
            <Button icon={<DownloadOutlined />}>Export Report</Button>
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
            <RangePicker style={{ width: '100%' }} onChange={setDateRange} />
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
              value={data.totalSales || 0}
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
              value={data.totalRevenue || 0}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            {data.growthRate != null && (
              <div style={{ marginTop: 8 }}>
                <Text type={data.growthRate > 0 ? 'success' : 'danger'}>
                  {data.growthRate > 0 ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )}
                  {Math.abs(data.growthRate)}% from last period
                </Text>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Sales Team"
              value={data.activeUsers || 0}
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
              value={data.conversionRate || 0}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Avg Order Value"
              value={data.averageOrderValue || 0}
              prefix="$"
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Target Achievement"
              value={data.targetAchievement || 0}
              suffix="%"
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Active Competitions"
              value={data.activeCompetitions || 0}
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
              dataSource={data.teamPerformance || []}
              pagination={false}
              loading={loading}
              rowKey="team"
            />
          </Card>
        </TabPane>

        <TabPane tab="Product Performance" key="products">
          <Card>
            <Table
              columns={productColumns}
              dataSource={data.topProducts || []}
              pagination={false}
              loading={loading}
              rowKey="product"
            />
          </Card>
        </TabPane>

        <TabPane tab="Sales Trend Analysis" key="trend">
          <Row gutter={16}>
            <Col xs={24} lg={16}>
              <Card
                title={
                  <>
                    <LineChartOutlined /> Sales Trend Over Time
                  </>
                }
              >
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={data.salesTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Sales Units']} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#1890ff"
                      strokeWidth={3}
                      dot={{ fill: '#1890ff', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#52c41a"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#52c41a', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card
                title={
                  <>
                    <PieChartOutlined /> Sales Distribution
                  </>
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.productDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.productDistribution?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            [
                              '#1890ff',
                              '#52c41a',
                              '#faad14',
                              '#eb2f96',
                              '#722ed1',
                            ][index % 5]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Performance Insights" style={{ marginTop: 16 }}>
                <Space direction="vertical" size="small">
                  <div>
                    <Text strong>Growth Rate: </Text>
                    <Text type={data.growthRate > 0 ? 'success' : 'danger'}>
                      {data.growthRate > 0 ? '+' : ''}
                      {data.growthRate || 0}%
                    </Text>
                  </div>
                  <div>
                    <Text strong>Best Month: </Text>
                    <Text type="success">{data.bestMonth || 'N/A'}</Text>
                  </div>
                  <div>
                    <Text strong>Peak Sales: </Text>
                    <Text strong>{data.peakSales || 0} units</Text>
                  </div>
                  <div>
                    <Text strong>Consistency: </Text>
                    <Progress
                      percent={data.consistencyScore || 0}
                      size="small"
                    />
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: 16 }}>
            <Col xs={24}>
              <Card
                title={
                  <>
                    <BarChartOutlined /> Monthly Comparison
                  </>
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.monthlyComparison || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="currentYear"
                      fill="#1890ff"
                      name="Current Year"
                    />
                    <Bar dataKey="lastYear" fill="#d9d9d9" name="Last Year" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Analytics;



