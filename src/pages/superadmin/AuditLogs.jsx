import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  DatePicker,
  Tooltip,
  Modal,
  Descriptions,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  DownloadOutlined,
  ReloadOutlined,
  FileSearchOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useAuditLogs } from '../../hooks/useAuditLogs';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AuditLogs = () => {
  const [searchText, setSearchText] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateRange, setDateRange] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const {
    logs,
    loading,
    error,
    filters,
    updateFilters,
    exportLogs,
  } = useAuditLogs();

  // Mock data - replace with actual API data
  const auditLogs = [
    {
      id: '1',
      userName: 'John Doe',
      userRole: 'sales_person',
      userId: 'user_123',
      action: 'create_sale',
      details: 'Created new sale for product iPhone 15 - 5 units',
      timestamp: '2025-10-02T14:30:00Z',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      resourceId: 'sale_789',
      resourceType: 'sale',
      changes: {
        product_id: { from: null, to: 'prod_123' },
        quantity_sold: { from: null, to: 5 },
        total_amount: { from: null, to: 5000 }
      },
      status: 'success'
    },
    {
      id: '2',
      userName: 'Sarah Wilson',
      userRole: 'admin',
      userId: 'user_456',
      action: 'update_user',
      details: 'Updated user role from sales_person to team_head',
      timestamp: '2025-10-02T13:15:00Z',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      resourceId: 'user_789',
      resourceType: 'user',
      changes: {
        role: { from: 'sales_person', to: 'team_head' }
      },
      status: 'success'
    },
    {
      id: '3',
      userName: 'Mike Johnson',
      userRole: 'super_admin',
      userId: 'user_789',
      action: 'delete_competition',
      details: 'Deleted competition "Summer Sales Challenge"',
      timestamp: '2025-10-02T11:45:00Z',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
      resourceId: 'comp_123',
      resourceType: 'competition',
      changes: {},
      status: 'success'
    },
    {
      id: '4',
      userName: 'Jane Smith',
      userRole: 'sales_person',
      userId: 'user_234',
      action: 'login',
      details: 'User logged in successfully',
      timestamp: '2025-10-02T10:20:00Z',
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/537.36',
      resourceId: null,
      resourceType: 'auth',
      changes: {},
      status: 'success'
    },
    {
      id: '5',
      userName: 'Bob Brown',
      userRole: 'sales_person',
      userId: 'user_567',
      action: 'failed_login',
      details: 'Failed login attempt - invalid password',
      timestamp: '2025-10-02T09:30:00Z',
      ipAddress: '192.168.1.104',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      resourceId: null,
      resourceType: 'auth',
      changes: {},
      status: 'failed'
    },
  ];

  const handleSearch = () => {
    const newFilters = {
      search: searchText,
      user: userFilter !== 'all' ? userFilter : undefined,
      action: actionFilter !== 'all' ? actionFilter : undefined,
      startDate: dateRange?.[0]?.toISOString(),
      endDate: dateRange?.[1]?.toISOString(),
    };
    updateFilters(newFilters);
  };

  const handleExport = async () => {
    try {
      const blob = await exportLogs();
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${dayjs().format('YYYY-MM-DD')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const showLogDetails = (log) => {
    setSelectedLog(log);
    setDetailModalVisible(true);
  };

  const getActionColor = (action) => {
    const actionColors = {
      create: 'green',
      update: 'blue',
      delete: 'red',
      login: 'cyan',
      failed_login: 'volcano',
      read: 'geekblue',
      export: 'orange',
    };
    
    const baseAction = action.split('_')[0];
    return actionColors[baseAction] || 'default';
  };

  const getStatusColor = (status) => {
    return status === 'success' ? 'green' : 'red';
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'user',
      render: (text, record) => (
        <Space>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            {text?.[0]}
          </div>
          <div>
            <Text strong>{text}</Text>
            <br />
            <Tag size="small" color="blue">{record.userRole}</Tag>
          </div>
        </Space>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Tag color={getActionColor(action)}>
          {action.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Details',
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (details) => (
        <Tooltip title={details}>
          <Text>{details}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'success' ? 'success' : 'error'} 
          text={status.toUpperCase()}
        />
      ),
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(timestamp).format('MMM D, YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {dayjs(timestamp).format('HH:mm:ss')}
          </Text>
        </Space>
      ),
      sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => showLogDetails(record)}
          />
        </Tooltip>
      ),
    },
  ];

  const filteredLogs = auditLogs.filter(log =>
    log.userName?.toLowerCase().includes(searchText.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchText.toLowerCase()) ||
    log.action?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <FileSearchOutlined /> Audit Logs
          </Title>
          <Text type="secondary">
            System activity monitoring and security audit trail
          </Text>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<ReloadOutlined />}
              onClick={handleSearch}
              loading={loading}
            >
              Refresh
            </Button>
            <Button 
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              Export Logs
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <Input
              placeholder="Search logs..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={24} md={4}>
            <Select
              placeholder="User Role"
              style={{ width: '100%' }}
              value={userFilter}
              onChange={setUserFilter}
            >
              <Option value="all">All Users</Option>
              <Option value="super_admin">Super Admin</Option>
              <Option value="admin">Admin</Option>
              <Option value="sales_person">Sales Person</Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Select
              placeholder="Action Type"
              style={{ width: '100%' }}
              value={actionFilter}
              onChange={setActionFilter}
            >
              <Option value="all">All Actions</Option>
              <Option value="create">Create</Option>
              <Option value="update">Update</Option>
              <Option value="delete">Delete</Option>
              <Option value="login">Login</Option>
              <Option value="export">Export</Option>
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
            <Button 
              type="primary" 
              icon={<FilterOutlined />}
              onClick={handleSearch}
              style={{ width: '100%' }}
            >
              Apply Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredLogs}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} audit logs`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Log Details Modal */}
      <Modal
        title="Audit Log Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedLog && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="User">
              <Space>
                <UserOutlined />
                <Text strong>{selectedLog.userName}</Text>
                <Tag color="blue">{selectedLog.userRole}</Tag>
                <Text type="secondary">(ID: {selectedLog.userId})</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Action">
              <Tag color={getActionColor(selectedLog.action)}>
                {selectedLog.action.replace('_', ' ').toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Badge 
                status={selectedLog.status === 'success' ? 'success' : 'error'} 
                text={selectedLog.status.toUpperCase()}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Timestamp">
              <Space>
                <CalendarOutlined />
                <Text>{dayjs(selectedLog.timestamp).format('MMMM D, YYYY HH:mm:ss')}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Details">
              <Text>{selectedLog.details}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="IP Address">
              <Text code>{selectedLog.ipAddress}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="User Agent">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {selectedLog.userAgent}
              </Text>
            </Descriptions.Item>
            {selectedLog.resourceId && (
              <Descriptions.Item label="Resource">
                <Space>
                  <Text strong>Type:</Text>
                  <Tag>{selectedLog.resourceType}</Tag>
                  <Text strong>ID:</Text>
                  <Text code>{selectedLog.resourceId}</Text>
                </Space>
              </Descriptions.Item>
            )}
            {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
              <Descriptions.Item label="Changes">
                <div style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
                  {Object.entries(selectedLog.changes).map(([field, change]) => (
                    <div key={field} style={{ marginBottom: '4px' }}>
                      <Text strong>{field}:</Text>{' '}
                      <Text type="secondary">from</Text>{' '}
                      <Text code>{change.from ?? 'null'}</Text>{' '}
                      <Text type="secondary">to</Text>{' '}
                      <Text code>{change.to ?? 'null'}</Text>
                    </div>
                  ))}
                </div>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogs;