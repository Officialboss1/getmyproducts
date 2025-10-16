import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Avatar,
  Typography,
  message,
  Select,
  Badge,
  Modal,
  Input,
  Form,
  Divider,
  Row,
  Col,
  List,
  Spin,
} from 'antd';
import {
  MessageOutlined,
  UserOutlined,
  TeamOutlined,
  SendOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useChat } from '../../hooks/useChat';
import { useUsers } from '../../hooks/useUsers';
import { chatAPI } from "../../api/services/chatApi";
import { useUser } from '../../contexts/App';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ChatManagement = () => {
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [openChats, setOpenChats] = useState(new Set());
  const [chatMessages, setChatMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [pendingChats, setPendingChats] = useState([]);

  const {
    sendMessage,
    markMessagesAsRead,
    closeChat,
    resolveChat,
    reopenChat,
  } = useChat();
  const {
    users: admins,
    loading: adminsLoading,
    error: adminsError,
  } = useUsers('admin');
  const { user } = useUser();

  // Removed sensitive console.log statements for security

  // Load all chat sessions
  const loadChatSessions = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getAllChatSessions();
      // Removed console.log for security - sensitive chat session data
      const sessions = response.data.chatSessions || [];

      // Separate pending chats (open status) from all chats
      const pending = sessions.filter((chat) => chat.status === 'open');
      setPendingChats(pending);
      setChatSessions(sessions);
    } catch (error) {
      message.error('Failed to load chat sessions');
      // Removed console.error for security - error details logged server-side
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh chat sessions every 30 seconds
  useEffect(() => {
    loadChatSessions(); // Load immediately on mount

    const interval = setInterval(() => {
      loadChatSessions();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Load messages for selected chat
  const loadChatMessages = async (chatId) => {
    if (!chatId) return;

    try {
      setMessageLoading(true);
      const response = await chatAPI.getChatMessages(chatId);
      setChatMessages(response.data.messages || []);
    } catch (error) {
      message.error('Failed to load messages');
      // Removed console.error for security - error details logged server-side
    } finally {
      setMessageLoading(false);
    }
  };

  // Assign chat to admin
  const assignChat = async (chatId, adminId) => {
    try {
      // Special handling for 'me' - assign to current user
      const actualAdminId = adminId === 'me' ? undefined : adminId; // Backend will use req.user._id for 'me'

      await chatAPI.assignChat(chatId, actualAdminId);
      message.success(
        actualAdminId
          ? 'Chat assigned successfully'
          : 'Chat accepted and assigned to you'
      );
      loadChatSessions();

      // If assigning to current admin, automatically select the chat
      if (!actualAdminId || adminId === 'me') {
        // Refresh chat sessions first, then find and select the updated chat
        setTimeout(() => {
          loadChatSessions().then(() => {
            const updatedChat = chatSessions.find(
              (chat) => chat.chatId === chatId
            );
            if (updatedChat) {
              setSelectedChat(updatedChat);
            }
          });
        }, 500);
      }
    } catch (error) {
      message.error('Failed to assign chat');
      // Removed console.error for security - error details logged server-side
    }
  };

  // Accept pending chat request
  const acceptPendingChat = async (chatId) => {
    try {
      await assignChat(chatId, 'me'); // Accept by assigning to current admin

      // After successful assignment, automatically open the chat for the admin
      const updatedChat = chatSessions.find((chat) => chat.chatId === chatId);
      if (updatedChat) {
        // Open the chat
        setOpenChats((prev) => new Set([...prev, chatId]));
        // Select the chat for immediate interaction
        setSelectedChat(updatedChat);
        // Load messages for the chat
        loadChatMessages(chatId);
      }

      // Remove from pending chats list
      setPendingChats((prev) => prev.filter((chat) => chat.chatId !== chatId));
    } catch (error) {
      message.error('Failed to accept chat request');
      // Removed console.error for security - error details logged server-side
    }
  };

  // Send reply
  const handleSendReply = async () => {
    if (!selectedChat || !replyMessage.trim()) return;

    try {
      await sendMessage(selectedChat.chatId, replyMessage);
      setReplyMessage('');
      loadChatMessages(selectedChat.chatId);
      loadChatSessions(); // Refresh to update last message time
    } catch (error) {
      message.error('Failed to send message');
    }
  };

  // Check if current user can reply to selected chat
  const canReplyToChat = () => {
    if (!selectedChat || !user) return false;

    // Super admins can always reply
    if (user.role === 'super_admin') return true;

    // Regular admins can only reply if assigned to the chat
    if (user.role === 'admin') {
      return (
        selectedChat.assignedTo && selectedChat.assignedTo._id === user._id
      );
    }

    return false;
  };

  // Auto-refresh messages every 10 seconds when chat is selected
  useEffect(() => {
    if (!selectedChat) return;

    const interval = setInterval(() => {
      loadChatMessages(selectedChat.chatId);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [selectedChat]);

  // Toggle chat open/close
  const toggleChat = (chatId) => {
    setOpenChats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
        // If closing the currently selected chat, deselect it
        if (selectedChat?.chatId === chatId) {
          setSelectedChat(null);
        }
      } else {
        newSet.add(chatId);
      }
      return newSet;
    });
  };

  // Select chat (only if it's open)
  const selectChat = (chat) => {
    if (openChats.has(chat.chatId)) {
      setSelectedChat(chat);
    }
  };

  // Close chat
  const handleCloseChat = async (chatId) => {
    try {
      await closeChat(chatId);
      message.success('Chat closed successfully');
      setSelectedChat(null);
      setOpenChats((prev) => {
        const newSet = new Set(prev);
        newSet.delete(chatId);
        return newSet;
      });
      loadChatSessions();
    } catch (error) {
      message.error('Failed to close chat');
    }
  };

  // Resolve chat
  const handleResolveChat = async (chatId) => {
    try {
      await resolveChat(chatId);
      message.success('Chat resolved successfully');
      setSelectedChat(null);
      loadChatSessions();
    } catch (error) {
      message.error('Failed to resolve chat');
    }
  };

  // Reopen chat
  const handleReopenChat = async (chatId) => {
    try {
      await reopenChat(chatId);
      message.success('Chat reopened successfully');
      loadChatSessions();
    } catch (error) {
      message.error('Failed to reopen chat');
    }
  };

  // Removed duplicate useEffect - now handled above

  useEffect(() => {
    if (selectedChat) {
      loadChatMessages(selectedChat.chatId);
      markMessagesAsRead(selectedChat.chatId);
    }
  }, [selectedChat]);

  const columns = [
    {
      title: 'Participants',
      dataIndex: 'participants',
      key: 'participants',
      render: (participants) => (
        <Space>
          {participants.map((p, index) => (
            <Space key={index} size="small">
              <Avatar
                size="small"
                src={
                  p.user && p.user.avatar
                    ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${p.user.avatar}`
                    : undefined
                }
                icon={<UserOutlined />}
              >
                {p.user?.firstName?.[0]}
                {p.user?.lastName?.[0]}
              </Avatar>
              <div>
                <Text strong>
                  {p.user?.firstName} {p.user?.lastName}
                </Text>
                <br />
                <Tag
                  size="small"
                  color={
                    p.role === 'customer'
                      ? 'blue'
                      : p.role === 'salesperson'
                        ? 'green'
                        : p.role === 'admin'
                          ? 'red'
                          : 'default'
                  }
                >
                  {p.role}
                </Tag>
              </div>
            </Space>
          ))}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={
            status === 'open'
              ? 'warning'
              : status === 'assigned'
                ? 'processing'
                : status === 'resolved'
                  ? 'success'
                  : status === 'reopened'
                    ? 'warning'
                    : 'default'
          }
          text={
            status === 'open'
              ? 'OPEN'
              : status === 'assigned'
                ? 'ASSIGNED'
                : status === 'resolved'
                  ? 'RESOLVED'
                  : status === 'reopened'
                    ? 'REOPENED'
                    : status.toUpperCase()
          }
        />
      ),
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (assignedTo) =>
        assignedTo ? (
          <Space>
            <Avatar size="small" icon={<UserOutlined />} />
            <Text>
              {assignedTo.firstName} {assignedTo.lastName}
            </Text>
          </Space>
        ) : (
          <Text type="secondary">Unassigned</Text>
        ),
    },
    {
      title: 'Last Message',
      dataIndex: 'lastMessage',
      key: 'lastMessage',
      render: (date) =>
        date ? new Date(date).toLocaleString() : 'No messages',
    },
    {
      title: 'Unread',
      dataIndex: 'unreadCount',
      key: 'unreadCount',
      render: (count) =>
        count > 0 ? <Badge count={count} /> : <Text type="secondary">0</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type={openChats.has(record.chatId) ? 'default' : 'primary'}
            size="small"
            icon={<MessageOutlined />}
            onClick={() => {
              if (openChats.has(record.chatId)) {
                selectChat(record);
              } else {
                toggleChat(record.chatId);
              }
            }}
          >
            {openChats.has(record.chatId) ? 'View Chat' : 'Open Chat'}
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() => toggleChat(record.chatId)}
            style={{ color: openChats.has(record.chatId) ? '#1890ff' : '#666' }}
          >
            {openChats.has(record.chatId) ? 'Close' : 'Toggle'}
          </Button>
          {record.status === 'open' ? (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => assignChat(record.chatId, 'me')} // Assign to current admin
            >
              Accept Chat
            </Button>
          ) : (
            <Select
              placeholder="Assign to"
              style={{ width: 120 }}
              onChange={(adminId) => assignChat(record.chatId, adminId)}
              value={record.assignedTo?._id || undefined}
              loading={adminsLoading}
            >
              <Option value={null}>Unassign</Option>
              {admins &&
                admins.map((admin) => (
                  <Option
                    key={admin._id || admin.id}
                    value={admin._id || admin.id}
                  >
                    {admin.firstName} {admin.lastName}
                  </Option>
                ))}
            </Select>
          )}
          {record.status === 'assigned' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleResolveChat(record.chatId)}
            >
              Resolve
            </Button>
          )}
          {record.status === 'resolved' && (
            <Button
              type="default"
              size="small"
              icon={<ClockCircleOutlined />}
              onClick={() => handleReopenChat(record.chatId)}
            >
              Reopen
            </Button>
          )}
          {record.status !== 'closed' && (
            <Button
              danger
              size="small"
              onClick={() => handleCloseChat(record.chatId)}
            >
              Close
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <style>
        {`
          .open-chat-row {
            background-color: #f6ffed !important;
            border-left: 3px solid #52c41a;
          }
          .open-chat-row:hover {
            background-color: #f0f9ea !important;
          }
        `}
      </style>
      <Row justify="space-between" align="middle" gutter={[16, 16]} className="mb-4 sm:mb-6">
        <Col xs={24} sm={24} md={12} lg={14} xl={16}>
          <Title level={2} className="text-lg sm:text-xl md:text-2xl lg:text-3xl m-0 mb-1 sm:mb-2">
            <TeamOutlined className="mr-2" /> Chat Management
          </Title>
          <Text type="secondary" className="text-sm sm:text-base">
            Manage customer support chats and assign conversations
          </Text>
          <div className="mt-2">
            <Text type="secondary" className="text-xs sm:text-sm">
              Open chats: {openChats.size} | Total chats: {chatSessions.length}
            </Text>
          </div>
        </Col>
        <Col xs={24} sm={24} md={12} lg={10} xl={8}>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
            <Button
              onClick={loadChatSessions}
              loading={loading}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Refresh
            </Button>
            <Button
              onClick={() => {
                setOpenChats(new Set());
                setSelectedChat(null);
              }}
              disabled={openChats.size === 0}
              className="w-full sm:w-auto text-sm sm:text-base"
            >
              Close All
            </Button>
          </div>
        </Col>
      </Row>

      <Row gutter={[12, 16]}>
        {/* Pending Chat Requests */}
        {pendingChats.length > 0 && (
          <Col xs={24}>
            <Card
              title={
                <Space className="text-sm sm:text-base">
                  <ClockCircleOutlined />
                  <span className="text-sm sm:text-base">Pending Chat Requests ({pendingChats.length})</span>
                </Space>
              }
              className="mb-4"
            >
              <List
                dataSource={pendingChats}
                renderItem={(chat) => (
                  <List.Item
                    actions={[
                      <Button
                        type="primary"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={() => acceptPendingChat(chat.chatId)}
                      >
                        Accept Chat
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={
                            chat.participants.find((p) => p.role !== 'admin')
                              ?.user?.avatar
                              ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${chat.participants.find((p) => p.role !== 'admin').user.avatar}`
                              : undefined
                          }
                          icon={<UserOutlined />}
                        >
                          {
                            chat.participants.find((p) => p.role !== 'admin')
                              ?.user?.firstName?.[0]
                          }
                          {
                            chat.participants.find((p) => p.role !== 'admin')
                              ?.user?.lastName?.[0]
                          }
                        </Avatar>
                      }
                      title={
                        <Text strong>
                          {
                            chat.participants.find((p) => p.role !== 'admin')
                              ?.user?.firstName
                          }{' '}
                          {
                            chat.participants.find((p) => p.role !== 'admin')
                              ?.user?.lastName
                          }
                        </Text>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">
                            Started: {new Date(chat.createdAt).toLocaleString()}
                          </Text>
                          {chat.lastMessage && (
                            <Text
                              type="secondary"
                              ellipsis
                              style={{ maxWidth: 300 }}
                            >
                              Last: {chat.lastMessage}
                            </Text>
                          )}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: 'No pending chat requests' }}
              />
            </Card>
          </Col>
        )}

        <Col xs={24} lg={selectedChat ? 12 : 24}>
          <Card className="overflow-hidden">
            <Table
              columns={columns}
              dataSource={chatSessions}
              loading={loading}
              rowKey={(record) => record.chatId}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} chats`,
                className: "px-2 sm:px-4"
              }}
              scroll={{ x: 800 }}
              className="text-xs sm:text-sm"
              rowClassName={(record) =>
                openChats.has(record.chatId) ? 'open-chat-row' : ''
              }
            />
          </Card>
        </Col>

        {selectedChat && openChats.has(selectedChat.chatId) && (
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space className="text-sm sm:text-base">
                  <MessageOutlined />
                  <span className="text-sm sm:text-base">
                    Chat with{' '}
                    {
                      selectedChat.participants.find((p) => p.role !== 'admin')
                        ?.user?.firstName
                    }
                  </span>
                  <Tag
                    className="text-xs sm:text-sm"
                    color={
                      selectedChat.status === 'open'
                        ? 'orange'
                        : selectedChat.status === 'assigned'
                          ? 'green'
                          : selectedChat.status === 'resolved'
                            ? 'blue'
                            : selectedChat.status === 'reopened'
                              ? 'purple'
                              : 'default'
                    }
                  >
                    {selectedChat.status.toUpperCase()}
                  </Tag>
                </Space>
              }
              extra={
                <Space className="flex-col sm:flex-row gap-1 sm:gap-2">
                  {selectedChat.status === 'assigned' && (
                    <Button
                      type="primary"
                      size="small"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleResolveChat(selectedChat.chatId)}
                      className="text-xs sm:text-sm w-full sm:w-auto"
                    >
                      <span className="hidden sm:inline">Resolve</span>
                      <span className="sm:hidden">Resolve</span>
                    </Button>
                  )}
                  {selectedChat.status === 'resolved' && (
                    <Button
                      type="default"
                      size="small"
                      icon={<ClockCircleOutlined />}
                      onClick={() => handleReopenChat(selectedChat.chatId)}
                      className="text-xs sm:text-sm w-full sm:w-auto"
                    >
                      <span className="hidden sm:inline">Reopen Chat</span>
                      <span className="sm:hidden">Reopen</span>
                    </Button>
                  )}
                  <Button
                    danger
                    size="small"
                    onClick={() => handleCloseChat(selectedChat.chatId)}
                    className="text-xs sm:text-sm w-full sm:w-auto"
                  >
                    <span className="hidden sm:inline">Close Chat</span>
                    <span className="sm:hidden">Close</span>
                  </Button>
                </Space>
              }
              bodyStyle={{ padding: 0 }}
            >
              {/* Messages Container */}
              <div
                className="h-[50vh] sm:h-[60vh] lg:h-[calc(100vh-200px)] overflow-y-auto p-3 sm:p-4 bg-gray-50"
              >
                {messageLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Spin
                      indicator={
                        <LoadingOutlined style={{ fontSize: 24 }} spin />
                      }
                    />
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Loading chat...</Text>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((message) => {
                    const isCurrentUser = message.sender._id === user?._id;

                    return (
                      <div
                        key={message._id}
                        style={{
                          display: 'flex',
                          justifyContent: isCurrentUser
                            ? 'flex-end'
                            : 'flex-start',
                          marginBottom: 12,
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '80%',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 8,
                          }}
                        >
                          {!isCurrentUser && (
                            <Avatar
                              size="small"
                              src={
                                message.sender?.avatar
                                  ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${message.sender.avatar}`
                                  : undefined
                              }
                              icon={<UserOutlined />}
                              style={{ backgroundColor: '#1890ff' }}
                            >
                              {message.sender?.firstName?.[0]}
                              {message.sender?.lastName?.[0]}
                            </Avatar>
                          )}
                          <Card
                            size="small"
                            style={{
                              backgroundColor: isCurrentUser
                                ? '#1890ff'
                                : '#fff',
                              border: isCurrentUser
                                ? 'none'
                                : '1px solid #f0f0f0',
                            }}
                            bodyStyle={{
                              padding: '8px 12px',
                            }}
                          >
                            <Text
                              style={{
                                color: isCurrentUser ? '#fff' : '#000',
                                whiteSpace: 'pre-wrap',
                                fontSize: '14px',
                              }}
                            >
                              {message.message}
                            </Text>
                            <div style={{ marginTop: 4 }}>
                              <Text
                                type="secondary"
                                style={{
                                  fontSize: '11px',
                                  color: isCurrentUser
                                    ? 'rgba(255,255,255,0.7)'
                                    : '#999',
                                }}
                              >
                                {new Date(message.timestamp).toLocaleTimeString(
                                  [],
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}
                              </Text>
                            </div>
                          </Card>
                          {isCurrentUser && (
                            <Avatar
                              size="small"
                              src={
                                user?.avatar
                                  ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${user.avatar}`
                                  : undefined
                              }
                              icon={<UserOutlined />}
                              style={{ backgroundColor: '#52c41a' }}
                            >
                              {user?.firstName?.[0]}
                              {user?.lastName?.[0]}
                            </Avatar>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-3 sm:p-4 bg-white">
                <Space
                  direction="vertical"
                  style={{ width: '100%' }}
                  size="small"
                >
                  {selectedChat.status === 'open' && (
                    <div
                      style={{
                        backgroundColor: '#fff7e6',
                        border: '1px solid #ffd591',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        marginBottom: '8px',
                      }}
                    >
                      <Text type="warning" style={{ fontSize: '12px' }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        This chat is open and waiting for admin assignment.
                      </Text>
                    </div>
                  )}

                  {selectedChat.status === 'assigned' && (
                    <div
                      style={{
                        backgroundColor: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        marginBottom: '8px',
                      }}
                    >
                      <Text type="success" style={{ fontSize: '12px' }}>
                        <CheckCircleOutlined style={{ marginRight: 4 }} />
                        This chat is assigned and active.
                      </Text>
                    </div>
                  )}

                  {selectedChat.status === 'reopened' && (
                    <div
                      style={{
                        backgroundColor: '#f0f9ff',
                        border: '1px solid #91d5ff',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        marginBottom: '8px',
                      }}
                    >
                      <Text type="info" style={{ fontSize: '12px' }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        This chat has been reopened for follow-up.
                      </Text>
                    </div>
                  )}

                  {selectedChat.status === 'resolved' && (
                    <div
                      style={{
                        backgroundColor: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        marginBottom: '8px',
                      }}
                    >
                      <Text type="success" style={{ fontSize: '12px' }}>
                        <CheckCircleOutlined style={{ marginRight: 4 }} />
                        This chat has been resolved.
                      </Text>
                    </div>
                  )}

                  {/* Reply Input */}
                  {(selectedChat.status === 'assigned' ||
                    selectedChat.status === 'reopened') &&
                    canReplyToChat() && (
                      <div className="flex gap-2">
                        <TextArea
                          placeholder="Type your reply..."
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          onPressEnter={(e) => {
                            if (!e.shiftKey) {
                              e.preventDefault();
                              handleSendReply();
                            }
                          }}
                          autoSize={{ minRows: 1, maxRows: 3 }}
                          className="flex-1 text-sm sm:text-base"
                        />
                        <Button
                          type="primary"
                          icon={<SendOutlined />}
                          onClick={handleSendReply}
                          disabled={!replyMessage.trim()}
                          className="text-sm sm:text-base"
                        />
                      </div>
                    )}

                  {/* Show message if admin cannot reply */}
                  {(selectedChat.status === 'open' ||
                    selectedChat.status === 'assigned' ||
                    selectedChat.status === 'reopened') &&
                    !canReplyToChat() && (
                      <div
                        style={{
                          backgroundColor: '#f5f5f5',
                          border: '1px solid #d9d9d9',
                          borderRadius: '4px',
                          padding: '12px',
                          textAlign: 'center',
                          color: '#666',
                        }}
                      >
                        {user?.role === 'super_admin' ? (
                          <Text>You can reply to any chat as Super Admin</Text>
                        ) : (
                          <Text>
                            You must be assigned to this chat to reply. Click
                            "Accept Chat" to take ownership.
                          </Text>
                        )}
                      </div>
                    )}
                </Space>
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default ChatManagement;



