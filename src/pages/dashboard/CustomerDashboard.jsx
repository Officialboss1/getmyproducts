import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  List,
  Typography,
  Space,
  Tag,
  Button,
  Alert,
  Spin,
} from 'antd';
import {
  ShoppingCartOutlined,
  GiftOutlined,
  TagOutlined,
  UserOutlined,
  BellOutlined,
  EyeOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const CustomerDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await customerAPI.getCustomerDashboard(user._id);

      // Mock data for demonstration
      const mockDashboardData = {
        totalPurchases: 15,
        totalSpent: 4500,
        rewardPoints: 1250,
        activeOffers: 3,
        referrer: {
          name: 'John Doe',
          email: 'john.doe@sales.com',
          team: 'North Region',
        },
        recentPurchases: [
          {
            id: 1,
            product: 'iPhone 15',
            price: 999,
            date: '2025-10-01',
            status: 'delivered',
          },
          {
            id: 2,
            product: 'AirPods Pro',
            price: 249,
            date: '2025-09-28',
            status: 'delivered',
          },
          {
            id: 3,
            product: 'MacBook Case',
            price: 49,
            date: '2025-09-25',
            status: 'shipped',
          },
        ],
      };

      const mockNotifications = [
        {
          id: 1,
          title: 'New Offer Available',
          message: 'Get 20% off on your next purchase',
          date: '2025-10-02',
          read: false,
        },
        {
          id: 2,
          title: 'Reward Points Added',
          message: 'You earned 50 points from your recent purchase',
          date: '2025-10-01',
          read: true,
        },
        {
          id: 3,
          title: 'Order Shipped',
          message: 'Your MacBook Case has been shipped',
          date: '2025-09-26',
          read: true,
        },
      ];

      setDashboardData(mockDashboardData);
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpiCards = [
    {
      title: 'Total Purchases',
      value: dashboardData?.totalPurchases || 0,
      icon: <ShoppingCartOutlined />,
      color: '#1890ff',
      suffix: 'orders',
    },
    {
      title: 'Total Spent',
      value: dashboardData?.totalSpent || 0,
      icon: <TagOutlined />,
      color: '#52c41a',
      prefix: '₦',
    },
    {
      title: 'Reward Points',
      value: dashboardData?.rewardPoints || 0,
      icon: <GiftOutlined />,
      color: '#faad14',
      suffix: 'points',
    },
    {
      title: 'Active Offers',
      value: dashboardData?.activeOffers || 0,
      icon: <TagOutlined />,
      color: '#722ed1',
    },
  ];

  const getStatusTag = (status) => {
    const statusConfig = {
      delivered: { color: 'success', text: 'Delivered' },
      shipped: { color: 'processing', text: 'Shipped' },
      processing: { color: 'warning', text: 'Processing' },
      cancelled: { color: 'error', text: 'Cancelled' },
    };
    const config = statusConfig[status] || statusConfig.processing;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            Customer Dashboard
          </Title>
          <Text type="secondary">
            Welcome back, {user?.firstName}! Here's your overview.
          </Text>
        </Col>
      </Row>

      <Spin spinning={loading}>
        {/* KPI Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {kpiCards.map((card, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card>
                <Statistic
                  title={card.title}
                  value={card.value}
                  prefix={card.prefix}
                  suffix={card.suffix}
                  valueStyle={{ color: card.color }}
                />
                <div
                  style={{ marginTop: 8, fontSize: '20px', color: card.color }}
                >
                  {card.icon}
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[24, 24]}>
          {/* Referral Information */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <UserOutlined />
                  Referral Information
                </Space>
              }
            >
              {dashboardData?.referrer ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Referred by:</Text>
                  <div
                    style={{
                      padding: '12px',
                      background: '#f5f5f5',
                      borderRadius: '6px',
                    }}
                  >
                    <Text strong>{dashboardData.referrer.name}</Text>
                    <br />
                    <Text type="secondary">{dashboardData.referrer.email}</Text>
                    <br />
                    <Tag color="blue">{dashboardData.referrer.team}</Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    You were referred by this salesperson. Thank them for
                    introducing you to our services!
                  </Text>
                </Space>
              ) : (
                <Alert
                  message="No Referral"
                  description="You were not referred by any salesperson."
                  type="info"
                  showIcon
                />
              )}
            </Card>

            {/* Quick Actions */}
            <Card title="Quick Actions" style={{ marginTop: 16 }}>
              <Space
                direction="vertical"
                style={{ width: '100%' }}
                size="middle"
              >
                <Button
                  type="primary"
                  block
                  onClick={() => navigate('/customer/purchases')}
                >
                  View Purchase History
                </Button>
                <Button block onClick={() => navigate('/customer/rewards')}>
                  Redeem Rewards
                </Button>
                <Button block onClick={() => navigate('/customer/support')}>
                  Get Support
                </Button>
              </Space>
            </Card>
          </Col>

          {/* Recent Purchases */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <ShoppingCartOutlined />
                  Recent Purchases
                </Space>
              }
              extra={
                <Button
                  type="link"
                  onClick={() => navigate('/customer/purchases')}
                >
                  View All
                </Button>
              }
            >
              <List
                dataSource={dashboardData?.recentPurchases?.slice(0, 3) || []}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/customer/purchases`)}
                      >
                        View
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={item.product}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">${item.price}</Text>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {new Date(item.date).toLocaleDateString()}
                          </Text>
                        </Space>
                      }
                    />
                    {getStatusTag(item.status)}
                  </List.Item>
                )}
                locale={{ emptyText: 'No recent purchases' }}
              />
            </Card>
          </Col>

          {/* Notifications */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <Space>
                  <BellOutlined />
                  Recent Notifications
                  <Tag color="blue">
                    {notifications.filter((n) => !n.read).length}
                  </Tag>
                </Space>
              }
              extra={
                <Button
                  type="link"
                  onClick={() => navigate('/customer/notifications')}
                >
                  View All
                </Button>
              }
            >
              <List
                dataSource={notifications.slice(0, 3)}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text>{item.title}</Text>
                          {!item.read && (
                            <Tag color="red" size="small">
                              New
                            </Tag>
                          )}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {item.message}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {new Date(item.date).toLocaleDateString()}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No notifications' }}
              />
            </Card>

            {/* Active Offers */}
            <Card title="Active Offers" style={{ marginTop: 16 }}>
              <Space
                direction="vertical"
                style={{ width: '100%' }}
                size="middle"
              >
                <Alert
                  message="20% Off Next Purchase"
                  description="Use code: WELCOME20"
                  type="info"
                  showIcon
                />
                <Alert
                  message="Free Shipping"
                  description="On orders over $100"
                  type="success"
                  showIcon
                />
                <Button
                  type="link"
                  onClick={() => navigate('/customer/rewards')}
                  style={{ padding: 0 }}
                >
                  View All Offers <ArrowRightOutlined />
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default CustomerDashboard;
