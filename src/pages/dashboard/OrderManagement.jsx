import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col,
  Tooltip,
  Popconfirm,
  DatePicker,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { useUser } from '../../contexts/App';
import { adminAPI } from '../../api/services/adminApi';
import { superAdminAPI } from '../../api/services/superAdminApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [form] = Form.useForm();
  const { user } = useUser();

  // Determine API based on user role
  const api = user?.role === 'super_admin' ? superAdminAPI : adminAPI;

  // Load orders
  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.getOrders();
      setOrders(response.data.orders || []);
    } catch (error) {
      message.error('Failed to load orders');
      console.error('Load orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load available products
  const loadProducts = async () => {
    try {
      const response = await api.getAvailableProducts();
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Load products error:', error);
    }
  };

  useEffect(() => {
    loadOrders();
    loadProducts();
  }, []);

  // Handle create/edit order
  const handleSubmit = async (values) => {
    try {
      // Get selected product price as total amount
      const selectedProduct = products.find(p => p._id === values.product);
      if (!selectedProduct) {
        message.error('Selected product not found');
        return;
      }

      // Total amount is the product price (no multiplication by hours)
      const totalAmount = selectedProduct.current_price;

      const orderData = {
        ...values,
        total_amount: totalAmount,
      };

      if (editingOrder) {
        await api.updateOrder(editingOrder._id, orderData);
        message.success('Order updated successfully');
      } else {
        await api.createOrder(orderData);
        message.success('Order created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingOrder(null);
      loadOrders();
    } catch (error) {
      message.error(editingOrder ? 'Failed to update order' : 'Failed to create order');
      console.error('Submit order error:', error);
    }
  };

  // Handle delete order
  const handleDelete = async (orderId) => {
    try {
      await api.deleteOrder(orderId);
      message.success('Order deleted successfully');
      loadOrders();
    } catch (error) {
      message.error('Failed to delete order');
      console.error('Delete order error:', error);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (orderId, status) => {
    try {
      await api.updateOrderStatus(orderId, { status });
      message.success(`Order status updated to ${status}`);
      loadOrders();
    } catch (error) {
      message.error('Failed to update order status');
      console.error('Update status error:', error);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await api.get('/orders/export', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'orders.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Orders exported successfully');
    } catch (error) {
      message.error('Failed to export orders');
      console.error('Export error:', error);
    }
  };

  // Open modal for editing
  const openEditModal = (order) => {
    setEditingOrder(order);
    form.setFieldsValue({
      ...order,
      product: order.product._id,
    });
    setModalVisible(true);
  };

  // Open modal for creating
  const openCreateModal = () => {
    setEditingOrder(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Get product price (total amount is just the product price)
  const getProductPrice = (productId) => {
    if (!productId) return 0;
    const product = products.find(p => p._id === productId);
    return product ? product.current_price : 0;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      active: 'blue',
      completed: 'green',
      cancelled: 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockCircleOutlined />,
      active: <CheckCircleOutlined />,
      completed: <CheckCircleOutlined />,
      cancelled: <CloseCircleOutlined />
    };
    return icons[status] || null;
  };

  const columns = [
    {
      title: 'Customer Email',
      dataIndex: 'customer_email',
      key: 'customer_email',
      render: (email) => (
        <Text copyable={{ text: email }}>
          {email}
        </Text>
      ),
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      render: (product) => (
        <div>
          <Text strong>{product?.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            ${product?.current_price?.toFixed(2)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'hours_duration',
      key: 'hours_duration',
      render: (hours) => (
        <Text>{hours} hours</Text>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount, record) => {
        // Display the product's current price as total amount
        const productPrice = record.product?.current_price || 0;
        return (
          <Text strong style={{ color: '#52c41a' }}>
            ${productPrice?.toFixed(2)}
          </Text>
        );
      },
      sorter: (a, b) => (a.product?.current_price || 0) - (b.product?.current_price || 0),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === 'active' ? 'processing' : status === 'completed' ? 'success' : status === 'cancelled' ? 'error' : 'default'}
          text={
            <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
              {status.toUpperCase()}
            </Tag>
          }
        />
      ),
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Active', value: 'active' },
        { text: 'Completed', value: 'completed' },
        { text: 'Cancelled', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {/* Only Admin and Super Admin can edit orders */}
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Tooltip title="Edit Order">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
          )}

          {/* Only Admin and Super Admin can update order status */}
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Select
              value={record.status}
              onChange={(value) => handleStatusUpdate(record._id, value)}
              style={{ width: 100 }}
              size="small"
            >
              <Option value="pending">Pending</Option>
              <Option value="active">Active</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          )}

          {/* Only Admin and Super Admin can delete orders */}
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Popconfirm
              title="Delete Order"
              description="Are you sure you want to delete this order?"
              onConfirm={() => handleDelete(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <Row justify="space-between" align="middle" gutter={[16, 16]} className="mb-4 sm:mb-6">
        <Col xs={24} sm={24} md={12} lg={14} xl={16}>
          <Title level={2} className="text-lg sm:text-xl md:text-2xl lg:text-3xl m-0 mb-1 sm:mb-2">
            <FileTextOutlined className="mr-2" /> Order Management
          </Title>
          <Text type="secondary" className="text-sm sm:text-base">
            Manage customer orders and services
          </Text>
        </Col>
        <Col xs={24} sm={24} md={12} lg={10} xl={8}>
          <div className="flex flex-col md:flex-row gap-2 md:gap-3 justify-end">
            <Button
              icon={<ReloadOutlined />}
              onClick={loadOrders}
              className="w-full md:w-auto text-sm sm:text-base"
            >
              Refresh
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              className="w-full md:w-auto text-sm sm:text-base"
            >
              Export
            </Button>
            {/* Only Admin and Super Admin can create orders */}
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
                className="w-full md:w-auto text-sm sm:text-base"
              >
                Create Order
              </Button>
            )}
          </div>
        </Col>
      </Row>

      <Card className="overflow-hidden">
        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 800 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} orders`,
            className: "px-2 sm:px-4"
          }}
          className="text-xs sm:text-sm"
        />
      </Card>

      {/* Order Modal */}
      <Modal
        title={editingOrder ? 'Edit Order' : 'Create Order'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingOrder(null);
        }}
        footer={null}
        width={700}
        className="max-w-[95vw] sm:max-w-[700px]"
        bodyStyle={{ padding: '16px 20px 20px' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={[12, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="customer_email"
                label="Customer Email"
                rules={[
                  { required: true, message: 'Please enter customer email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input
                  placeholder="customer@example.com"
                  className="text-sm sm:text-base"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="product"
                label="Product"
                rules={[{ required: true, message: 'Please select a product' }]}
              >
                <Select
                  placeholder="Select a product"
                  className="text-sm sm:text-base"
                >
                  {products.map(product => (
                    <Option key={product._id} value={product._id}>
                      {product.name} - ${product.current_price.toFixed(2)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[12, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="hours_duration"
                label="Duration (Hours)"
                rules={[
                  { required: true, message: 'Please enter duration' },
                  { type: 'number', min: 1, max: 168, message: 'Duration must be between 1 and 168 hours' }
                ]}
              >
                <InputNumber
                  placeholder="Enter hours"
                  min={1}
                  max={168}
                  style={{ width: '100%' }}
                  className="text-sm sm:text-base"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Total Amount">
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.product !== currentValues.product
                  }
                >
                  {({ getFieldValue }) => {
                    const productId = getFieldValue('product');
                    const total = getProductPrice(productId);
                    const selectedProduct = products.find(p => p._id === productId);
                    return (
                      <div>
                        <Input
                          value={total > 0 ? `$${total.toFixed(2)}` : '$0.00'}
                          readOnly
                          style={{ color: '#52c41a', fontWeight: 'bold', marginBottom: 4 }}
                          className="text-sm sm:text-base"
                        />
                        {selectedProduct && (
                          <Text type="secondary" className="text-xs sm:text-sm">
                            {selectedProduct.name} - ${selectedProduct.current_price.toFixed(2)}
                          </Text>
                        )}
                      </div>
                    );
                  }}
                </Form.Item>
              </Form.Item>
            </Col>
          </Row>

          {!editingOrder && (
            <Row gutter={[12, 16]}>
              <Col span={24}>
                <Form.Item
                  name="notes"
                  label="Notes (Optional)"
                  rules={[
                    { max: 500, message: 'Notes cannot exceed 500 characters' }
                  ]}
                >
                  <TextArea
                    placeholder="Additional notes or special instructions"
                    rows={3}
                    className="text-sm sm:text-base"
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          {editingOrder && (
            <>
              <Row gutter={[12, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="status"
                    label="Status"
                  >
                    <Select className="text-sm sm:text-base">
                      <Option value="pending">Pending</Option>
                      <Option value="active">Active</Option>
                      <Option value="completed">Completed</Option>
                      <Option value="cancelled">Cancelled</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="notes"
                    label="Notes"
                    rules={[
                      { max: 500, message: 'Notes cannot exceed 500 characters' }
                    ]}
                  >
                    <TextArea
                      placeholder="Additional notes"
                      rows={2}
                      className="text-sm sm:text-base"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space className="flex-col sm:flex-row w-full sm:w-auto">
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setEditingOrder(null);
                }}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                {editingOrder ? 'Update' : 'Create'} Order
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderManagement;