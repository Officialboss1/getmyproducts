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
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/adminApi';

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
  const [activitySettings, setActivitySettings] = useState({ salespersonActiveDays: 30, customerActiveDays: 30 });
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
      if (!sanitizedSystem.targetAchievement && sanitizedSystem.activeSalespersons > 0) {
        const totalTargets = sanitizedSystem.activeSalespersons * 900; // default monthly target
        sanitizedSystem.targetAchievement = totalTargets > 0
          ? Number(((sanitizedSystem.totalSales / totalTargets) * 100).toFixed(1))
          : 0;
      }

      setSystemData(sanitizedSystem);

      // Normalize leaderboard items to include rank, sales and percentage
      const rawPerformers = performersResponse.data || [];
      const performers = (Array.isArray(rawPerformers) ? rawPerformers : [])
        .slice(0, 5)
        .map((item, idx) => {
          const totalUnits = item.totalUnits ?? item.totalUnits ?? 0;
          const userId = item.userId || item._id || (item.user && item.user._id) || null;
          const name =
            item.name || (item.user ? `${item.user.firstName} ${item.user.lastName}` : "Unknown");
          // Prefer backend-provided target/percentage when available, otherwise fall back
          const target = item.target ?? 900; // default monthly target
          const percentage = target > 0 ? Math.min(100, Math.round((totalUnits / target) * 100)) : 0;

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

      // Debug: log server responses to help diagnose mapping issues
      console.debug('Dashboard analytics response:', analyticsResponse.data);
      console.debug('Dashboard performers response:', performersResponse.data);
      console.debug('Dashboard activities response:', activitiesResponse.data);
      console.debug('Dashboard health response:', healthResponse.data);

      // Normalize recent activities into { id, user, action, time }
      const rawActivities = activitiesResponse.data || [];
      const activities = (Array.isArray(rawActivities) ? rawActivities : [])
        .slice(0, 10)
        .map((a) => {
          // editor_user_id is populated in backend; fallback to actor or user
          const editor = a.editor_user_id || a.actor || (a.user && (a.user.firstName || a.user.lastName) ? a.user : null) || null;
          const user = editor
            ? `${editor.firstName || ''} ${editor.lastName || ''}`.trim() || editor.email || 'Unknown'
            : a.user || a.userName || 'Unknown';

          const action = a.action_type || a.action || a.message || a.actionType || 'Updated';

          const timeRaw = a.createdAt || a.timestamp || a.date || a.time || a.timestamp || null;
          const time = timeRaw ? new Date(timeRaw).toLocaleString() : '';

          const saleInfo = a.sale_id ? ` (${a.sale_id.receiver_email || ''})` : '';

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
      console.error('❌ Error fetching dashboard data:', err);
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
        console.debug('Could not load activity settings', e?.message || e);
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
        <Progress percent={record.percentage ?? 0} size="small" style={{ width: 120 }} />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* === HEADER === */}
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
            <Button type="primary" onClick={() => navigate('/analytics')}>
              Detailed Analytics
            </Button>
          </Space>
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
                <Col xs={24} sm={12} lg={8} xl={4} key={`kpi-${card.title.toLowerCase().replace(/\s+/g, '-')}`}>
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
                            systemData.monthlyGrowth >= 0
                              ? 'success'
                              : 'danger'
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
                    <Button type="link" onClick={() => { activityForm.setFieldsValue(activitySettings); setActivityModalVisible(true); }}>
                      Edit
                    </Button>
                  }
                >
                  <div>
                    <Text strong>Salesperson active window:</Text> {activitySettings.salespersonActiveDays} days
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Text strong>Customer active window:</Text> {activitySettings.customerActiveDays} days
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
                  if (payload && (payload.salespersonActiveDays || payload.customerActiveDays)) {
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
                    console.debug('Could not refresh activity settings after save', e?.message || e);
                  }
                  fetchDashboardData();
                } catch (err) {
                  hide();
                  setSavingActivity(false);
                  console.error('Failed to save activity settings', err);
                  message.error(err?.response?.data?.message || err?.message || 'Failed to save activity settings');
                }
              }}
            >
              <Form form={activityForm} layout="vertical" initialValues={activitySettings}>
                <Form.Item name="salespersonActiveDays" label="Salesperson active (days)" rules={[{ required: true, type: 'number', min: 1 }] }>
                  <InputNumber min={1} />
                </Form.Item>
                <Form.Item name="customerActiveDays" label="Customer active (days)" rules={[{ required: true, type: 'number', min: 1 }] }>
                  <InputNumber min={1} />
                </Form.Item>
              </Form>
            </Modal>

            {/* === QUICK ACTIONS === */}
            <Card title="Quick Actions" style={{ marginTop: 24 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                  <Card
                    hoverable
                    onClick={() => navigate('/salespersons')}
                    style={{ textAlign: 'center' }}
                  >
                    <TeamOutlined
                      style={{
                        fontSize: 32,
                        color: '#1890ff',
                        marginBottom: 8,
                      }}
                    />
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
                    <BarChartOutlined
                      style={{
                        fontSize: 32,
                        color: '#52c41a',
                        marginBottom: 8,
                      }}
                    />
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
                    <TrophyOutlined
                      style={{
                        fontSize: 32,
                        color: '#faad14',
                        marginBottom: 8,
                      }}
                    />
                    <Title level={5}>Create Competition</Title>
                    <Text type="secondary">
                      Launch new sales competition
                    </Text>
                  </Card>
                </Col>
              </Row>
            </Card>

            {/* === SYSTEM HEALTH === */}
            <Card title="System Health" style={{ marginTop: 24 }}>
              <Row gutter={16}>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={systemHealth.api}
                    format={(p) => `API ${p}%`}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Text strong>API Status</Text>
                  </div>
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={systemHealth.db}
                    format={(p) => `DB ${p}%`}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Text strong>Database</Text>
                  </div>
                </Col>
                <Col span={8} style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={systemHealth.cache}
                    format={(p) => `Cache ${p}%`}
                  />
                  <div style={{ marginTop: 8 }}>
                    <Text strong>Cache</Text>
                  </div>
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
