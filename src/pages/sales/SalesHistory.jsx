import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  DatePicker,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  message,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  ShoppingCartOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../api/services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const SalesHistory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState([]);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productFilter, setProductFilter] = useState('all');

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterSales();
  }, [sales, searchText, statusFilter, dateRange, productFilter]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      // Get user from localStorage (as in dashboard)
      const user = JSON.parse(localStorage.getItem('user') || 'null');

      // Role-based data fetching:
      // - Admin and Super Admin: fetch all sales
      // - Salesperson: backend will automatically filter to their own sales
      const response = await api.sales.getSales();
      setSales(response.data?.sales || response.data || []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      message.error('Failed to load sales history');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await api.products.getProducts();
      console.log('Products response:', response); // Debug log
      const productsData = response.data?.products || response.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]); // Ensure products is always an array
    } finally {
      setProductsLoading(false);
    }
  };

  const filterSales = () => {
    let filtered = [...sales];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(
        (sale) =>
          sale.receiver_email
            ?.toLowerCase()
            .includes(searchText.toLowerCase()) ||
          sale.product_id?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      // Add status logic when available
    }

    // Date range filter
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      filtered = filtered.filter((sale) => {
        const saleDate = dayjs(sale.createdAt);
        return saleDate.isAfter(start) && saleDate.isBefore(end.add(1, 'day'));
      });
    }

    // Product filter
    if (productFilter !== 'all') {
      filtered = filtered.filter((sale) => sale.product_id === productFilter);
    }

    setFilteredSales(filtered);
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => dayjs(date).format('MMM D, YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: 'Product',
      dataIndex: 'product_id',
      key: 'product',
      render: (productId) => {
        const matched = products.find(
          (p) => p._id === (productId?._id || productId)
        );
        return <span>{matched ? matched.name : String(productId || '')}</span>;
      },
    },
    {
      title: 'Customer',
      dataIndex: 'receiver_email',
      key: 'customer',
      render: (email) => (
        <Tooltip title={email}>
          <Text>{email}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity_sold',
      key: 'quantity',
      align: 'center',
      render: (quantity) => <Tag color="blue">{quantity} units</Tag>,
    },
    {
      title: 'Amount',
      dataIndex: 'total_amount',
      key: 'amount',
      align: 'right',
      render: (amount) => <Text strong>₦{amount?.toLocaleString()}</Text>,
      sorter: (a, b) => (a.total_amount || 0) - (b.total_amount || 0),
    },
    {
      title: 'Status',
      key: 'status',
      render: () => <Tag color="green">Completed</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => viewSaleDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Sale">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => editSale(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const viewSaleDetails = (sale) => {
    message.info(`Viewing sale details for ${sale.id}`);
    // TODO: Implement sale details modal
  };

  const editSale = (sale) => {
    message.info(`Editing sale ${sale.id}`);
    // TODO: Implement sale editing
  };

  const getStats = () => {
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce(
      (sum, sale) => sum + (sale.total_amount || 0),
      0
    );
    const totalUnits = filteredSales.reduce(
      (sum, sale) => sum + (sale.quantity_sold || 0),
      0
    );

    return { totalSales, totalRevenue, totalUnits };
  };

  const stats = getStats();

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/dashboard')}
            style={{ marginBottom: 16 }}
            block
          >
            Back to Dashboard
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            <ShoppingCartOutlined /> Sales History
          </Title>
          <Text type="secondary">View and manage your sales transactions</Text>
        </Col>
        <Col xs={24} md={12}>
          <Row justify="end">
            <Col xs={24} sm={12} md={8}>
              <Button
                type="primary"
                onClick={() => navigate('/sales/add')}
                block
              >
                Add New Sale
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Sales"
              value={stats.totalSales}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={stats.totalRevenue}
              prefix="₦"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Units Sold"
              value={stats.totalUnits}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <Input
              placeholder="Search by customer or product..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Filter by product"
              style={{ width: '100%' }}
              value={productFilter}
              onChange={setProductFilter}
              loading={productsLoading}
            >
              <Option value="all">All Products</Option>
              {Array.isArray(products) && products.map((product) => (
                <Option key={product._id} value={product._id}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={setDateRange}
              placeholder={['Start Date', 'End Date']}
            />
          </Col>
          <Col xs={24} md={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button icon={<FilterOutlined />} onClick={filterSales} block>
                Apply Filters
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  setSearchText('');
                  setStatusFilter('all');
                  setDateRange([]);
                  setProductFilter('all');
                }}
                block
              >
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Sales Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredSales}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} sales`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default SalesHistory;


