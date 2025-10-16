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
  List,
  Modal,
  Form,
  InputNumber,
  message,
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
  ShoppingOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/services/adminApi';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === Dashboard State ===
  const [systemData, setSystemData] = useState({
    totalSales: 0,
    totalRevenue: 0,
    activeSalespersons: 0,
    activeCustomers: 0,
    ongoingCompetitions: 0,
    monthlyGrowth: 0,
    targetAchievement: 0,
  });
  const [topPerformers, setTopPerformers] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [systemHealth, setSystemHealth] = useState({ api: 0, db: 0, cache: 0 });
  const [activitySettings, setActivitySettings] = useState({
    salespersonActiveDays: 30,
    customerActiveDays: 30,
  });
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [activityForm] = Form.useForm();
  const [savingActivity, setSavingActivity] = useState(false);

  // === Fetch Dashboard Data ===
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        analyticsResponse,
        performersResponse,
        activitiesResponse,
        healthResponse,
      ] = await Promise.all([
        // 🧩 1. System Analytics
        adminAPI.getSystemAnalytics(),
        // 🧩 2. Top Performers
        adminAPI.getLeaderboard({ limit: 5 }),
        // 🧩 3. Recent Activities
        adminAPI.getRecentActivities({ limit: 5 }),
        // 🧩 4. System Health
        adminAPI.getSystemHealth(),
      ]);

      // Sanitize system analytics values to ensure numbers and sensible defaults
      const rawSystem = analyticsResponse.data || {};
      const sanitizedSystem = {
        totalSales: Number(rawSystem.totalSales ?? 0),
        totalRevenue: Number(rawSystem.totalRevenue ?? 0),
        activeSalespersons: Number(rawSystem.activeSalespersons ?? 0),
        activeCustomers: Number(rawSystem.activeCustomers ?? 0),
        ongoingCompetitions: Number(rawSystem.ongoingCompetitions ?? 0),
        monthlyGrowth: Number(rawSystem.monthlyGrowth ?? 0),
        targetAchievement: Number(rawSystem.targetAchievement ?? 0),
      };

      // Fallback: if backend didn't provide targetAchievement, compute an estimate
      if (
        !sanitizedSystem.targetAchievement &&
        sanitizedSystem.activeSalespersons > 0
      ) {
        const totalTargets = sanitizedSystem.activeSalespersons * 900; // default monthly target
        sanitizedSystem.targetAchievement =
          totalTargets > 0
            ? Number(
                ((sanitizedSystem.totalSales / totalTargets) * 100).toFixed(1)
              )
            : 0;
      }

      setSystemData(sanitizedSystem);

      // Normalize leaderboard items to include rank, sales and percentage
      const rawPerformers = performersResponse.data || [];
      const performers = (Array.isArray(rawPerformers) ? rawPerformers : [])
        .slice(0, 5)
        .map((item, idx) => {
          const totalUnits = item.totalUnits ?? item.totalUnits ?? 0;
          const userId =
            item.userId || item._id || (item.user && item.user._id) || null;
          const name =
            item.name ||
            (item.user
              ? `${item.user.firstName} ${item.user.lastName}`
              : 'Unknown');
          // Prefer backend-provided target/percentage when available, otherwise fall back
          const target = item.target ?? 900; // default monthly target
          const percentage =
            target > 0
              ? Math.min(100, Math.round((totalUnits / target) * 100))
              : 0;

          return {
            rank: idx + 1,
            userId,
            id: userId,
            name,
            sales: totalUnits,
            revenue: item.totalRevenue ?? 0,
            percentage,
          };
        });

      setTopPerformers(performers);

      // Removed console.debug for security - sensitive API response data

      // Normalize recent activities into { id, user, action, time }
      const rawActivities = activitiesResponse.data || [];
      const activities = (Array.isArray(rawActivities) ? rawActivities : [])
        .slice(0, 10)
        .map((a) => {
          // editor_user_id is populated in backend; fallback to actor or user
          const editor =
            a.editor_user_id ||
            a.actor ||
            (a.user && (a.user.firstName || a.user.lastName) ? a.user : null) ||
            null;
          const user = editor
            ? `${editor.firstName || ''} ${editor.lastName || ''}`.trim() ||
              editor.email ||
              'Unknown'
            : a.user || a.userName || 'Unknown';

          const action =
            a.action_type || a.action || a.message || a.actionType || 'Updated';

          const timeRaw =
            a.createdAt ||
            a.timestamp ||
            a.date ||
            a.time ||
            a.timestamp ||
            null;
          const time = timeRaw ? new Date(timeRaw).toLocaleString() : '';

          const saleInfo = a.sale_id
            ? ` (${a.sale_id.receiver_email || ''})`
            : '';

          return {
            id: a._id || a.id || Math.random().toString(36).slice(2, 9),
            user,
            action: `${action}${saleInfo}`,
            time,
            raw: a,
          };
        });

      setRecentActivities(activities);

      // Map system health from backend shape to percent values used by UI
      const rawHealth = healthResponse.data || {};
      const mappedHealth = {
        api: rawHealth.status === 'OK' ? 100 : 0,
        db: rawHealth.dbStatus === 'Connected' ? 100 : 0,
        cache: Number(rawHealth.cache ?? 0),
        uptime: rawHealth.uptime || rawHealth.uptimeSeconds || null,
        memoryUsage: rawHealth.memoryUsage || null,
      };
      setSystemHealth(mappedHealth);
    } catch (err) {
      // Removed console.error for security - error details logged server-side
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Load activity settings for UI
    (async () => {
      try {
        const resp = await adminAPI.getActivitySettings();
        if (resp?.data) setActivitySettings(resp.data);
      } catch (e) {
        // Removed console.debug for security - error details logged server-side
      }
    })();
  }, []);

  // === KPI Cards ===
  const kpiCards = [
    {
      title: 'Total Sales',
      value: systemData.totalSales,
      prefix: <ShoppingCartOutlined />,
      valueStyle: { color: '#1890ff' },
      suffix: ' units',
    },
    {
      title: 'Total Revenue',
      value: systemData.totalRevenue,
      prefix: <DollarOutlined />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Active Salespersons',
      value: systemData.activeSalespersons,
      prefix: <TeamOutlined />,
      valueStyle: { color: '#722ed1' },
    },
    {
      title: 'Active Customers',
      value: systemData.activeCustomers,
      prefix: <UserOutlined />,
      valueStyle: { color: '#fa8c16' },
    },
    {
      title: 'Ongoing Competitions',
      value: systemData.ongoingCompetitions,
      prefix: <TrophyOutlined />,
      valueStyle: { color: '#13c2c2' },
    },
    {
      title: 'Target Achievement',
      value: systemData.targetAchievement,
      suffix: '%',
      valueStyle: {
        color: systemData.targetAchievement > 75 ? '#52c41a' : '#faad14',
      },
    },
  ];

  // === Top Performers Table ===
  const topPerformersColumns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      render: (rank) => (
        <Tag
          color={
            rank === 1
              ? 'gold'
              : rank === 2
                ? 'silver'
                : rank === 3
                  ? 'volcano'
                  : 'default'
          }
        >
          #{rank}
        </Tag>
      ),
    },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Sales',
      dataIndex: 'sales',
      key: 'sales',
      align: 'center',
      render: (value) => <Text strong>{value}</Text>,
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (_, record) => (
        <Progress
          percent={record.percentage ?? 0}
          size="small"
          style={{ width: 120 }}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* === HEADER === */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Title level={2} style={{ margin: 0 }}>
            <BarChartOutlined /> Admin Dashboard
          </Title>
          <Text type="secondary">
            Overview of your sales team performance and system analytics
          </Text>
        </Col>
        <Col xs={24} md={12}>
          <Row justify="end" gutter={[8, 8]}>
            <Col xs={12} sm={10}>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchDashboardData}
                loading={loading}
                block
              >
                Refresh
              </Button>
            </Col>
            <Col xs={12} sm={14}>
              <Button
                type="primary"
                onClick={() => navigate('/analytics')}
                block
              >
                Detailed Analytics
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* === MAIN CONTENT === */}
      <Spin spinning={loading} size="large">
        {error ? (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            action={
              <Button size="small" danger onClick={fetchDashboardData}>
                Retry
              </Button>
            }
          />
        ) : (
          <>
            {/* === KPI CARDS === */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              {kpiCards.map((card, index) => (
                <Col
                  xs={24}
                  sm={12}
                  lg={8}
                  xl={4}
                  key={`kpi-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
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
                        <Text
                          type={
                            systemData.monthlyGrowth >= 0 ? 'success' : 'danger'
                          }
                        >
                          {systemData.monthlyGrowth >= 0 ? (
                            <ArrowUpOutlined />
                          ) : (
                            <ArrowDownOutlined />
                          )}
                          {Math.abs(systemData.monthlyGrowth)}% from last month
                        </Text>
                      </div>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>

            {/* === PERFORMANCE & ACTIVITIES === */}
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <UserOutlined /> Activity Settings
                    </Space>
                  }
                  extra={
                    <Button
                      type="link"
                      onClick={() => {
                        activityForm.setFieldsValue(activitySettings);
                        setActivityModalVisible(true);
                      }}
                    >
                      Edit
                    </Button>
                  }
                >
                  <div>
                    <Text strong>Salesperson active window:</Text>{' '}
                    {activitySettings.salespersonActiveDays} days
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text strong>Customer active window:</Text>{' '}
                    {activitySettings.customerActiveDays} days
                  </div>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <TrophyOutlined /> Top Performers
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
                    rowKey={(r) => r.userId || r.id || r._id || r.name}
                    scroll={{ x: 400 }}
                    locale={{ emptyText: 'No performance data available' }}
                  />
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card
                  title={
                    <Space>
                      <EyeOutlined /> Recent Activities
                    </Space>
                  }
                  extra={
                    <Button type="link" onClick={() => navigate('/audit')}>
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
                              <Text
                                type="secondary"
                                style={{ fontSize: '12px' }}
                              >
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

            <Modal
              title="Edit Activity Settings"
              open={activityModalVisible}
              onCancel={() => setActivityModalVisible(false)}
              okButtonProps={{ loading: savingActivity }}
              onOk={async () => {
                const hide = message.loading('Saving activity settings...', 0);
                try {
                  const values = await activityForm.validateFields();
                  setSavingActivity(true);
                  const resp = await adminAPI.updateActivitySettings(values);
                  setSavingActivity(false);
                  hide();

                  const data = resp?.data || {};
                  const payload = data.activity || data;
                  // If backend returned wrapper { message, activity }, unwrap it
                  if (
                    payload &&
                    (payload.salespersonActiveDays ||
                      payload.customerActiveDays)
                  ) {
                    setActivitySettings(payload);
                  } else {
                    // fallback to sent values
                    setActivitySettings(values);
                  }

                  message.success('Activity settings saved');
                  setActivityModalVisible(false);
                  // re-fetch settings and dashboard numbers
                  try {
                    const refreshed = await adminAPI.getActivitySettings();
                    if (refreshed?.data) setActivitySettings(refreshed.data);
                  } catch (e) {
                    // Removed console.debug for security - error details logged server-side
                  }
                  fetchDashboardData();
                } catch (err) {
                  hide();
                  setSavingActivity(false);
                  // Removed console.error for security - error details logged server-side
                  message.error(
                    err?.response?.data?.message ||
                      err?.message ||
                      'Failed to save activity settings'
                  );
                }
              }}
            >
              <Form
                form={activityForm}
                layout="vertical"
                initialValues={activitySettings}
              >
                <Form.Item
                  name="salespersonActiveDays"
                  label="Salesperson active (days)"
                  rules={[{ required: true, type: 'number', min: 1 }]}
                >
                  <InputNumber min={1} />
                </Form.Item>
                <Form.Item
                  name="customerActiveDays"
                  label="Customer active (days)"
                  rules={[{ required: true, type: 'number', min: 1 }]}
                >
                  <InputNumber min={1} />
                </Form.Item>
              </Form>
            </Modal>

            {/* === QUICK ACTIONS === */}
            <Card title="Quick Actions" style={{ marginTop: 24 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={6}>
                  <Card
                    hoverable
                    onClick={() => navigate('/salespersons')}
                    style={{ textAlign: 'center', minHeight: 120 }}
                    styles={{ body: { padding: '16px' } }}
                  >
                    <TeamOutlined
                      style={{
                        fontSize: 28,
                        color: '#1890ff',
                        marginBottom: 12,
                      }}
                    />
                    <Title level={5} style={{ marginBottom: 4 }}>
                      Manage Sales Team
                    </Title>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      View and manage salespersons
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card
                    hoverable
                    onClick={() => navigate('/products')}
                    style={{ textAlign: 'center', minHeight: 120 }}
                    styles={{ body: { padding: '16px' } }}
                  >
                    <ShoppingOutlined
                      style={{
                        fontSize: 28,
                        color: '#722ed1',
                        marginBottom: 12,
                      }}
                    />
                    <Title level={5} style={{ marginBottom: 4 }}>
                      Manage Products
                    </Title>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      Create and manage products
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card
                    hoverable
                    onClick={() => navigate('/orders')}
                    style={{ textAlign: 'center', minHeight: 120 }}
                    styles={{ body: { padding: '16px' } }}
                  >
                    <FileTextOutlined
                      style={{
                        fontSize: 28,
                        color: '#fa541c',
                        marginBottom: 12,
                      }}
                    />
                    <Title level={5} style={{ marginBottom: 4 }}>
                      Manage Orders
                    </Title>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      View and manage customer orders
                    </Text>
                  </Card>
                </Col>
                <Col xs={24} sm={6}>
                  <Card
                    hoverable
                    onClick={() => navigate('/targets')}
                    style={{ textAlign: 'center', minHeight: 120 }}
                    styles={{ body: { padding: '16px' } }}
                  >
                    <BarChartOutlined
                      style={{
                        fontSize: 28,
                        color: '#52c41a',
                        marginBottom: 12,
                      }}
                    />
                    <Title level={5} style={{ marginBottom: 4 }}>
                      Set Targets
                    </Title>
                    <Text type="secondary" style={{ fontSize: '13px' }}>
                      Configure sales targets
                    </Text>
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* === SYSTEM HEALTH === */}
            <Card title="System Health" style={{ marginTop: 24 }}>
              <Row gutter={[16, 24]}>
                <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Progress
                      type="circle"
                      percent={systemHealth.api}
                      format={(p) => `API ${p}%`}
                      size={80}
                    />
                  </div>
                  <Text strong style={{ fontSize: '14px' }}>
                    API Status
                  </Text>
                </Col>
                <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Progress
                      type="circle"
                      percent={systemHealth.db}
                      format={(p) => `DB ${p}%`}
                      size={80}
                    />
                  </div>
                  <Text strong style={{ fontSize: '14px' }}>
                    Database
                  </Text>
                </Col>
                <Col xs={24} sm={8} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginBottom: 8,
                    }}
                  >
                    <Progress
                      type="circle"
                      percent={systemHealth.cache}
                      format={(p) => `Cache ${p}%`}
                      size={80}
                    />
                  </div>
                  <Text strong style={{ fontSize: '14px' }}>
                    Cache
                  </Text>
                </Col>
              </Row>
            </Card>
          </>
        )}
      </Spin>
    </div>
  );
};

export default AdminDashboard;



