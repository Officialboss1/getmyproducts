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
  Switch,
  Row,
  Col,
  Tooltip,
  Popconfirm,
  Select,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ShoppingOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useUser } from '../../contexts/App';
import { adminAPI } from '../../api/services/adminApi';
import { superAdminAPI } from '../../api/services/superAdminApi';

const { Title, Text } = Typography;
const { Option } = Select;

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const { user } = useUser();

  // Determine API based on user role
  const api = user?.role === 'super_admin' ? superAdminAPI : adminAPI;

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.getProducts();
      setProducts(response.data.products || []);
    } catch (error) {
      message.error('Failed to load products');
      console.error('Load products error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Handle create/edit product
  const handleSubmit = async (values) => {
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct._id, values);
        message.success('Product updated successfully');
      } else {
        await api.createProduct(values);
        message.success('Product created successfully');
      }
      setModalVisible(false);
      form.resetFields();
      setEditingProduct(null);
      loadProducts();
    } catch (error) {
      message.error(editingProduct ? 'Failed to update product' : 'Failed to create product');
      console.error('Submit product error:', error);
    }
  };

  // Handle delete product
  const handleDelete = async (productId) => {
    try {
      await api.deleteProduct(productId);
      message.success('Product deleted successfully');
      loadProducts();
    } catch (error) {
      message.error('Failed to delete product');
      console.error('Delete product error:', error);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (productId) => {
    try {
      await api.toggleProductStatus(productId);
      message.success('Product status updated successfully');
      loadProducts();
    } catch (error) {
      message.error('Failed to update product status');
      console.error('Toggle status error:', error);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await api.get('/products/export', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('Products exported successfully');
    } catch (error) {
      message.error('Failed to export products');
      console.error('Export error:', error);
    }
  };

  // Open modal for editing
  const openEditModal = (product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setModalVisible(true);
  };

  // Open modal for creating
  const openCreateModal = () => {
    setEditingProduct(null);
    form.resetFields();
    setModalVisible(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <ShoppingOutlined style={{ color: '#1890ff' }} />
          <div>
            <Text strong>{text}</Text>
            {record.description && (
              <div>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {record.description.length > 50
                    ? `${record.description.substring(0, 50)}...`
                    : record.description}
                </Text>
              </div>
            )}
          </div>
        </Space>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'current_price',
      key: 'current_price',
      render: (price) => (
        <Text strong style={{ color: '#52c41a' }}>
          ${price?.toFixed(2)}
        </Text>
      ),
      sorter: (a, b) => a.current_price - b.current_price,
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
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
          {/* Admin and Super Admin can edit products */}
          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Tooltip title="Edit Product">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => openEditModal(record)}
              />
            </Tooltip>
          )}

          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Tooltip title={record.is_active ? 'Deactivate' : 'Activate'}>
              <Switch
                checked={record.is_active}
                onChange={() => handleToggleStatus(record._id)}
                size="small"
              />
            </Tooltip>
          )}

          {(user?.role === 'admin' || user?.role === 'super_admin') && (
            <Popconfirm
              title="Delete Product"
              description="Are you sure you want to delete this product?"
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
            <ShoppingOutlined className="mr-2" /> Product Management
          </Title>
          <Text type="secondary" className="text-sm sm:text-base">
            Manage products and pricing for orders
          </Text>
        </Col>
        <Col xs={24} sm={24} md={12} lg={10} xl={8}>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
            <Button
              icon={<ReloadOutlined />}
              onClick={loadProducts}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Refresh
            </Button>
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExport}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Export
              </Button>
            )}
            {/* Admin and Super Admin can create products */}
            {(user?.role === 'admin' || user?.role === 'super_admin') && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
                className="w-full sm:w-auto text-sm sm:text-base"
              >
                Add Product
              </Button>
            )}
          </div>
        </Col>
      </Row>

      <Card className="overflow-hidden">
        <Table
          columns={columns}
          dataSource={products}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 600 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} products`,
            className: "px-2 sm:px-4"
          }}
          className="text-xs sm:text-sm"
        />
      </Card>

      {/* Product Modal */}
      <Modal
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingProduct(null);
        }}
        footer={null}
        width={600}
        className="max-w-[95vw] sm:max-w-[600px]"
        bodyStyle={{ padding: '16px 20px 20px' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            is_active: true,
          }}
        >
          <Row gutter={[12, 16]}>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Product Name"
                rules={[
                  { required: true, message: 'Please enter product name' },
                  { min: 2, message: 'Name must be at least 2 characters' },
                  { max: 100, message: 'Name cannot exceed 100 characters' }
                ]}
              >
                <Input
                  placeholder="Enter product name"
                  className="text-sm sm:text-base"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[12, 16]}>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Description"
                rules={[
                  { max: 500, message: 'Description cannot exceed 500 characters' }
                ]}
              >
                <Input.TextArea
                  placeholder="Enter product description"
                  rows={3}
                  className="text-sm sm:text-base"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[12, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="current_price"
                label="Price ($)"
                rules={[
                  { required: true, message: 'Please enter price' },
                  { type: 'number', min: 0, message: 'Price must be positive' }
                ]}
              >
                <InputNumber
                  placeholder="0.00"
                  min={0}
                  step={0.01}
                  precision={2}
                  style={{ width: '100%' }}
                  className="text-sm sm:text-base"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="is_active"
                label="Active Status"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  className="text-sm sm:text-base"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space className="flex-col sm:flex-row w-full sm:w-auto">
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                  setEditingProduct(null);
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
                {editingProduct ? 'Update' : 'Create'} Product
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductManagement;