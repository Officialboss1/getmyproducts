import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Card,
  Select,
  message,
  Row,
  Col,
  Typography,
  Spin,
  Alert,
  Divider,
} from 'antd';
import {
  ShoppingCartOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { data, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

const AddSale = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  // const [customers, setCustomers] = useState([]);

  useEffect(() => {
    fetchProducts();
    // fetchCustomers();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.products.getProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Failed to load products');
    }
  };

// const fetchCustomers = async () => {
//   try {
//     const response = await api.customers.getCustomers(); // ✅ replace with your real API
//     setCustomers(response.data || []);
//   } catch (error) {
//     console.error('Error fetching customers:', error);
//     message.error('Failed to load customers');
//   }
// };


  const handleProductChange = (productId) => {
    const product = products.find(p => p._id === productId);
    setSelectedProduct(product);
    
    // Auto-calculate total if quantity is already set
    const quantity = form.getFieldValue('quantity_sold');
    if (quantity && product) {
      const total = quantity * product.current_price;
      form.setFieldsValue({ total_amount: total });
    }
  };

  const handleQuantityChange = (quantity) => {
    if (selectedProduct && quantity) {
      const total = quantity * selectedProduct.current_price;
      form.setFieldsValue({ total_amount: total });
    } else {
      form.setFieldsValue({ total_amount: 0 });
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const saleData = {
        product_id: values.product_id,
        quantity_sold: values.quantity_sold,
        receiver_email: values.receiver_email,
        notes: values.notes,
      };

      await api.sales.addSale(saleData);
      
      message.success('Sale recorded successfully!');
      form.resetFields();
      setSelectedProduct(null);
      
      // Optionally redirect to sales history
      setTimeout(() => {
        navigate('/sales/history');
      }, 1500);
      
    } catch (error) {
      console.error('Error adding sale:', error);
      message.error(error.message || 'Failed to record sale');
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.warning('Please check the form for errors');
  };

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
            <ShoppingCartOutlined /> Record New Sale
          </Title>
          <Text type="secondary">
            Add a new sales transaction to track your performance
          </Text>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card>
            <Form
              form={form}
              name="addSale"
              layout="vertical"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              size="large"
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Product"
                    name="product_id"
                    rules={[
                      { required: true, message: 'Please select a product' },
                    ]}
                  >
                    <Select
                      placeholder="Select product"
                      onChange={handleProductChange}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {products.map(product => (
                        <Option key={product._id} value={product._id}>
                          {product.name} - ${product.current_price}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Quantity"
                    name="quantity_sold"
                    rules={[
                      { required: true, message: 'Please enter quantity' },
                      { type: 'number', min: 1, message: 'Quantity must be at least 1' },
                    ]}
                  >
                    <InputNumber
                      placeholder="Enter quantity"
                      style={{ width: '100%' }}
                      min={1}
                      onChange={handleQuantityChange}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Customer Email"
                    name="receiver_email"
                    rules={[
                      { required: true, message: 'Please enter customer email' },
                      { type: 'email', message: 'Please enter a valid email' },
                    ]}
                  >
                    <Input placeholder="customer@example.com" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Total Amount"
                    name="total_amount"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      disabled
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Notes (Optional)"
                name="notes"
              >
                <Input.TextArea
                  placeholder="Add any additional notes about this sale..."
                  rows={4}
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />}
                  loading={loading}
                  size="large"
                >
                  Record Sale
                </Button>
                
                <Button 
                  style={{ marginLeft: 8 }}
                  onClick={() => form.resetFields()}
                  disabled={loading}
                >
                  Reset Form
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Sale Information" style={{ marginBottom: 16 }}>
            {selectedProduct ? (
              <div>
                <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <Text strong>Product:</Text>
                  </Col>
                  <Col span={12}>
                    <Text>{selectedProduct.name}</Text>
                  </Col>
                </Row>
                <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
                  <Col span={12}>
                    <Text strong>Price:</Text>
                  </Col>
                  <Col span={12}>
                    <Text>${selectedProduct.current_price}</Text>
                  </Col>
                </Row>
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Text strong>Available:</Text>
                  </Col>
                  <Col span={12}>
                    <Text>In Stock</Text>
                  </Col>
                </Row>
              </div>
            ) : (
              <Text type="secondary">Select a product to see details</Text>
            )}
          </Card>

          <Card title="Quick Tips">
            <div style={{ fontSize: '13px' }}>
              <p>✅ Double-check customer email</p>
              <p>✅ Verify product quantity</p>
              <p>✅ Add notes for special circumstances</p>
              <p>✅ Ensure product is in stock</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AddSale;