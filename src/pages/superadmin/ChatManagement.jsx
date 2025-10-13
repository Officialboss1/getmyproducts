import React, { useState, useEffect, useRef } from 'react';
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
  Timeline,
  Slider,
  Progress,
  Tooltip,
  Dropdown,
  Alert,
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
  PlayCircleOutlined,
  PauseCircleOutlined,
  FastForwardOutlined,
  FastBackwardOutlined,
  DownloadOutlined,
  EyeOutlined,
  HistoryOutlined,
  UserSwitchOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useChat } from '../../hooks/useChat';
import { useAdmins } from '../../hooks/useAdmins';
import { chatAPI } from "../../api/services/chatApi";
import { useUser } from '../../contexts/App';
import { useAuditLogs } from '../../hooks/useAuditLogs';

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

  // Super admin specific states
  const [replayMode, setReplayMode] = useState(false);
  const [replayMessages, setReplayMessages] = useState([]);
  const [replayIndex, setReplayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [showFullHistory, setShowFullHistory] = useState(false);

  const replayIntervalRef = useRef(null);
  const { user } = useUser();

  const {
    sendMessage,
    markMessagesAsRead,
    closeChat,
    resolveChat,
    reopenChat,
  } = useChat();

  const { admins, loading: adminsLoading } = useAdmins();

  const { logs: auditLogs, updateFilters: updateAuditFilters } = useAuditLogs({
    action: 'chat_management',
    limit: 50
  });

  // Verify super admin access
  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      message.error('Access denied. Super admin privileges required.');
      // Redirect logic would go here
    }
  }, [user]);

  // Load all chat sessions
  const loadChatSessions = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getAllChatSessions();
      const sessions = response.data.chatSessions || [];

      // Separate pending chats (open status) from all chats
      const pending = sessions.filter((chat) => chat.status === 'open');
      setPendingChats(pending);
      setChatSessions(sessions);
    } catch (error) {
      message.error('Failed to load chat sessions');
      console.error('Load chat sessions error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh chat sessions every 30 seconds
  useEffect(() => {
    loadChatSessions();

    const interval = setInterval(() => {
      loadChatSessions();
    }, 30000);

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
      console.error('Load messages error:', error);
    } finally {
      setMessageLoading(false);
    }
  };


  // Assign chat to admin with audit logging
  const assignChat = async (chatId, adminId) => {
    try {
      const actualAdminId = adminId === 'me' ? user._id : adminId;

      await chatAPI.assignChat(chatId, actualAdminId);

      message.success(
        actualAdminId === user._id
          ? 'Chat accepted and assigned to you'
          : 'Chat assigned successfully'
      );
      loadChatSessions();
      updateAuditFilters({ action: 'chat_management', limit: 50 }); // Refresh audit logs

      // If assigning to current admin, automatically select the chat
      if (actualAdminId === user._id) {
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
      console.error('Assign chat error:', error);
    }
  };

  // Start chat replay
  const startReplay = async (chatId) => {
    try {
      const response = await chatAPI.getChatMessages(chatId, { limit: 1000 });
      const messages = response.data.messages || [];

      setReplayMessages(messages);
      setReplayIndex(0);
      setReplayMode(true);
      setIsPlaying(true);

      // Start replay at normal speed
      replayIntervalRef.current = setInterval(() => {
        setReplayIndex(prev => {
          if (prev >= messages.length - 1) {
            setIsPlaying(false);
            clearInterval(replayIntervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 2000 / replaySpeed);

    } catch (error) {
      message.error('Failed to start replay');
      console.error('Start replay error:', error);
    }
  };

  // Control replay playback
  const toggleReplay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      clearInterval(replayIntervalRef.current);
    } else {
      setIsPlaying(true);
      replayIntervalRef.current = setInterval(() => {
        setReplayIndex(prev => {
          if (prev >= replayMessages.length - 1) {
            setIsPlaying(false);
            clearInterval(replayIntervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 2000 / replaySpeed);
    }
  };

  // Change replay speed
  const changeReplaySpeed = (speed) => {
    setReplaySpeed(speed);
    if (isPlaying) {
      clearInterval(replayIntervalRef.current);
      replayIntervalRef.current = setInterval(() => {
        setReplayIndex(prev => {
          if (prev >= replayMessages.length - 1) {
            setIsPlaying(false);
            clearInterval(replayIntervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 2000 / speed);
    }
  };

  // Export chat replay
  const exportReplay = () => {
    const chatData = {
      chatId: selectedChat.chatId,
      participants: selectedChat.participants,
      messages: chatMessages,
      exportedAt: new Date().toISOString(),
      exportedBy: user._id
    };

    const dataStr = JSON.stringify(chatData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `chat_replay_${selectedChat.chatId}_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    message.success('Chat replay exported successfully');
  };

  // Accept pending chat request
  const acceptPendingChat = async (chatId) => {
    try {
      await assignChat(chatId, 'me');

      const updatedChat = chatSessions.find((chat) => chat.chatId === chatId);
      if (updatedChat) {
        setOpenChats((prev) => new Set([...prev, chatId]));
        setSelectedChat(updatedChat);
        loadChatMessages(chatId);
      }

      setPendingChats((prev) => prev.filter((chat) => chat.chatId !== chatId));
    } catch (error) {
      message.error('Failed to accept chat request');
      console.error('Accept pending chat error:', error);
    }
  };

  // Send reply
  const handleSendReply = async () => {
    if (!selectedChat || !replyMessage.trim()) return;

    try {
      await sendMessage(selectedChat.chatId, replyMessage);
      setReplyMessage('');
      loadChatMessages(selectedChat.chatId);
      loadChatSessions();
    } catch (error) {
      message.error('Failed to send message');
    }
  };

  // Check if current user can reply to selected chat
  const canReplyToChat = () => {
    if (!selectedChat || !user) return false;
    return user.role === 'super_admin';
  };

  // Auto-refresh messages every 10 seconds when chat is selected
  useEffect(() => {
    if (!selectedChat) return;

    const interval = setInterval(() => {
      loadChatMessages(selectedChat.chatId);
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedChat]);

  // Toggle chat open/close
  const toggleChat = (chatId) => {
    setOpenChats((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
        if (selectedChat?.chatId === chatId) {
          setSelectedChat(null);
          setReplayMode(false);
          setIsPlaying(false);
          clearInterval(replayIntervalRef.current);
        }
      } else {
        newSet.add(chatId);
      }
      return newSet;
    });
  };

  // Select chat
  const selectChat = (chat) => {
    if (openChats.has(chat.chatId)) {
      setSelectedChat(chat);
      setReplayMode(false);
      setIsPlaying(false);
      clearInterval(replayIntervalRef.current);
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
      updateAuditFilters({ action: 'chat_management', limit: 50 });
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
      updateAuditFilters({ action: 'chat_management', limit: 50 });
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
      updateAuditFilters({ action: 'chat_management', limit: 50 });
    } catch (error) {
      message.error('Failed to reopen chat');
    }
  };

  // Load audit logs on component mount - handled by useAuditLogs hook

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
                  p.user.avatar
                    ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${p.user.avatar}`
                    : undefined
                }
                icon={<UserOutlined />}
              >
                {p.user.firstName?.[0]}
                {p.user.lastName?.[0]}
              </Avatar>
              <div>
                <Text strong>
                  {p.user.firstName} {p.user.lastName}
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
          <Dropdown
            menu={{
              items: [
                {
                  key: 'history',
                  icon: <HistoryOutlined />,
                  label: 'View Full History',
                  onClick: () => {
                    setSelectedChat(record);
                    setShowFullHistory(true);
                    loadChatMessages(record.chatId);
                  }
                },
                {
                  key: 'replay',
                  icon: <PlayCircleOutlined />,
                  label: 'Start Replay',
                  onClick: () => startReplay(record.chatId)
                }
              ]
            }}
          >
            <Button size="small" icon={<EyeOutlined />}>
              More
            </Button>
          </Dropdown>
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
              onClick={() => assignChat(record.chatId, 'me')}
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
    <div>
      <style>
        {`
          .open-chat-row {
            background-color: #f6ffed !important;
            border-left: 3px solid #52c41a;
          }
          .open-chat-row:hover {
            background-color: #f0f9ea !important;
          }
          .replay-message {
            opacity: 0.6;
            transition: opacity 0.3s ease;
          }
          .replay-message.active {
            opacity: 1;
            background-color: #e6f7ff;
          }
        `}
      </style>

      {/* Access Control Warning */}
      {user?.role !== 'super_admin' && (
        <Alert
          message="Access Restricted"
          description="This page requires super admin privileges."
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Title level={2} style={{ margin: 0 }}>
            <LockOutlined /> Super Admin Chat Management
          </Title>
          <Text type="secondary">
            Advanced chat oversight and management for super administrators
          </Text>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Open chats: {openChats.size} | Total chats: {chatSessions.length}
            </Text>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <Space style={{ float: 'right' }}>
            <Button onClick={loadChatSessions} loading={loading}>
              Refresh
            </Button>
            <Button
              onClick={() => {
                setOpenChats(new Set());
                setSelectedChat(null);
                setReplayMode(false);
                setIsPlaying(false);
                clearInterval(replayIntervalRef.current);
              }}
              disabled={openChats.size === 0}
            >
              Close All
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Pending Chat Requests */}
        {pendingChats.length > 0 && (
          <Col xs={24}>
            <Card
              title={
                <Space>
                  <ClockCircleOutlined />
                  Pending Chat Requests ({pendingChats.length})
                </Space>
              }
              style={{ marginBottom: 16 }}
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
                              ?.user.avatar
                              ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${chat.participants.find((p) => p.role !== 'admin').user.avatar}`
                              : undefined
                          }
                          icon={<UserOutlined />}
                        >
                          {
                            chat.participants.find((p) => p.role !== 'admin')
                              ?.user.firstName?.[0]
                          }
                          {
                            chat.participants.find((p) => p.role !== 'admin')
                              ?.user.lastName?.[0]
                          }
                        </Avatar>
                      }
                      title={
                        <Text strong>
                          {
                            chat.participants.find((p) => p.role !== 'admin')
                              ?.user.firstName
                          }{' '}
                          {
                            chat.participants.find((p) => p.role !== 'admin')
                              ?.user.lastName
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
          <Card>
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
              }}
              scroll={{ x: 800 }}
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
                <Space>
                  <MessageOutlined />
                  <span>
                    Chat with{' '}
                    {
                      selectedChat.participants.find((p) => p.role !== 'admin')
                        ?.user.firstName
                    }
                  </span>
                  <Tag
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
                  {replayMode && (
                    <Tag color="geekblue">
                      <PlayCircleOutlined /> REPLAY MODE
                    </Tag>
                  )}
                </Space>
              }
              extra={
                <Space>
                  {!replayMode && (
                    <>
                      <Tooltip title="Start Replay">
                        <Button
                          icon={<PlayCircleOutlined />}
                          onClick={() => startReplay(selectedChat.chatId)}
                        />
                      </Tooltip>
                      <Tooltip title="Export Chat">
                        <Button
                          icon={<DownloadOutlined />}
                          onClick={exportReplay}
                        />
                      </Tooltip>
                    </>
                  )}
                  {selectedChat.status === 'assigned' && (
                    <Button
                      type="primary"
                      size="small"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleResolveChat(selectedChat.chatId)}
                    >
                      Resolve
                    </Button>
                  )}
                  {selectedChat.status === 'resolved' && (
                    <Button
                      type="default"
                      size="small"
                      icon={<ClockCircleOutlined />}
                      onClick={() => handleReopenChat(selectedChat.chatId)}
                    >
                      Reopen Chat
                    </Button>
                  )}
                  <Button
                    danger
                    size="small"
                    onClick={() => handleCloseChat(selectedChat.chatId)}
                  >
                    Close Chat
                  </Button>
                </Space>
              }
              bodyStyle={{ padding: 0 }}
            >
              {/* Replay Controls */}
              {replayMode && (
                <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', backgroundColor: '#fafafa' }}>
                  <Row gutter={[16, 16]} align="middle">
                    <Col>
                      <Button
                        type={isPlaying ? 'default' : 'primary'}
                        icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                        onClick={toggleReplay}
                      >
                        {isPlaying ? 'Pause' : 'Play'}
                      </Button>
                    </Col>
                    <Col>
                      <Space>
                        <Text>Speed:</Text>
                        <Select value={replaySpeed} onChange={changeReplaySpeed} style={{ width: 80 }}>
                          <Option value={0.5}>0.5x</Option>
                          <Option value={1}>1x</Option>
                          <Option value={2}>2x</Option>
                          <Option value={4}>4x</Option>
                        </Select>
                      </Space>
                    </Col>
                    <Col flex="auto">
                      <Slider
                        min={0}
                        max={replayMessages.length - 1}
                        value={replayIndex}
                        onChange={setReplayIndex}
                        tooltip={{ formatter: (value) => `Message ${value + 1}` }}
                      />
                    </Col>
                    <Col>
                      <Text type="secondary">
                        {replayIndex + 1} / {replayMessages.length}
                      </Text>
                    </Col>
                    <Col>
                      <Button
                        onClick={() => {
                          setReplayMode(false);
                          setIsPlaying(false);
                          clearInterval(replayIntervalRef.current);
                        }}
                      >
                        Exit Replay
                      </Button>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Messages Container */}
              <div
                style={{
                  height: replayMode ? 'calc(100vh - 300px)' : 'calc(100vh - 200px)',
                  overflowY: 'auto',
                  padding: '16px',
                  backgroundColor: '#fafafa',
                }}
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
                  (replayMode ? replayMessages.slice(0, replayIndex + 1) : chatMessages).map((message, index) => {
                    const isCurrentUser = message.sender._id === user?._id;

                    return (
                      <div
                        key={message._id}
                        className={replayMode ? `replay-message ${index === replayIndex ? 'active' : ''}` : ''}
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
                                message.sender.avatar
                                  ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${message.sender.avatar}`
                                  : undefined
                              }
                              icon={<UserOutlined />}
                              style={{ backgroundColor: '#1890ff' }}
                            >
                              {message.sender.firstName?.[0]}
                              {message.sender.lastName?.[0]}
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
                                {new Date(message.timestamp).toLocaleString(
                                  [],
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
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
              {!replayMode && (
                <div
                  style={{
                    borderTop: '1px solid #f0f0f0',
                    padding: '16px',
                    backgroundColor: '#fff',
                  }}
                >
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
                        <div style={{ display: 'flex', gap: 8 }}>
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
                            style={{ flex: 1 }}
                          />
                          <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleSendReply}
                            disabled={!replyMessage.trim()}
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
                          <Text>You can reply to any chat as Super Admin</Text>
                        </div>
                      )}
                  </Space>
                </div>
              )}
            </Card>
          </Col>
        )}
      </Row>

      {/* Full History Modal */}
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            Complete Chat History
            {selectedChat && (
              <Tag>
                Chat ID: {selectedChat.chatId}
              </Tag>
            )}
          </Space>
        }
        open={showFullHistory}
        onCancel={() => setShowFullHistory(false)}
        width={800}
        footer={[
          <Button key="export" icon={<DownloadOutlined />} onClick={exportReplay}>
            Export History
          </Button>,
          <Button key="close" onClick={() => setShowFullHistory(false)}>
            Close
          </Button>,
        ]}
      >
        {selectedChat && (
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <Timeline>
              {chatMessages.map((message) => (
                <Timeline.Item
                  key={message._id}
                  color={message.senderRole === 'system' ? 'blue' : 'green'}
                >
                  <Card size="small">
                    <Space direction="vertical" size={0}>
                      <Text strong>
                        {message.sender.firstName} {message.sender.lastName}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {new Date(message.timestamp).toLocaleString()} • {message.senderRole}
                      </Text>
                      <Text style={{ whiteSpace: 'pre-wrap' }}>
                        {message.message}
                      </Text>
                    </Space>
                  </Card>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChatManagement;