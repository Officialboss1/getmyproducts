import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  List,
  Tag,
  Space,
  Spin,
  Alert,
  Button,
  Typography,
  Divider,
} from "antd";
import {
  TrophyOutlined,
  TeamOutlined,
  ShoppingCartOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";

const { Title, Text } = Typography;

const SalespersonDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [dailyProgress, setDailyProgress] = useState({ current: 0, target: 30, percentage: 0 });
  const [weeklyProgress, setWeeklyProgress] = useState({ current: 0, target: 210, percentage: 0 });
  const [monthlyProgress, setMonthlyProgress] = useState({ current: 0, target: 900, percentage: 0 });
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch progress for each period

      // Only fetch sales for this user if salesperson, else fetch all
      let salesPromise;
      if (user && user.role === "salesperson") {
        salesPromise = api.get(`/sales?userId=${user._id}`);
      } else {
        salesPromise = api.get("/sales");
      }

      const [dailyProgressRes, weeklyProgressRes, monthlyProgressRes, targetsResponse, salesResponse, competitionsResponse] = await Promise.all([
        api.get("/analytics/progress?period=daily"),
        api.get("/analytics/progress?period=weekly"),
        api.get("/analytics/progress?period=monthly"),
        api.get("/targets"),
        salesPromise,
        api.get("/competitions"),
      ]);

      setDashboardData({
        progress: {
          daily: dailyProgressRes.data,
          weekly: weeklyProgressRes.data,
          monthly: monthlyProgressRes.data,
        },
        targets: targetsResponse.data,
        sales: salesResponse.data || [],
        competitions: competitionsResponse.data || [],
      });

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
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);


  const data = dashboardData || {
    progress: { daily: {}, weekly: {}, monthly: {} },
    targets: {},
    sales: [],
    competitions: [],
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "#52c41a";
    if (percentage >= 70) return "#faad14";
    return "#f5222d";
  };

  const getStatusTag = (percentage) => {
    if (percentage >= 100) return <Tag color="success">Target Achieved</Tag>;
    if (percentage >= 75) return <Tag color="processing">Great Progress</Tag>;
    if (percentage >= 50) return <Tag color="warning">Good Progress</Tag>;
    return <Tag color="error">Needs Boost</Tag>;
  };

  // Use backend-calculated progress for each period
  const monthlyPercentage = monthlyProgress.percentage;
  const recentSales = (data.sales || []).slice(0, 5);

  return (
    <div style={{ padding: "0 0px" }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
            Sales Dashboard
          </Title>
          <Text type="secondary">
            Welcome back, {user?.firstName}! Here's your performance overview.
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
              icon={<ShoppingCartOutlined />}
              onClick={() => navigate("/sales/add")}
            >
              Add New Sale
            </Button>
          </Space>
        </Col>
      </Row>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Spin spinning={loading}>
        {/* KPIs */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Monthly Sales"
                value={monthlyProgress.current}
                suffix={`/ ${monthlyProgress.target}`}
                valueStyle={{ color: "#1890ff" }}
              />
              <Progress
                percent={Math.round(monthlyProgress.percentage)}
                strokeColor={getProgressColor(monthlyProgress.percentage)}
                size="small"
                style={{ marginTop: 8 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={data.progress?.monthly?.totalRevenue || 0}
                prefix="₦"
                valueStyle={{ color: "#52c41a" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Referrals"
                value={data.progress?.referrals || 0}
                suffix={`/ ${data.targets?.requiredReferrals || 5}`}
                prefix={<TeamOutlined />}
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Progress */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={8}>
            <Card title="Daily Progress" extra={getStatusTag(dailyProgress.percentage)}>
              <Progress
                percent={Math.round(dailyProgress.percentage)}
                strokeColor={getProgressColor(dailyProgress.percentage)}
                size="large"
              />
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <Text strong>{dailyProgress.current}</Text>
                <Text type="secondary"> / {dailyProgress.target} units</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Weekly Progress" extra={getStatusTag(weeklyProgress.percentage)}>
              <Progress
                percent={Math.round(weeklyProgress.percentage)}
                strokeColor={getProgressColor(weeklyProgress.percentage)}
                size="large"
              />
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <Text strong>{weeklyProgress.current}</Text>
                <Text type="secondary"> / {weeklyProgress.target} units</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Monthly Progress" extra={getStatusTag(monthlyPercentage)}>
              <Progress
                percent={Math.round(monthlyPercentage)}
                strokeColor={getProgressColor(monthlyPercentage)}
                size="large"
              />
              <div style={{ marginTop: 8, textAlign: "center" }}>
                <Text strong>{monthlyProgress.current}</Text>
                <Text type="secondary"> / {monthlyProgress.target} units</Text>
              </div>
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Recent Sales */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title={<Space><ShoppingCartOutlined /> Recent Sales</Space>}
              extra={<Button type="link" onClick={() => navigate("/sales/history")}>View All</Button>}
            >
              <List
                dataSource={recentSales}
                renderItem={(sale) => {
                  // Try to get product name from populated product_id
                  let productName = '';
                  if (sale.product_id && typeof sale.product_id === 'object' && sale.product_id.name) {
                    productName = sale.product_id.name;
                  } else if (sale.product_name) {
                    productName = sale.product_name;
                  } else if (typeof sale.product_id === 'string') {
                    productName = sale.product_id;
                  } else {
                    productName = 'Unknown Product';
                  }
                  return (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<ShoppingCartOutlined style={{ color: "#1890ff" }} />}
                        title={`${sale.quantity_sold} units - ${productName}`}
                        description={new Date(sale.createdAt).toLocaleDateString()}
                      />
                      <Tag color="blue">₦{sale.total_amount}</Tag>
                    </List.Item>
                  );
                }}
                locale={{ emptyText: "No sales recorded yet" }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={<Space><TrophyOutlined /> Active Competitions</Space>}
              extra={<Button type="link" onClick={() => navigate("/competitions")}>View All</Button>}
            >
              <List
                dataSource={data.competitions}
                renderItem={(competition) => (
                  <List.Item>
                    <List.Item.Meta
                      title={competition.name}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">{competition.description}</Text>
                          <Text type="secondary">
                            Ends: {new Date(competition.endDate).toLocaleDateString()}
                          </Text>
                        </Space>
                      }
                    />
                    <Tag color={competition.isActive ? "green" : "default"}>
                      {competition.isActive ? "Active" : "Ended"}
                    </Tag>
                  </List.Item>
                )}
                locale={{ emptyText: "No active competitions" }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default SalespersonDashboard;
