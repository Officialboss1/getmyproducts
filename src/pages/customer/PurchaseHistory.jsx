import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  DatePicker,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Descriptions,
  Modal,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  DownloadOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useCustomerPurchases } from '../../hooks/useCustomerPurchases';
// dayjs isn't used in this file yet
// import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const PurchaseHistory = ({ user }) => {
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderModalVisible, setOrderModalVisible] = useState(false);

  const { purchases, loading, error, refetch } = useCustomerPurchases(
    user?._id
  );

  // Mock data - replace with actual API data
  const mockPurchases = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      product: 'iPhone 15 Pro',
      price: 999,
      quantity: 1,
      total: 999,
      date: '2025-10-02',
      status: 'delivered',
      trackingNumber: 'TRK123456789',
      shippingAddress: '123 Main St, New York, NY 10001',
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      product: 'AirPods Pro',
      price: 249,
      quantity: 1,
      total: 249,
      date: '2025-09-28',
      status: 'delivered',
      trackingNumber: 'TRK123456788',
      shippingAddress: '123 Main St, New York, NY 10001',
    },
    {
      id: '3',
      orderNumber: 'ORD-003',
      product: 'MacBook Case',
      price: 49,
      quantity: 2,
      total: 98,
      date: '2025-09-25',
      status: 'shipped',
      trackingNumber: 'TRK123456787',
      shippingAddress: '123 Main St, New York, NY 10001',
    },
    {
      id: '4',
      orderNumber: 'ORD-004',
      product: 'Apple Watch Series 9',
      price: 399,
      quantity: 1,
      total: 399,
      date: '2025-09-20',
      status: 'processing',
      trackingNumber: null,
      shippingAddress: '123 Main St, New York, NY 10001',
    },
  ];

  const data = purchases.length > 0 ? purchases : mockPurchases;

  const stats = {
    totalOrders: data.length,
    totalSpent: data.reduce((sum, order) => sum + order.total, 0),
    deliveredOrders: data.filter((order) => order.status === 'delivered')
      .length,
    averageOrder:
      data.reduce((sum, order) => sum + order.total, 0) / data.length,
  };

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

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderModalVisible(true);
  };

  const filteredData = data.filter(
    (order) =>
      order.product?.toLowerCase().includes(searchText.toLowerCase()) ||
      order.orderNumber?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => <Text strong>${total}</Text>,
      align: 'right',
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Delivered', value: 'delivered' },
        { text: 'Shipped', value: 'shipped' },
        { text: 'Processing', value: 'processing' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showOrderDetails(record)}
          >
            Details
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <ShoppingCartOutlined /> Purchase History
          </Title>
          <Text type="secondary">
            View your order history and track current orders
          </Text>
        </Col>
        <Col>
          <Button icon={<DownloadOutlined />}>Export History</Button>
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Orders"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Spent"
              value={stats.totalSpent}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
              //   prefix="₦"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Delivered Orders"
              value={stats.deliveredOrders}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Average Order"
              value={Math.round(stats.averageOrder)}
              prefix="$"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Search by product or order number..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Filter by status"
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">All Status</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="shipped">Shipped</Option>
              <Option value="processing">Processing</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={setDateRange}
              placeholder={['Start Date', 'End Date']}
            />
          </Col>
          <Col xs={24} md={4}>
            <Button icon={<FilterOutlined />} style={{ width: '100%' }}>
              Apply Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} orders`,
          }}
        />
      </Card>

      {/* Order Details Modal */}
      <Modal
        title={`Order Details - ${selectedOrder?.orderNumber}`}
        open={orderModalVisible}
        onCancel={() => setOrderModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setOrderModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
        {selectedOrder && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Order Number">
              <Text strong>{selectedOrder.orderNumber}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Product">
              {selectedOrder.product}
            </Descriptions.Item>
            <Descriptions.Item label="Quantity">
              {selectedOrder.quantity}
            </Descriptions.Item>
            <Descriptions.Item label="Unit Price">
              ${selectedOrder.price}
            </Descriptions.Item>
            <Descriptions.Item label="Total Amount">
              <Text strong>${selectedOrder.total}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Order Date">
              {new Date(selectedOrder.date).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {getStatusTag(selectedOrder.status)}
            </Descriptions.Item>
            {selectedOrder.trackingNumber && (
              <Descriptions.Item label="Tracking Number">
                <Text code>{selectedOrder.trackingNumber}</Text>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Shipping Address">
              {selectedOrder.shippingAddress}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default PurchaseHistory;
