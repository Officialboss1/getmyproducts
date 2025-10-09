import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Tabs,
  message,
  Modal,
  Descriptions,
  List,
  Alert,
  Divider,
} from 'antd';
import {
  QuestionCircleOutlined,
  PlusOutlined,
  EyeOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
// customerAPI currently unused in this mock page; keep placeholder
// import { customerAPI } from '../../services/customerApi';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const Support = ({ _user }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('new');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketModalVisible, setTicketModalVisible] = useState(false);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await customerAPI.getSupportTickets(user._id);
      
      // Mock data for demonstration
      const mockTickets = [
        {
          id: '1',
          ticketNumber: 'TKT-001',
          subject: 'Product Not Working',
          category: 'technical',
          priority: 'high',
          status: 'open',
          description: 'The iPhone I purchased last week is not turning on. I\'ve tried charging it but no response.',
          createdAt: '2025-10-02T14:30:00Z',
          updatedAt: '2025-10-02T14:30:00Z',
          replies: [
            {
              id: '1',
              message: 'Thank you for reaching out. We\'re sorry to hear about the issue with your iPhone. Our technical team will look into this and get back to you within 24 hours.',
              sender: 'Support Agent',
              createdAt: '2025-10-02T15:00:00Z',
              isCustomer: false,
            },
          ],
        },
        {
          id: '2',
          ticketNumber: 'TKT-002',
          subject: 'Shipping Delay',
          category: 'shipping',
          priority: 'medium',
          status: 'in_progress',
          description: 'My order #ORD-003 was supposed to be delivered yesterday but it\'s still showing as shipped.',
          createdAt: '2025-09-28T10:15:00Z',
          updatedAt: '2025-09-29T09:30:00Z',
          replies: [
            {
              id: '1',
              message: 'We apologize for the delay. We\'re tracking your package and it appears there was a weather-related delay. Expected delivery is now tomorrow.',
              sender: 'Support Agent',
              createdAt: '2025-09-28T14:20:00Z',
              isCustomer: false,
            },
            {
              id: '2',
              message: 'Thank you for the update. I\'ll wait until tomorrow.',
              sender: 'You',
              createdAt: '2025-09-28T16:45:00Z',
              isCustomer: true,
            },
          ],
        },
        {
          id: '3',
          ticketNumber: 'TKT-003',
          subject: 'Return Request',
          category: 'returns',
          priority: 'medium',
          status: 'resolved',
          description: 'I would like to return the AirPods I purchased as they don\'t fit comfortably.',
          createdAt: '2025-09-20T11:30:00Z',
          updatedAt: '2025-09-22T16:15:00Z',
          replies: [
            {
              id: '1',
              message: 'We\'re sorry to hear the AirPods don\'t fit comfortably. We\'ve initiated the return process and sent you a return shipping label.',
              sender: 'Support Agent',
              createdAt: '2025-09-20T14:00:00Z',
              isCustomer: false,
            },
            {
              id: '2',
              message: 'Thank you for the quick response. I\'ve shipped the item back today.',
              sender: 'You',
              createdAt: '2025-09-21T10:30:00Z',
              isCustomer: true,
            },
            {
              id: '3',
              message: 'We\'ve received your return and processed your refund. It should appear in your account within 3-5 business days.',
              sender: 'Support Agent',
              createdAt: '2025-09-22T16:15:00Z',
              isCustomer: false,
            },
          ],
        },
      ];

      setTickets(mockTickets);
    } catch {
      console.error('Error fetching tickets:');
      message.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTicket = async (values) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // await customerAPI.createSupportTicket(user._id, values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTicket = {
        id: Date.now().toString(),
        ticketNumber: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
        ...values,
        status: 'open',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: [],
      };

      setTickets(prev => [newTicket, ...prev]);
      message.success('Support ticket submitted successfully!');
      form.resetFields();
      setActiveTab('history');
    } catch {
      message.error('Failed to submit support ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    try {
      const newReply = {
        id: Date.now().toString(),
        message: replyText,
        sender: 'You',
        createdAt: new Date().toISOString(),
        isCustomer: true,
      };

      const updatedTickets = tickets.map(ticket =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              replies: [...ticket.replies, newReply],
              updatedAt: new Date().toISOString(),
              status: ticket.status === 'resolved' ? 'reopened' : ticket.status,
            }
          : ticket
      );

      setTickets(updatedTickets);
      setSelectedTicket(prev => ({
        ...prev,
        replies: [...prev.replies, newReply],
        updatedAt: new Date().toISOString(),
      }));
      setReplyText('');
      message.success('Reply sent successfully!');
    } catch {
      message.error('Failed to send reply');
    }
  };

  const showTicketDetails = (ticket) => {
    setSelectedTicket(ticket);
    setTicketModalVisible(true);
  };

  const openReplyModal = (ticket) => {
    setSelectedTicket(ticket);
    setReplyModalVisible(true);
  };

  const getPriorityTag = (priority) => {
    const priorityConfig = {
      low: { color: 'blue', text: 'Low' },
      medium: { color: 'orange', text: 'Medium' },
      high: { color: 'red', text: 'High' },
      urgent: { color: 'purple', text: 'Urgent' },
    };
    const config = priorityConfig[priority] || priorityConfig.medium;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      open: { color: 'blue', text: 'Open', icon: <ClockCircleOutlined /> },
      in_progress: { color: 'orange', text: 'In Progress', icon: <ClockCircleOutlined /> },
      resolved: { color: 'green', text: 'Resolved', icon: <CheckCircleOutlined /> },
      closed: { color: 'default', text: 'Closed', icon: <CheckCircleOutlined /> },
    };
    const config = statusConfig[status] || statusConfig.open;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getCategoryTag = (category) => {
    const categoryConfig = {
      technical: { color: 'purple', text: 'Technical' },
      billing: { color: 'red', text: 'Billing' },
      shipping: { color: 'blue', text: 'Shipping' },
      returns: { color: 'orange', text: 'Returns' },
      general: { color: 'default', text: 'General' },
    };
    const config = categoryConfig[category] || categoryConfig.general;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const ticketColumns = [
    {
      title: 'Ticket Number',
      dataIndex: 'ticketNumber',
      key: 'ticketNumber',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category) => getCategoryTag(category),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => getPriorityTag(priority),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showTicketDetails(record)}
          >
            View
          </Button>
          {record.status !== 'resolved' && record.status !== 'closed' && (
            <Button
              type="link"
              icon={<MessageOutlined />}
              onClick={() => openReplyModal(record)}
            >
              Reply
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const openTickets = tickets.filter(ticket => 
    ticket.status === 'open' || ticket.status === 'in_progress'
  );
  const resolvedTickets = tickets.filter(ticket => 
    ticket.status === 'resolved' || ticket.status === 'closed'
  );

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <QuestionCircleOutlined /> Support & Help Center
          </Title>
          <Text type="secondary">
            Get help with your orders, products, or account issues
          </Text>
        </Col>
      </Row>

      <Alert
        message="Need Immediate Help?"
        description="For urgent issues, call our support line at 1-800-HELP-NOW or email support@company.com"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="New Ticket" key="new">
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmitTicket}
              disabled={loading}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Category"
                    name="category"
                    rules={[{ required: true, message: 'Please select a category' }]}
                  >
                    <Select placeholder="Select issue category">
                      <Option value="technical">Technical Support</Option>
                      <Option value="billing">Billing & Payments</Option>
                      <Option value="shipping">Shipping & Delivery</Option>
                      <Option value="returns">Returns & Refunds</Option>
                      <Option value="general">General Inquiry</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Priority"
                    name="priority"
                    rules={[{ required: true, message: 'Please select priority' }]}
                    initialValue="medium"
                  >
                    <Select>
                      <Option value="low">Low</Option>
                      <Option value="medium">Medium</Option>
                      <Option value="high">High</Option>
                      <Option value="urgent">Urgent</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Subject"
                name="subject"
                rules={[{ required: true, message: 'Please enter a subject' }]}
              >
                <Input placeholder="Brief description of your issue" />
              </Form.Item>

              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: 'Please describe your issue' }]}
              >
                <TextArea
                  rows={6}
                  placeholder="Please provide detailed information about your issue, including order numbers, product details, and any error messages you've encountered..."
                  showCount
                  maxLength={1000}
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} icon={<PlusOutlined />}>
                  Submit Ticket
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Help Resources */}
          <Card title="Help Resources" style={{ marginTop: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card size="small" title="FAQ" hoverable>
                  <Text>Find answers to common questions</Text>
                  <div style={{ marginTop: 8 }}>
                    <Button type="link">View FAQ</Button>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small" title="Shipping Info" hoverable>
                  <Text>Track orders and shipping policies</Text>
                  <div style={{ marginTop: 8 }}>
                    <Button type="link">Learn More</Button>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small" title="Returns" hoverable>
                  <Text>Return policy and instructions</Text>
                  <div style={{ marginTop: 8 }}>
                    <Button type="link">View Policy</Button>
                  </div>
                </Card>
              </Col>
            </Row>
          </Card>
        </TabPane>

        <TabPane tab={`My Tickets (${tickets.length})`} key="history">
          <Card>
            <Tabs defaultActiveKey="active">
              <TabPane tab={`Active (${openTickets.length})`} key="active">
                <Table
                  columns={ticketColumns}
                  dataSource={openTickets}
                  loading={loading}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>
              <TabPane tab={`Resolved (${resolvedTickets.length})`} key="resolved">
                <Table
                  columns={ticketColumns}
                  dataSource={resolvedTickets}
                  loading={loading}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>
            </Tabs>
          </Card>
        </TabPane>
      </Tabs>

      {/* Ticket Details Modal */}
      <Modal
        title={`Support Ticket - ${selectedTicket?.ticketNumber}`}
        open={ticketModalVisible}
        onCancel={() => setTicketModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setTicketModalVisible(false)}>
            Close
          </Button>,
          selectedTicket?.status !== 'resolved' && selectedTicket?.status !== 'closed' && (
            <Button 
              key="reply" 
              type="primary"
              onClick={() => {
                setTicketModalVisible(false);
                openReplyModal(selectedTicket);
              }}
            >
              Reply
            </Button>
          ),
        ]}
        width={800}
      >
        {selectedTicket && (
          <div>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Subject" span={2}>
                <Text strong>{selectedTicket.subject}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {getCategoryTag(selectedTicket.category)}
              </Descriptions.Item>
              <Descriptions.Item label="Priority">
                {getPriorityTag(selectedTicket.priority)}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {getStatusTag(selectedTicket.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {dayjs(selectedTicket.createdAt).format('MMM D, YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {dayjs(selectedTicket.updatedAt).format('MMM D, YYYY HH:mm')}
              </Descriptions.Item>
            </Descriptions>

            <Card title="Issue Description" size="small" style={{ marginBottom: 16 }}>
              <Text>{selectedTicket.description}</Text>
            </Card>

            <Divider />

            <Title level={5}>Conversation History</Title>
            <List
              dataSource={selectedTicket.replies}
              renderItem={(reply) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: reply.isCustomer ? '#1890ff' : '#52c41a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '12px',
                      }}>
                        {reply.isCustomer ? 'Y' : 'S'}
                      </div>
                    }
                    title={
                      <Space>
                        <Text strong>{reply.sender}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {dayjs(reply.createdAt).format('MMM D, YYYY HH:mm')}
                        </Text>
                      </Space>
                    }
                    description={reply.message}
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'No replies yet' }}
            />
          </div>
        )}
      </Modal>

      {/* Reply Modal */}
      <Modal
        title={`Reply to Ticket - ${selectedTicket?.ticketNumber}`}
        open={replyModalVisible}
        onCancel={() => setReplyModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setReplyModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleAddReply}
            disabled={!replyText.trim()}
          >
            Send Reply
          </Button>,
        ]}
        width={600}
      >
        {selectedTicket && (
          <div>
            <Alert
              message="Current Issue"
              description={selectedTicket.subject}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <TextArea
              rows={6}
              placeholder="Type your reply here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              showCount
              maxLength={1000}
            />
            
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Your reply will be sent to our support team and they will respond as soon as possible.
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Support;