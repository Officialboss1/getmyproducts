import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Progress,
  Tooltip,
  Statistic,
} from 'antd';
import {
  SettingOutlined,
  EditOutlined,
  PlusOutlined,
  TeamOutlined,
  SearchOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useUsers } from '../../hooks/useUsers';
import { adminAPI } from '../../services/adminApi';

const { Title, Text } = Typography;
const { Option } = Select;

const TargetsManagement = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [targetsData, setTargetsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  const {
    users: salespersons,
    loading: usersLoading,
    refetch: _refetchUsers,
  } = useUsers('sales_person');

  useEffect(() => {
    fetchTargetsData();
  }, [salespersons]);

  const fetchTargetsData = async () => {
    if (salespersons.length === 0) return;

    setLoading(true);
    try {
      const targetsPromises = salespersons.map(async (user) => {
        try {
          const response = await adminAPI.getTargets(user.id);
          const progressResponse = await adminAPI.getProgress(user.id, 'monthly');
          
          return {
            ...user,
            targets: response.data,
            progress: progressResponse.data,
          };
        } catch {
          return {
            ...user,
            targets: null,
            progress: null,
          };
        }
      });

      const data = await Promise.all(targetsPromises);
      setTargetsData(data);
    } catch (_error) {
      console.error('Error fetching targets data:', _error);
      message.error('Failed to load targets data');
    } finally {
      setLoading(false);
    }
  };

  const handleSetTargets = async (values) => {
    try {
      const targetData = {
        userId: selectedUser.id,
        daily: values.daily,
        weekly: values.weekly,
        monthly: values.monthly,
      };

      await adminAPI.setTargets(targetData);
      message.success('Targets set successfully!');
      setModalVisible(false);
      setSelectedUser(null);
      form.resetFields();
      fetchTargetsData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to set targets');
    }
  };

  const handleResetTargets = async (userId) => {
    try {
      await adminAPI.deleteTargets(userId);
      message.success('Targets reset to defaults!');
      fetchTargetsData();
    } catch (error) {
      message.error('Failed to reset targets');
    }
  };

  const openSetTargetsModal = (user) => {
    setSelectedUser(user);
    if (user.targets) {
      form.setFieldsValue({
        daily: user.targets.daily,
        weekly: user.targets.weekly,
        monthly: user.targets.monthly,
      });
    } else {
      form.setFieldsValue({
        daily: 30,
        weekly: 210,
        monthly: 900,
      });
    }
    setModalVisible(true);
  };

  const getProgressPercentage = (progress, target) => {
    if (!progress || !target) return 0;
    return Math.min(100, (progress / target) * 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return '#52c41a';
    if (percentage >= 70) return '#faad14';
    return '#f5222d';
  };

  const columns = [
    {
      title: 'Salesperson',
      dataIndex: 'firstName',
      key: 'name',
      render: (text, record) => (
        <Space>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            {record.firstName?.[0]}{record.lastName?.[0]}
          </div>
          <div>
            <Text strong>{record.firstName} {record.lastName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Current Targets',
      key: 'targets',
      render: (_, record) => {
        const targets = record.targets;
        const isCustom = targets?.isCustom;
        
        return (
          <Space direction="vertical" size="small">
            <div>
              <Text strong>Daily: </Text>
              <Text>{targets?.daily || 30}</Text>
              {isCustom && <Tag color="blue" style={{ marginLeft: 4 }}>Custom</Tag>}
            </div>
            <div>
              <Text strong>Weekly: </Text>
              <Text>{targets?.weekly || 210}</Text>
            </div>
            <div>
              <Text strong>Monthly: </Text>
              <Text>{targets?.monthly || 900}</Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Monthly Progress',
      key: 'progress',
      render: (_, record) => {
        const progress = record.progress;
        const monthlyTarget = record.targets?.monthly || 900;
        const currentSales = progress?.totalUnits || 0;
        const percentage = getProgressPercentage(currentSales, monthlyTarget);
        
        return (
          <Space direction="vertical" style={{ width: 150 }}>
            <Progress 
              percent={Math.round(percentage)} 
              strokeColor={getProgressColor(percentage)}
              size="small"
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {currentSales} / {monthlyTarget} units
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const progress = record.progress;
        const monthlyTarget = record.targets?.monthly || 900;
        const currentSales = progress?.totalUnits || 0;
        const percentage = getProgressPercentage(currentSales, monthlyTarget);
        
        if (percentage >= 100) {
          return <Tag color="success">Target Achieved</Tag>;
        } else if (percentage >= 75) {
          return <Tag color="processing">On Track</Tag>;
        } else if (percentage >= 50) {
          return <Tag color="warning">Needs Push</Tag>;
        } else {
          return <Tag color="error">Behind</Tag>;
        }
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Set Targets">
            <Button
              type="link"
              icon={<SettingOutlined />}
              onClick={() => openSetTargetsModal(record)}
            >
              Set Targets
            </Button>
          </Tooltip>
          {record.targets?.isCustom && (
            <Tooltip title="Reset to Defaults">
              <Button
                type="link"
                danger
                onClick={() => handleResetTargets(record.id)}
              >
                Reset
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const filteredData = targetsData.filter(item =>
    item.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const stats = {
    totalUsers: targetsData.length,
    customTargets: targetsData.filter(item => item.targets?.isCustom).length,
    onTrack: targetsData.filter(item => {
      const progress = item.progress;
      const monthlyTarget = item.targets?.monthly || 900;
      const currentSales = progress?.totalUnits || 0;
      const percentage = getProgressPercentage(currentSales, monthlyTarget);
      return percentage >= 75;
    }).length,
    averageProgress: Math.round(
      targetsData.reduce((acc, item) => {
        const progress = item.progress;
        const monthlyTarget = item.targets?.monthly || 900;
        const currentSales = progress?.totalUnits || 0;
        const percentage = getProgressPercentage(currentSales, monthlyTarget);
        return acc + percentage;
      }, 0) / targetsData.length
    ) || 0,
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <BarChartOutlined /> Targets Management
          </Title>
          <Text type="secondary">
            Set and monitor sales targets for your team members
          </Text>
        </Col>
        <Col>
          <Input
            placeholder="Search salespersons..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Team Members"
              value={stats.totalUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Custom Targets"
              value={stats.customTargets}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="On Track"
              value={stats.onTrack}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Avg Progress"
              value={stats.averageProgress}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Targets Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading || usersLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} team members`,
          }}
        />
      </Card>

      {/* Set Targets Modal */}
      <Modal
        title={`Set Targets for ${selectedUser?.firstName} ${selectedUser?.lastName}`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedUser(null);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSetTargets}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Daily Target"
                name="daily"
                rules={[{ required: true, message: 'Please enter daily target' }]}
              >
                <InputNumber
                  min={1}
                  max={1000}
                  style={{ width: '100%' }}
                  placeholder="Units"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Weekly Target"
                name="weekly"
                rules={[{ required: true, message: 'Please enter weekly target' }]}
              >
                <InputNumber
                  min={1}
                  max={5000}
                  style={{ width: '100%' }}
                  placeholder="Units"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Monthly Target"
                name="monthly"
                rules={[{ required: true, message: 'Please enter monthly target' }]}
              >
                <InputNumber
                  min={1}
                  max={20000}
                  style={{ width: '100%' }}
                  placeholder="Units"
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
            <Text type="secondary">
              <strong>Default Targets:</strong> Daily: 30, Weekly: 210, Monthly: 900 units
            </Text>
          </div>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Save Targets
              </Button>
              <Button 
                onClick={() => {
                  setModalVisible(false);
                  setSelectedUser(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TargetsManagement;