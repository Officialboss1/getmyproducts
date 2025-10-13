import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Table,
  Tag,
  Typography,
  Space,
  Badge,
  Alert,
  Spin,
  message,
  Button,
  Tooltip,
  Row,
  Col,
  Statistic,
  Progress,
} from 'antd';
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ShoppingOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  ReloadOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { useUser } from '../../contexts/App';
import { adminAPI } from '../../api/services/adminApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const OrderTracking = () => {
  const [activeOrders, setActiveOrders] = useState([]);
  const [expiredOrders, setExpiredOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const { user } = useUser();

  // Load orders based on status
  const loadOrders = async (status) => {
    try {
      setLoading(true);
      const response = await adminAPI.getSalespersonOrders(status);
      const orders = response.data.orders || [];

      switch (status) {
        case 'active':
          setActiveOrders(orders);
          break;
        case 'expired':
          setExpiredOrders(orders);
          break;
        case 'cancelled':
          setCancelledOrders(orders);
          break;
        case 'completed':
          setCompletedOrders(orders);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error loading ${status} orders:`, error);
      message.error(`Failed to load ${status} orders`);
    } finally {
      setLoading(false);
    }
  };

  // Copy email to clipboard
  const copyEmail = (email) => {
    navigator.clipboard.writeText(email).then(() => {
      message.success('Email copied to clipboard');
    }).catch(() => {
      message.error('Failed to copy email');
    });
  };

  // Load all orders on component mount
  useEffect(() => {
    loadOrders('active');
    loadOrders('expired');
    loadOrders('cancelled');
    loadOrders('completed');
  }, []);

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Refresh current tab data
  const refreshCurrentTab = () => {
    loadOrders(activeTab);
  };

  // Calculate time remaining for active orders
  const getTimeRemaining = (endDate) => {
    const now = dayjs();
    const end = dayjs(endDate);
    const diff = end.diff(now, 'hour');

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / 24);
    const hours = diff % 24;

    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    }
    return `${hours}h remaining`;
  };

  // Get progress percentage for active orders
  const getProgressPercentage = (startDate, endDate) => {
    const now = dayjs();
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    const total = end.diff(start, 'hour');
    const elapsed = now.diff(start, 'hour');

    if (elapsed >= total) return 100;
    return Math.round((elapsed / total) * 100);
  };

  // Table columns
  const getColumns = (status) => [
    {
      title: 'Customer',
      dataIndex: 'customer_email',
      key: 'customer_email',
      render: (email) => (
        <Space>
          <UserOutlined />
          <Text strong>{email}</Text>
          <Tooltip title="Copy email">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => copyEmail(email)}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Order Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? dayjs(date).format('MMM D, YYYY HH:mm') : 'N/A',
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      render: (product) => (
        <Space>
          <ShoppingOutlined />
          <div>
            <Text strong>{product?.name || 'N/A'}</Text>
            <br />
            <Text type="secondary">${product?.current_price || 0}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'hours_duration',
      key: 'hours_duration',
      render: (hours) => `${hours} hours`,
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount, record) => {
        // Display the product's current price as total amount
        const productPrice = record.product?.current_price || 0;
        return (
          <Space>
            <DollarOutlined />
            <Text strong>${productPrice?.toFixed(2)}</Text>
          </Space>
        );
      },
    },
    {
      title: status === 'active' ? 'Time Remaining' : 'End Date',
      key: 'time_info',
      render: (_, record) => {
        if (status === 'active') {
          const timeRemaining = getTimeRemaining(record.end_date);
          const progress = getProgressPercentage(record.start_date, record.end_date);
          const isExpired = dayjs(record.end_date).isBefore(dayjs());

          return (
            <div>
              <Text type={isExpired ? 'danger' : 'default'}>
                {timeRemaining}
              </Text>
              <Progress
                percent={progress}
                size="small"
                status={isExpired ? 'exception' : progress > 80 ? 'warning' : 'active'}
                showInfo={false}
                style={{ marginTop: 4 }}
              />
            </div>
          );
        }

        return (
          <Space direction="vertical" size={0}>
            <Text>{dayjs(record.end_date).format('MMM D, YYYY')}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {dayjs(record.end_date).format('HH:mm')}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date) => date ? dayjs(date).format('MMM D, YYYY HH:mm') : 'N/A',
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (notes) => notes ? (
        <Tooltip title={notes}>
          <Text>{notes.length > 30 ? `${notes.substring(0, 30)}...` : notes}</Text>
        </Tooltip>
      ) : (
        <Text type="secondary">No notes</Text>
      ),
    },
  ];

  // Get status tag
  const getStatusTag = (status) => {
    const statusConfig = {
      active: { color: 'green', icon: <CheckCircleOutlined />, text: 'Active' },
      expired: { color: 'orange', icon: <ExclamationCircleOutlined />, text: 'Expired' },
      cancelled: { color: 'red', icon: <CloseCircleOutlined />, text: 'Cancelled' },
      completed: { color: 'blue', icon: <CheckCircleOutlined />, text: 'Completed' },
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <Tag color={config.color}>
        {config.icon}
        {config.text}
      </Tag>
    );
  };

  // Calculate statistics
  const stats = {
    active: activeOrders.length,
    expired: expiredOrders.length,
    cancelled: cancelledOrders.length,
    completed: completedOrders.length,
    totalRevenue: [...activeOrders, ...expiredOrders, ...cancelledOrders, ...completedOrders]
      .reduce((sum, order) => sum + (order.total_amount || 0), 0),
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <Row justify="space-between" align="middle" gutter={[16, 16]} className="mb-4 sm:mb-6">
        <Col xs={24} sm={24} md={12} lg={14} xl={16}>
          <Title level={2} className="text-lg sm:text-xl md:text-2xl lg:text-3xl m-0 mb-1 sm:mb-2">
            <ShoppingOutlined className="mr-2" /> Order Tracking
          </Title>
          <Text type="secondary" className="text-sm sm:text-base">
            Monitor active orders, track progress, and manage customer services
          </Text>
        </Col>
        <Col xs={24} sm={24} md={12} lg={10} xl={8}>
          <div className="flex justify-end">
            <Button
              icon={<ReloadOutlined />}
              onClick={refreshCurrentTab}
              loading={loading}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Refresh
            </Button>
          </div>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row gutter={[12, 16]} className="mb-4 sm:mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title={<span className="text-sm sm:text-base">Active Orders</span>}
              value={stats.active}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: '1.5rem sm:2rem' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title={<span className="text-sm sm:text-base">Expired Orders</span>}
              value={stats.expired}
              prefix={<ExclamationCircleOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontSize: '1.5rem sm:2rem' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title={<span className="text-sm sm:text-base">Cancelled Orders</span>}
              value={stats.cancelled}
              prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f', fontSize: '1.5rem sm:2rem' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="text-center">
            <Statistic
              title={<span className="text-sm sm:text-base">Total Revenue</span>}
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#1890ff', fontSize: '1.5rem sm:2rem' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Orders Tabs */}
      <Card className="overflow-hidden">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          className="text-sm sm:text-base"
          tabBarStyle={{ marginBottom: '16px' }}
        >
          <TabPane
            tab={
              <Badge count={stats.active} showZero>
                <Space className="text-xs sm:text-sm">
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span className="hidden sm:inline">Active Orders</span>
                  <span className="sm:hidden">Active</span>
                </Space>
              </Badge>
            }
            key="active"
          >
            <Table
              columns={getColumns('active')}
              dataSource={activeOrders}
              loading={loading}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} active orders`,
                className: "px-2 sm:px-4"
              }}
              scroll={{ x: 1000 }}
              locale={{ emptyText: 'No active orders' }}
              className="text-xs sm:text-sm"
            />
          </TabPane>

          <TabPane
            tab={
              <Badge count={stats.expired} showZero>
                <Space className="text-xs sm:text-sm">
                  <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
                  <span className="hidden sm:inline">Expired Orders</span>
                  <span className="sm:hidden">Expired</span>
                </Space>
              </Badge>
            }
            key="expired"
          >
            <Alert
              message={<span className="text-sm sm:text-base">Expired Orders Notice</span>}
              description={<span className="text-xs sm:text-sm">These orders have passed their end date and may require follow-up with customers.</span>}
              type="warning"
              showIcon
              className="mb-4"
            />
            <Table
              columns={getColumns('expired')}
              dataSource={expiredOrders}
              loading={loading}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} expired orders`,
                className: "px-2 sm:px-4"
              }}
              scroll={{ x: 1000 }}
              locale={{ emptyText: 'No expired orders' }}
              className="text-xs sm:text-sm"
            />
          </TabPane>

          <TabPane
            tab={
              <Badge count={stats.cancelled} showZero>
                <Space className="text-xs sm:text-sm">
                  <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                  <span className="hidden sm:inline">Cancelled Orders</span>
                  <span className="sm:hidden">Cancelled</span>
                </Space>
              </Badge>
            }
            key="cancelled"
          >
            <Table
              columns={getColumns('cancelled')}
              dataSource={cancelledOrders}
              loading={loading}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} cancelled orders`,
                className: "px-2 sm:px-4"
              }}
              scroll={{ x: 1000 }}
              locale={{ emptyText: 'No cancelled orders' }}
              className="text-xs sm:text-sm"
            />
          </TabPane>

          <TabPane
            tab={
              <Badge count={stats.completed} showZero>
                <Space className="text-xs sm:text-sm">
                  <CheckCircleOutlined style={{ color: '#1890ff' }} />
                  <span className="hidden sm:inline">Completed Orders</span>
                  <span className="sm:hidden">Completed</span>
                </Space>
              </Badge>
            }
            key="completed"
          >
            <Table
              columns={getColumns('completed')}
              dataSource={completedOrders}
              loading={loading}
              rowKey="_id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} completed orders`,
                className: "px-2 sm:px-4"
              }}
              scroll={{ x: 1000 }}
              locale={{ emptyText: 'No completed orders' }}
              className="text-xs sm:text-sm"
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default OrderTracking;