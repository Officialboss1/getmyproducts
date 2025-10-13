import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Drawer,
  Input,
  Avatar,
  Typography,
  Space,
  message,
  Divider,
  Card,
  Spin,
} from 'antd';
import {
  MessageOutlined,
  SendOutlined,
  CloseOutlined,
  UserOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useChat } from '../hooks/useChat';
import { useUser } from '../contexts/App';

const { Text, Title } = Typography;
const { TextArea } = Input;

const LiveChatSupport = () => {
  const { user } = useUser();
  const {
    currentChat,
    messages,
    loading,
    error,
    startSupportChat,
    sendMessage,
    closeChat,
  } = useChat();

  const [visible, setVisible] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /** ✅ Production-ready message handler **/
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    console.log(
      '[DEBUG] handleSendMessage called with input:',
      inputMessage.trim()
    );
    setIsTyping(true);

    try {
      let activeChat = currentChat;
      console.log('[DEBUG] Current chat state:', {
        currentChat: !!currentChat,
        chatId: currentChat?.chatId,
        status: currentChat?.status,
        chatStarted,
      });

      // If no active chat, start a new one
      if (!activeChat || !chatStarted) {
        console.log(
          '[DEBUG] No active chat found, starting new chat session...'
        );
        const newChat = await startSupportChat();
        console.log(
          '[DEBUG] New chat session started:',
          newChat.chatId,
          'status:',
          newChat.status
        );

        if (!newChat || !newChat.chatId) {
          console.error('[DEBUG] Failed to initialize a new chat session');
          message.error('Failed to start chat. Please try again.');
          setIsTyping(false);
          return;
        }

        activeChat = newChat;
        setChatStarted(true);
      }

      // Backend guarantees chat is ready for messaging
      console.log('[DEBUG] Sending message to chat:', {
        chatId: activeChat.chatId,
        message: inputMessage.trim(),
      });
      await sendMessage(activeChat.chatId, inputMessage.trim());
      console.log(
        '[DEBUG] Message sent successfully to chat:',
        activeChat.chatId
      );

      setInputMessage('');
    } catch (err) {
      console.error('[DEBUG] Error sending message:', err);
      message.error('Unable to send message. Please check your connection.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTelegramRedirect = () => {
    const telegramUrl = 'https://t.me/applecredit0xbot';
    window.open(telegramUrl, '_blank');
    message.success('Opening Telegram support chat...');
    setVisible(false);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined />}
          onClick={() => setVisible(true)}
          style={{
            width: 60,
            height: 60,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: 'none',
          }}
        />
      </div>

      {/* Chat Drawer */}
      <Drawer
        title={
          <Space>
            <MessageOutlined />
            <span>
              {currentChat ? 'Support Chat' : 'Live Support Chat'}
              {currentChat?.status && (
                <Text
                  type={
                    currentChat.status === 'open'
                      ? 'warning'
                      : currentChat.status === 'assigned'
                        ? 'success'
                        : currentChat.status === 'resolved'
                          ? 'success'
                          : 'secondary'
                  }
                  style={{ fontSize: '12px', marginLeft: 8 }}
                >
                  ({currentChat.status})
                </Text>
              )}
            </span>
          </Space>
        }
        placement="right"
        onClose={() => setVisible(false)}
        open={visible}
        width={window.innerWidth < 768 ? '100%' : 400}
        bodyStyle={{ padding: 0 }}
        headerStyle={{
          borderBottom: '1px solid #f0f0f0',
          padding: '16px',
        }}
        extra={
          <Space>
            {currentChat &&
              currentChat.status !== 'closed' &&
              currentChat.status !== 'resolved' && (
                <Button
                  type="text"
                  size="small"
                  onClick={async () => {
                    try {
                      await closeChat(currentChat.chatId);
                      message.success('Chat closed successfully');
                    } catch (err) {
                      message.error('Failed to close chat');
                    }
                  }}
                >
                  Close Chat
                </Button>
              )}
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setVisible(false)}
            />
          </Space>
        }
      >
        {/* Messages Container */}
        <div
          style={{
            height: 'calc(100vh - 140px)',
            overflowY: 'auto',
            padding: '16px',
            backgroundColor: '#fafafa',
          }}
        >
          {loading && messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Loading chat...</Text>
              </div>
            </div>
          )}

          {!chatStarted && messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Avatar
                size={48}
                icon={<MessageOutlined />}
                style={{ backgroundColor: '#1890ff', marginBottom: 16 }}
              />
              <Title level={5} style={{ marginBottom: 8 }}>
                Start a Support Chat
              </Title>
              <Text type="secondary">
                Connect with our support team for personalized assistance
              </Text>
            </div>
          )}

          {messages.map((msg) => {
            const isCurrentUser = msg.sender._id === user?._id;

            return (
              <div
                key={msg._id || `msg-${Date.now()}-${Math.random()}`}
                style={{
                  display: 'flex',
                  justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
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
                      icon={<UserOutlined />}
                      style={{ backgroundColor: '#1890ff' }}
                    />
                  )}
                  <Card
                    size="small"
                    style={{
                      backgroundColor: isCurrentUser ? '#1890ff' : '#fff',
                      border: isCurrentUser ? 'none' : '1px solid #f0f0f0',
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
                      {msg.message}
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
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </div>
                  </Card>
                  {isCurrentUser && (
                    <Avatar
                      size="small"
                      icon={<UserOutlined />}
                      style={{ backgroundColor: '#52c41a' }}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Avatar
                size="small"
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff' }}
              />
              <Card size="small" bodyStyle={{ padding: '8px 12px' }}>
                <Text type="secondary" style={{ fontStyle: 'italic' }}>
                  Typing...
                </Text>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            borderTop: '1px solid #f0f0f0',
            padding: '16px',
            backgroundColor: '#fff',
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {currentChat?.status === 'resolved' && (
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
                  This chat has been resolved. You can start a new one if you
                  need help again.
                </Text>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <TextArea
                placeholder={
                  currentChat?.status === 'resolved'
                    ? 'Type a message to start a new chat...'
                    : 'Type your message...'
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                autoSize={{ minRows: 1, maxRows: 3 }}
                style={{ flex: 1 }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
              >
                {currentChat?.status === 'resolved' ? 'Start New Chat' : 'Send'}
              </Button>
            </div>

            <Divider style={{ margin: '8px 0' }} />

            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Need immediate help?
              </Text>
              <br />
              <Button
                type="link"
                size="small"
                onClick={handleTelegramRedirect}
                style={{ padding: 0, fontSize: '12px' }}
              >
                Connect with Telegram Support Bot
              </Button>
            </div>
          </Space>
        </div>
      </Drawer>
    </>
  );
};

export default LiveChatSupport;

