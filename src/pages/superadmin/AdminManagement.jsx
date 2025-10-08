import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Popconfirm,
  Tooltip,
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useAdmins } from '../../hooks/useAdmins';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AdminManagement = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  const { admins = [], loading, createAdmin, updateAdmin, deleteAdmin } = useAdmins();

  const handleCreateAdmin = async (values) => {
    try {
      await createAdmin(values);
      message.success('Admin created successfully!');
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(error.message || 'Failed to create admin');
    }
  };

  const handleUpdateAdmin = async (values) => {
    try {
      await updateAdmin(editingAdmin._id, values);
      message.success('Admin updated successfully!');
      setModalVisible(false);
      setEditingAdmin(null);
      form.resetFields();
    } catch (error) {
      message.error(error.message || 'Failed to update admin');
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    try {
      await deleteAdmin(adminId);
      message.success('Admin deleted successfully!');
    } catch (error) {
      message.error(error.message || 'Failed to delete admin');
    }
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    form.setFieldsValue({
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      phone: admin.phone,
      status: admin.status,
      notes: admin.notes,
    });
    setModalVisible(true);
  };

  const openCreateModal = () => {
    setEditingAdmin(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingAdmin(null);
    form.resetFields();
  };

  // Filter only users with role 'admin'
  const adminUsers = admins.filter(user => (user.role || '').toLowerCase() === 'admin');

  // Search filter
  const filteredAdmins = adminUsers.filter(admin =>
    admin.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
    admin.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: 'Admin',
      key: 'name',
      render: (_, record) => (
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
      title: 'Contact',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || <Text type="secondary">Not set</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : status === 'inactive' ? 'red' : 'orange'}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Last Active',
      key: 'lastActive',
      render: (_, record) => record.lastOrder ? new Date(record.lastOrder).toLocaleDateString() : <Text type="secondary">Never</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Admin">
            <Button type="link" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
          </Tooltip>
          <Popconfirm
            title="Delete Admin"
            description="Are you sure you want to delete this admin?"
            onConfirm={() => handleDeleteAdmin(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Admin">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <TeamOutlined /> Admin Management
          </Title>
          <Text type="secondary">
            Manage system administrators and their permissions
          </Text>
        </Col>
        <Col>
          <Space>
            <Input
              placeholder="Search admins..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Button type="primary" icon={<UserAddOutlined />} onClick={openCreateModal}>
              Add Admin
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredAdmins}
          loading={loading}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} admins`,
          }}
        />
      </Card>

      <Modal
        title={editingAdmin ? 'Edit Admin' : 'Create New Admin'}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingAdmin ? handleUpdateAdmin : handleCreateAdmin}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="First Name" name="firstName" rules={[{ required: true, message: 'Please enter first name' }]}>
                <Input placeholder="First Name" prefix={<UserAddOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Last Name" name="lastName" rules={[{ required: true, message: 'Please enter last name' }]}>
                <Input placeholder="Last Name" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Please enter email' }, { type: 'email', message: 'Please enter a valid email' }]}>
            <Input placeholder="Email address" prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter password' }, { min: 6, message: 'Password must be at least 6 characters' }]}>
            <Input.Password placeholder="Password" />
          </Form.Item>

          <Form.Item label="Phone" name="phone">
            <Input placeholder="Phone number" prefix={<PhoneOutlined />} />
          </Form.Item>

          <Form.Item label="Status" name="status" initialValue="active">
            <Select>
              <Option value="active" key="status-active">Active</Option>
              <Option value="inactive" key="status-inactive">Inactive</Option>
              <Option value="pending" key="status-pending">Pending</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Notes" name="notes">
            <TextArea rows={3} placeholder="Additional notes about this admin..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">{editingAdmin ? 'Update Admin' : 'Create Admin'}</Button>
              <Button onClick={handleModalCancel}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminManagement;
