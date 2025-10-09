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

  // Use live logs from hook instead of mock data
  // Map backend audit log shape to table-friendly shape
  const mappedLogs = (logs || []).map((l) => {
    const editor = l.editor_user_id || l.actor || l.user || null;
    const userName = editor
      ? `${editor.firstName || ''} ${editor.lastName || ''}`.trim() || editor.email || 'Unknown'
      : l.userName || l.user || 'Unknown';

    const userRole = editor?.role || l.userRole || l.role || 'N/A';

    // Details: prefer a human-friendly summary if before/after data exist
    let details = l.details || l.message || '';
    if (!details && (l.before_data || l.after_data)) {
      // compute simple changes summary
      const before = l.before_data || {};
      const after = l.after_data || {};
      const changes = {};
      Object.keys({ ...before, ...after }).forEach((key) => {
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          changes[key] = { from: before[key], to: after[key] };
        }
      });
      details = Object.keys(changes).length > 0 ? JSON.stringify(changes) : '';
    }

    const timestamp = l.createdAt || l.timestamp || l.date || null;

    return {
      id: l._id || l.id,
      userName,
      userRole,
      userId: editor?._id || l.userId,
      action: l.action_type || l.action || l.actionType || 'action',
      details,
      timestamp,
      ipAddress: l.ipAddress || l.ip || null,
      userAgent: l.userAgent || l.ua || null,
      resourceId: l.sale_id?._id || l.resourceId || l.resource_id || null,
      resourceType: l.sale_id ? 'sale' : l.resourceType || null,
      changes: l.changes || (l.before_data || l.after_data ? { before: l.before_data, after: l.after_data } : {}),
      status: l.status || 'success',
      raw: l,
    };
  });

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

  const filteredLogs = mappedLogs.filter((log) => {
    const q = searchText?.toLowerCase() || '';
    const matchesSearch =
      log.userName?.toLowerCase().includes(q) ||
      log.details?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q);

    const matchesUser = userFilter === 'all' ? true : log.userRole === userFilter;
    const baseAction = actionFilter === 'all' ? true : log.action?.startsWith(actionFilter);

    let matchesDate = true;
    if (dateRange?.[0] && dateRange?.[1]) {
      const start = dateRange[0].toDate ? dateRange[0].toDate() : new Date(dateRange[0]);
      const end = dateRange[1].toDate ? dateRange[1].toDate() : new Date(dateRange[1]);
      const t = log.timestamp ? new Date(log.timestamp) : null;
      if (t) matchesDate = t >= start && t <= end;
    }

    return matchesSearch && matchesUser && baseAction && matchesDate;
  });

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