import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Typography,
  Space,
  Button,
  Select,
  Tabs,
  Form,
  InputNumber,
  message,
  Divider,
  Alert,
  List,
  Tag,
} from 'antd';
import {
  PieChartOutlined,
  ArrowUpOutlined,
  SettingOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const AnalyticsTargets = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [targets, setTargets] = useState(null);
  const [progress, setProgress] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [dailyStats, setDailyStats] = useState({});
  const [_competitions, setCompetitions] = useState([]);
  const [_dailyProgress, setDailyProgress] = useState({ current: 0, target: 30, percentage: 0 });
  const [weeklyProgress, setWeeklyProgress] = useState({ current: 0, target: 210, percentage: 0 });
  const [monthlyProgress, setMonthlyProgress] = useState({ current: 0, target: 900, percentage: 0 });
  const [period, setPeriod] = useState('monthly');
  const [editingTargets, setEditingTargets] = useState(false);
  const [targetsForm] = Form.useForm();

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);



  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [
        targetsResponse,
        dailyProgressRes,
        weeklyProgressRes,
        monthlyProgressRes,
        salesResponse,
        dailyResponse,
    competitionsResponse,
      ] = await Promise.all([
        api.targets.getTargets(),
        api.analytics.getProgress('', 'daily'),
        api.analytics.getProgress('', 'weekly'),
        api.analytics.getProgress('', 'monthly'),
        api.sales.getSales(),
        api.analytics.getDailySales(),
        api.competitions.getCompetitions(),
      ]);

      // Debug logs to inspect raw responses from the backend
      console.debug('AnalyticsTargets: API responses', {
        targets: targetsResponse?.data,
        dailyProgress: dailyProgressRes?.data,
        weeklyProgress: weeklyProgressRes?.data,
        monthlyProgress: monthlyProgressRes?.data,
        sales: salesResponse?.data,
        dailyStats: dailyResponse?.data,
        competitions: competitionsResponse?.data,
      });

      setTargets(targetsResponse.data);
      setProgress({
        daily: dailyProgressRes.data,
        weekly: weeklyProgressRes.data,
        monthly: monthlyProgressRes.data,
      });
      setSalesData(salesResponse.data || []);
      setDailyStats(dailyResponse.data || {});
  setCompetitions(competitionsResponse.data || []);

      // Set progress states for easier access
      setDailyProgress({
        current: dailyProgressRes.data?.totalUnits || 0,
        target: dailyProgressRes.data?.target || targetsResponse.data?.daily || 30,
        percentage: dailyProgressRes.data?.percentage ? parseFloat(dailyProgressRes.data.percentage) : 0,
      });
      setWeeklyProgress({
        current: weeklyProgressRes.data?.totalUnits || 0,
        target: weeklyProgressRes.data?.target || targetsResponse.data?.weekly || 210,
        percentage: weeklyProgressRes.data?.percentage ? parseFloat(weeklyProgressRes.data.percentage) : 0,
      });
      setMonthlyProgress({
        current: monthlyProgressRes.data?.totalUnits || 0,
        target: monthlyProgressRes.data?.target || targetsResponse.data?.monthly || 900,
        percentage: monthlyProgressRes.data?.percentage ? parseFloat(monthlyProgressRes.data.percentage) : 0,
      });
    } catch (_error) {
      console.error('Error fetching analytics data:', _error);
      message.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTargets = async (values) => {
    try {
      await api.targets.setTargets(values);
      message.success('Targets updated successfully!');
      setEditingTargets(false);
      fetchAnalyticsData();
    } catch {
      message.error('Failed to update targets');
    }
  };

  const resetToDefaults = async () => {
    try {
      await api.targets.deleteTargets(user._id);
      message.success('Targets reset to default values');
      fetchAnalyticsData();
      targetsForm.resetFields();
    } catch {
      message.error('Failed to reset targets');
    }
  };

  const data = {
    targets: targets || {
      userId: user?._id,
      daily: 30,
      weekly: 210,
      monthly: 900,
      isCustom: false,
    },
    progress: progress || {
      userId: user?._id,
      period,
      totalUnits: 0,
      totalRevenue: 0,
      target: 900,
      percentage: '0.00',
      status: 'Needs Boost',
    },
    sales: salesData || [],
  };

  // ---------------------- Performance Calculations ----------------------
  const getPerformanceStats = () => {
  // Daily units: prefer backend daily progress, then dailyStats from analytics API
  const dailyUnits = Number(progress?.daily?.totalUnits ?? dailyStats?.totalUnits ?? 0);

    // Helper to safely extract quantity from a sale record
    const extractQty = (sale) => {
      return Number(
        sale?.quantity_sold ?? sale?.units ?? sale?.quantity ?? sale?.total_units ?? 0
      );
    };

    // Calculate weekly units from salesData if available, otherwise prefer backend progress values
    let weeklyUnits = 0;
    if (Array.isArray(salesData) && salesData.length > 0) {
      weeklyUnits = salesData.reduce((sum, sale) => sum + extractQty(sale), 0);
    } else if (progress?.weekly?.totalUnits !== undefined) {
      weeklyUnits = Number(progress.weekly.totalUnits || 0);
    } else if (weeklyProgress?.current) {
      weeklyUnits = Number(weeklyProgress.current || 0);
    }

    // Monthly units: prefer backend monthly progress, then monthlyProgress state, then sum of sales
    let monthlyUnits = 0;
    if (progress?.monthly?.totalUnits !== undefined) {
      monthlyUnits = Number(progress.monthly.totalUnits || 0);
    } else if (monthlyProgress?.current) {
      monthlyUnits = Number(monthlyProgress.current || 0);
    } else if (Array.isArray(salesData) && salesData.length > 0) {
      monthlyUnits = salesData.reduce((sum, sale) => sum + extractQty(sale), 0);
    }

    const dailyTarget = Number(data.targets?.daily ?? 30);
    const weeklyTarget = Number(data.targets?.weekly ?? 210);
    const monthlyTarget = Number(data.targets?.monthly ?? 900);

    const dailyProgressResult = {
      current: dailyUnits,
      target: dailyTarget,
      percentage: dailyTarget ? (dailyUnits / dailyTarget) * 100 : 0,
    };

    const weeklyProgressResult = {
      current: weeklyUnits,
      target: weeklyTarget,
      percentage: weeklyTarget ? (weeklyUnits / weeklyTarget) * 100 : 0,
    };

    // Prefer backend-provided percentage for monthly if available, otherwise compute from units
    const monthlyPercentageFromBackend =
      progress?.monthly?.percentage !== undefined
        ? parseFloat(progress.monthly.percentage || 0)
        : (monthlyProgress?.percentage ?? 0);

    const monthlyProgressResult = {
      current: monthlyUnits,
      target: monthlyTarget,
      percentage: monthlyPercentageFromBackend || (monthlyTarget ? (monthlyUnits / monthlyTarget) * 100 : 0),
    };

    return {
      dailyProgress: dailyProgressResult,
      weeklyProgress: weeklyProgressResult,
      monthlyProgress: monthlyProgressResult,
    };
  };

  const performanceStats = getPerformanceStats();

  const columns = [
    {
      title: 'Period',
      dataIndex: 'period',
      key: 'period',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Current',
      dataIndex: 'current',
      key: 'current',
      align: 'center',
    },
    {
      title: 'Target',
      dataIndex: 'target',
      key: 'target',
      align: 'center',
    },
    {
      title: 'Progress',
      key: 'progress',
      align: 'center',
      render: (_, record) => (
        <Progress
          percent={Math.round(record.percentage)}
          size="small"
          style={{ minWidth: 100 }}
        />
      ),
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center',
      render: (_, record) => {
        const percentage = record.percentage;
        if (percentage >= 100) return <Tag color="success">Achieved</Tag>;
        if (percentage >= 75) return <Tag color="processing">On Track</Tag>;
        if (percentage >= 50) return <Tag color="warning">Needs Push</Tag>;
        return <Tag color="error">Behind</Tag>;
      },
    },
  ];

  const progressData = [
    {
      key: '1',
      period: 'Daily',
      current: performanceStats.dailyProgress.current,
      target: performanceStats.dailyProgress.target,
      percentage: performanceStats.dailyProgress.percentage,
    },
    {
      key: '2',
      period: 'Weekly',
      current: performanceStats.weeklyProgress.current,
      target: performanceStats.weeklyProgress.target,
      percentage: performanceStats.weeklyProgress.percentage,
    },
    {
      key: '3',
      period: 'Monthly',
      current: performanceStats.monthlyProgress.current,
      target: performanceStats.monthlyProgress.target,
      percentage: performanceStats.monthlyProgress.percentage,
    },
  ];

  // ---------------------- Render ----------------------
  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/dashboard')}
            style={{ marginBottom: 16 }}
          >
            Back to Dashboard
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            <PieChartOutlined /> Analytics & Targets
          </Title>
          <Text type="secondary">
            Track your performance and manage your sales targets
          </Text>
        </Col>
        <Col>
          <Space>
            <Select
              value={period}
              onChange={setPeriod}
              style={{ width: 120 }}
            >
              <Option value="daily">Daily</Option>
              <Option value="weekly">Weekly</Option>
              <Option value="monthly">Monthly</Option>
            </Select>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchAnalyticsData}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        </Col>
      </Row>

      <Tabs defaultActiveKey="overview">
        {/* Overview Tab */}
        <TabPane tab="Performance Overview" key="overview">
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Total Sales"
                  value={progress?.monthly?.totalUnits ?? data.progress.totalUnits}
                  suffix={`/ ${data.targets.monthly}`}
                  valueStyle={{ color: '#1890ff' }}
                />
                <Progress
                  percent={Math.round(performanceStats.monthlyProgress.percentage)}
                  status={performanceStats.monthlyProgress.percentage >= 100 ? 'success' : 'active'}
                  style={{ marginTop: 8 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={progress?.monthly?.totalRevenue ?? data.progress.totalRevenue}
                  prefix="₦"
                  valueStyle={{ color: '#52c41a' }}
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    <ArrowUpOutlined style={{ color: '#52c41a' }} /> 12% from last month
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Success Rate"
                  value={Math.round(performanceStats.monthlyProgress.percentage)}
                  suffix="%"
                  valueStyle={{
                    color:
                      performanceStats.monthlyProgress.percentage >= 75
                        ? '#52c41a'
                        : performanceStats.monthlyProgress.percentage >= 50
                        ? '#faad14'
                        : '#f5222d',
                  }}
                />
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">Of monthly target</Text>
                </div>
              </Card>
            </Col>
          </Row>

          <Card title="Progress Tracking">
            <Table
              columns={columns}
              dataSource={progressData}
              pagination={false}
              loading={loading}
            />
          </Card>
        </TabPane>

        {/* Targets Management Tab */}
        <TabPane tab="Targets Management" key="targets">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <SettingOutlined />
                    Set Your Targets
                    {data.targets.isCustom && (
                      <Tag color="blue">Custom Targets</Tag>
                    )}
                  </Space>
                }
                extra={
                  <Space>
                    {editingTargets ? (
                      <>
                        <Button onClick={() => setEditingTargets(false)}>
                          Cancel
                        </Button>
                        <Button
                          type="primary"
                          icon={<SaveOutlined />}
                          onClick={() => targetsForm.submit()}
                        >
                          Save Targets
                        </Button>
                      </>
                    ) : (
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => setEditingTargets(true)}
                      >
                        Edit Targets
                      </Button>
                    )}
                  </Space>
                }
              >
                {editingTargets ? (
                  <Form
                    form={targetsForm}
                    layout="vertical"
                    onFinish={handleUpdateTargets}
                    initialValues={{
                      daily: data.targets.daily,
                      weekly: data.targets.weekly,
                      monthly: data.targets.monthly,
                    }}
                  >
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          label="Daily Target"
                          name="daily"
                          rules={[{ required: true, message: 'Please enter daily target' }]}
                        >
                          <InputNumber min={1} style={{ width: '100%' }} placeholder="Units" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label="Weekly Target"
                          name="weekly"
                          rules={[{ required: true, message: 'Please enter weekly target' }]}
                        >
                          <InputNumber min={1} style={{ width: '100%' }} placeholder="Units" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          label="Monthly Target"
                          name="monthly"
                          rules={[{ required: true, message: 'Please enter monthly target' }]}
                        >
                          <InputNumber min={1} style={{ width: '100%' }} placeholder="Units" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form>
                ) : (
                  <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <Row gutter={16}>
                      <Col span={8}>
                        <Statistic title="Daily Target" value={data.targets.daily} suffix="units" valueStyle={{ color: '#1890ff' }} />
                      </Col>
                      <Col span={8}>
                        <Statistic title="Weekly Target" value={data.targets.weekly} suffix="units" valueStyle={{ color: '#52c41a' }} />
                      </Col>
                      <Col span={8}>
                        <Statistic title="Monthly Target" value={data.targets.monthly} suffix="units" valueStyle={{ color: '#faad14' }} />
                      </Col>
                    </Row>

                    {data.targets.isCustom && (
                      <Alert
                        message="Custom Targets Active"
                        description="You are using custom targets. Reset to use system defaults."
                        type="info"
                        showIcon
                        action={
                          <Button size="small" onClick={resetToDefaults}>
                            Reset to Defaults
                          </Button>
                        }
                      />
                    )}
                  </Space>
                )}
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Target Guidelines">
                <List
                  size="small"
                  dataSource={[
                    'Daily target: Recommended 30+ units for consistent performance',
                    'Weekly target: Based on 7x daily target for balanced workload',
                    'Monthly target: Set ambitious but achievable goals for growth',
                    'Custom targets help personalize your growth strategy',
                    'Regularly review and adjust targets based on performance',
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                      {item}
                    </List.Item>
                  )}
                />

                <Divider />

                <Text strong>Default System Targets:</Text>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">Daily: 30 units</Text>
                  <br />
                  <Text type="secondary">Weekly: 210 units</Text>
                  <br />
                  <Text type="secondary">Monthly: 900 units</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </TabPane>

        {/* Analytics Tab */}
        <TabPane tab="Advanced Analytics" key="analytics">
          <Card title="Sales Trends">
            <Alert
              message="Advanced Analytics Coming Soon"
              description="Detailed charts, trends analysis, and performance insights will be available in the next update."
              type="info"
              showIcon
            />

            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <PieChartOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: 16 }} />
              <Title level={4} type="secondary">
                Advanced Analytics Dashboard
              </Title>
              <Text type="secondary">
                Visual charts, trend analysis, and detailed performance metrics
              </Text>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default AnalyticsTargets;
