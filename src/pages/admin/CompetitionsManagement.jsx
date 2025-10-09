import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Popconfirm,
  Tooltip,
  Statistic,
  Progress,
  List,
} from 'antd';
import {
  TrophyOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useCompetitions } from '../../hooks/useCompetitions';
import api from '../../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const CompetitionsManagement = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState(null);
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [form] = Form.useForm();

  const {
    competitions,
    loading,
    error: _error,
    createCompetition,
    updateCompetition,
    deleteCompetition,
    refetch: _refetch,
  } = useCompetitions();

  const handleCreateCompetition = async (values) => {
    try {
      const competitionData = {
        ...values,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
      };
      delete competitionData.dateRange;

      await createCompetition(competitionData);
      message.success('Competition created successfully!');
      setModalVisible(false);
      form.resetFields();
    } catch (_error) {
      message.error(_error.message || 'Failed to create competition');
    }
  };

  const handleUpdateCompetition = async (values) => {
    try {
      const competitionData = {
        ...values,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
      };
      delete competitionData.dateRange;

  await updateCompetition(editingCompetition._id || editingCompetition.id, competitionData);
      message.success('Competition updated successfully!');
      setModalVisible(false);
      setEditingCompetition(null);
      form.resetFields();
    } catch (_error) {
      message.error(_error.message || 'Failed to update competition');
    }
  };

  const handleDeleteCompetition = async (competitionId) => {
    try {
  await deleteCompetition(competitionId);
      message.success('Competition deleted successfully!');
    } catch (_error) {
      message.error(_error.message || 'Failed to delete competition');
    }
  };

  const showLeaderboard = (competition) => {
    setSelectedCompetition(competition);
    // fetch leaderboard from API
    (async () => {
      try {
        const res = await api.competitions.getCompetitionLeaderboard(competition._id || competition.id);
        setLeaderboardData(res.data || []);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
        setLeaderboardData([]);
      }
      setLeaderboardVisible(true);
    })();
  };

  const openEditModal = (competition) => {
    setEditingCompetition(competition);
    form.setFieldsValue({
      name: competition.name,
      description: competition.description,
      metric: competition.metric,
      product_id: competition.product_id,
      dateRange: [dayjs(competition.startDate), dayjs(competition.endDate)],
    });
    setModalVisible(true);
  };

  const openCreateModal = () => {
    setEditingCompetition(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingCompetition(null);
    form.resetFields();
  };

  const getCompetitionStatus = (competition) => {
    const now = dayjs();
    const start = dayjs(competition.startDate);
    const end = dayjs(competition.endDate);

    if (now.isBefore(start)) {
      return { status: 'upcoming', color: 'blue', text: 'Upcoming' };
    } else if (now.isAfter(end)) {
      return { status: 'ended', color: 'default', text: 'Ended' };
    } else {
      return { status: 'active', color: 'green', text: 'Active' };
    }
  };

  const getTimeRemaining = (endDate) => {
    const now = dayjs();
    const end = dayjs(endDate);
    const days = end.diff(now, 'day');
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else {
      const hours = end.diff(now, 'hour');
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    }
  };

  // Mock leaderboard data
  const mockLeaderboard = [
    { rank: 1, name: 'John Doe', value: 150, sales: 15 },
    { rank: 2, name: 'Jane Smith', value: 120, sales: 12 },
    { rank: 3, name: 'Mike Johnson', value: 95, sales: 9 },
    { rank: 4, name: 'Sarah Wilson', value: 80, sales: 8 },
    { rank: 5, name: 'David Brown', value: 75, sales: 7 },
  ];

  const columns = [
    {
      title: 'Competition',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.description}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Period',
      key: 'period',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(record.startDate).format('MMM D, YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            to {dayjs(record.endDate).format('MMM D, YYYY')}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const status = getCompetitionStatus(record);
        return (
          <Space>
            <Tag color={status.color}>{status.text}</Tag>
            {status.status === 'active' && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {getTimeRemaining(record.endDate)}
              </Text>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Metric',
      dataIndex: 'metric',
      key: 'metric',
      render: (metric) => (
        <Tag color={metric === 'revenue' ? 'gold' : 'blue'}>
          {metric?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Participants',
      key: 'participants',
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <Text>{(record.participants && record.participants.length) || 0}</Text>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Leaderboard">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => showLeaderboard(record)}
            >
              Leaderboard
            </Button>
          </Tooltip>
          <Tooltip title="Edit Competition">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Competition"
            description="Are you sure you want to delete this competition?"
            onConfirm={() => handleDeleteCompetition(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Competition">
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    total: competitions.length,
    active: competitions.filter(comp => getCompetitionStatus(comp).status === 'active').length,
    upcoming: competitions.filter(comp => getCompetitionStatus(comp).status === 'upcoming').length,
    participants: 156, // Mock data
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <TrophyOutlined /> Competitions Management
          </Title>
          <Text type="secondary">
            Create and manage sales competitions for your team
          </Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Create Competition
          </Button>
        </Col>
      </Row>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Competitions"
              value={stats.total}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Active"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Upcoming"
              value={stats.upcoming}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Participants"
              value={stats.participants}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Competitions Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={competitions}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} competitions`,
          }}
        />
      </Card>

      {/* Create/Edit Competition Modal */}
      <Modal
        title={editingCompetition ? 'Edit Competition' : 'Create New Competition'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingCompetition ? handleUpdateCompetition : handleCreateCompetition}
        >
          <Form.Item
            label="Competition Name"
            name="name"
            rules={[{ required: true, message: 'Please enter competition name' }]}
          >
            <Input placeholder="e.g., Summer Sales Challenge" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="Describe the competition goals and rules..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Metric"
                name="metric"
                rules={[{ required: true, message: 'Please select metric' }]}
                initialValue="units"
              >
                <Select>
                  <Option value="units">Units Sold</Option>
                  <Option value="revenue">Revenue</Option>
                  <Option value="customers">New Customers</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Product (Optional)"
                name="product_id"
              >
                <Select placeholder="Select specific product">
                  <Option value="prod_1">iPhone 15</Option>
                  <Option value="prod_2">MacBook Air</Option>
                  <Option value="prod_3">Apple Watch</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Competition Period"
            name="dateRange"
            rules={[{ required: true, message: 'Please select competition period' }]}
          >
            <DatePicker.RangePicker
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCompetition ? 'Update Competition' : 'Create Competition'}
              </Button>
              <Button onClick={handleModalCancel}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Leaderboard Modal */}
      <Modal
        title={`Leaderboard - ${selectedCompetition?.name}`}
        open={leaderboardVisible}
        onCancel={() => setLeaderboardVisible(false)}
        footer={[
          <Button key="close" onClick={() => setLeaderboardVisible(false)}>
            Close
          </Button>,
        ]}
        width={600}
      >
          <List
            dataSource={leaderboardData}
            renderItem={(item, idx) => (
              <List.Item
                actions={[
                  <Text strong key="value">
                    {(selectedCompetition?.metric === 'revenue' ? item.revenue : item.units) || 0} {selectedCompetition?.metric === 'revenue' ? '$' : 'units'}
                  </Text>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: idx === 0 ? '#ffd666' : idx === 1 ? '#d9d9d9' : idx === 2 ? '#ff9c6e' : '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                    }}>
                      {item.rank || idx + 1}
                    </div>
                  }
                  title={item.user?.name || item.user?.email || 'Unknown'}
                  description={`${item.units || 0} units`}
                />
              </List.Item>
            )}
          />
      </Modal>
    </div>
  );
};

export default CompetitionsManagement;