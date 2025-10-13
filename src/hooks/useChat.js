import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { chatAPI } from '../src/../api/services/chatApi';
import { useUser } from '../contexts/App';
import {
  deduplicateMessages,
  deduplicateChatSessions,
  updateChatList,
  updateMessageList,
} from '../utils/chatUtils';

export const useChat = () => {
  const { user } = useUser();
  const [chatSessions, setChatSessions] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());

  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user) return;

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    socketRef.current = io(socketUrl, {
      auth: {
        token: localStorage.getItem('token'), // Assuming JWT token is stored here
      },
      transports: ['websocket', 'polling'],
      forceNew: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    socket.on('new-message', (data) => {
      const { message, chatSession } = data;
      console.log('[DEBUG] Received new-message event:', {
        messageId: message._id,
        chatId: message.chatId,
        currentChatId: currentChat?.chatId,
      });

      // Update messages if it's the current chat - deduplicate
      if (currentChat && currentChat.chatId === message.chatId) {
        setMessages((prev) => {
          // Avoid duplicates by checking _id
          if (prev.some((m) => m._id === message._id)) {
            console.log(
              '[DEBUG] Duplicate message detected, skipping:',
              message._id
            );
            return prev;
          }
          console.log('[DEBUG] Adding new message to UI:', message._id);
          return [...prev, message];
        });
      }

      // Update chat sessions silently with deduplication using utility function
      setChatSessions((prev) => {
        const updated = updateChatList(prev, {
          ...chatSession,
          lastMessage: chatSession.lastMessage,
          unreadCount: chatSession.unreadCount,
          status: chatSession.status,
        });

        console.log(
          '[DEBUG] Chat sessions updated silently for chat:',
          chatSession.chatId,
          'total chats:',
          updated.length
        );
        return updated;
      });

      // Update current chat status if it's the active chat
      if (currentChat && currentChat.chatId === chatSession.chatId) {
        setCurrentChat((prev) => ({
          ...prev,
          status: chatSession.status,
          lastMessage: chatSession.lastMessage,
          unreadCount: chatSession.unreadCount,
        }));
        console.log(
          '[DEBUG] Current chat status updated silently:',
          chatSession.status
        );
      }
    });

    socket.on('user-typing', (data) => {
      const { userId, isTyping } = data;
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);

      // Attempt to reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.connect();
        }
      }, 5000);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user, currentChat]);

  // Join/leave chat rooms when current chat changes
  useEffect(() => {
    if (!socketRef.current || !isConnected) return;

    const socket = socketRef.current;

    // Leave previous chat room
    if (currentChat?.chatId) {
      socket.emit('leave-chat', currentChat.chatId);
    }

    // Join new chat room
    if (currentChat?.chatId) {
      socket.emit('join-chat', currentChat.chatId);
    }
  }, [currentChat?.chatId, isConnected]);

  // Load user's chat sessions
  const loadChatSessions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const response = await chatAPI.getUserChatSessions();

      // Deduplicate chat sessions by chatId using utility function
      const uniqueChats = deduplicateChatSessions(
        response.data.chatSessions || []
      );

      console.log(
        '[DEBUG] Loaded and deduplicated chat sessions:',
        uniqueChats.length
      );
      setChatSessions(uniqueChats);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to load chat sessions';
      setError(errorMessage);
      console.error('Load chat sessions error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create or get chat session with another user
  const createOrGetChatSession = useCallback(
    async (targetUserId, isSupportChat = false) => {
      try {
        setLoading(true);
        setError(null);
        const response = await chatAPI.createOrGetChatSession(
          targetUserId,
          isSupportChat
        );
        const { chatSession, chatId } = response.data;

        // Add to chat sessions with deduplication using utility function
        setChatSessions((prev) => {
          const updated = updateChatList(prev, chatSession);
          console.log(
            '[DEBUG] Chat session added/updated in list:',
            chatId,
            'total chats:',
            updated.length
          );
          return updated;
        });

        setCurrentChat(chatSession);
        return chatSession;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || 'Failed to create chat session';
        setError(errorMessage);
        console.error('Create chat session error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load messages for a chat
  const loadMessages = useCallback(async (chatId) => {
    if (!chatId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await chatAPI.getChatMessages(chatId);

      // Deduplicate messages by _id using utility function
      const uniqueMessages = deduplicateMessages(response.data.messages || []);

      console.log(
        '[DEBUG] Loaded and deduplicated messages for chat:',
        chatId,
        'count:',
        uniqueMessages.length
      );
      setMessages(uniqueMessages);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to load messages';
      setError(errorMessage);
      console.error('Load messages error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(
    async (chatId, message, messageType = 'text') => {
      console.log('[DEBUG] useChat.sendMessage called with:', {
        chatId,
        message,
        messageType,
      });
      try {
        setError(null);
        console.log('[DEBUG] Calling chatAPI.sendMessage...');
        const response = await chatAPI.sendMessage(
          chatId,
          message,
          messageType
        );
        console.log('[DEBUG] chatAPI.sendMessage response:', response);
        const newMessage = response.data.message;
        console.log('[DEBUG] New message from API:', newMessage);

        // Add message to local state immediately for better UX - deduplicate using utility
        setMessages((prev) => updateMessageList(prev, newMessage));

        // Update chat session's last message
        setChatSessions((prev) =>
          prev.map((session) =>
            session.chatId === chatId
              ? { ...session, lastMessage: new Date() }
              : session
          )
        );

        // Emit typing stop
        if (socketRef.current && isConnected) {
          console.log('[DEBUG] Emitting typing stop event');
          socketRef.current.emit('typing', {
            chatId,
            userId: user._id,
            isTyping: false,
          });
        }

        console.log('[DEBUG] useChat.sendMessage completed successfully');
        return newMessage;
      } catch (err) {
        console.error('[DEBUG] Send message error:', err);
        const errorMessage =
          err.response?.data?.message || 'Failed to send message';
        setError(errorMessage);
        throw err;
      }
    },
    [user, isConnected]
  );

  // Handle typing indicator
  const setTyping = useCallback(
    (isTyping) => {
      if (!socketRef.current || !isConnected || !currentChat || !user) return;

      socketRef.current.emit('typing', {
        chatId: currentChat.chatId,
        userId: user._id,
        isTyping,
      });
    },
    [currentChat, user, isConnected]
  );

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (chatId) => {
    try {
      setError(null);
      await chatAPI.markMessagesAsRead(chatId);

      // Update local state
      setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })));

      // Update chat session unread count
      setChatSessions((prev) =>
        prev.map((session) =>
          session.chatId === chatId ? { ...session, unreadCount: 0 } : session
        )
      );
    } catch (err) {
      console.error('Mark messages as read error:', err);
      // Don't set error for this operation as it's not critical
    }
  }, []);

  // Close chat session (deprecated - use resolveChat instead)
  const closeChat = useCallback(
    async (chatId) => {
      try {
        setError(null);
        await chatAPI.resolveChat(chatId);

        // Update chat session status to resolved
        setChatSessions((prev) =>
          prev.map((session) =>
            session.chatId === chatId
              ? { ...session, status: 'resolved' }
              : session
          )
        );

        if (currentChat?.chatId === chatId) {
          setCurrentChat((prev) => ({ ...prev, status: 'resolved' }));
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || 'Failed to resolve chat';
        setError(errorMessage);
        console.error('Resolve chat error:', err);
        throw err;
      }
    },
    [currentChat]
  );

  // Resolve chat session
  const resolveChat = useCallback(
    async (chatId) => {
      try {
        setError(null);
        await chatAPI.resolveChat(chatId);

        // Update chat session status to resolved
        setChatSessions((prev) =>
          prev.map((session) =>
            session.chatId === chatId
              ? { ...session, status: 'resolved' }
              : session
          )
        );

        if (currentChat?.chatId === chatId) {
          setCurrentChat((prev) => ({ ...prev, status: 'resolved' }));
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || 'Failed to resolve chat';
        setError(errorMessage);
        console.error('Resolve chat error:', err);
        throw err;
      }
    },
    [currentChat]
  );

  // Reopen chat session
  const reopenChat = useCallback(
    async (chatId) => {
      try {
        setError(null);
        await chatAPI.reopenChat(chatId);

        // Update chat session status to reopened
        setChatSessions((prev) =>
          prev.map((session) =>
            session.chatId === chatId
              ? { ...session, status: 'reopened' }
              : session
          )
        );

        if (currentChat?.chatId === chatId) {
          setCurrentChat((prev) => ({ ...prev, status: 'reopened' }));
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || 'Failed to reopen chat';
        setError(errorMessage);
        console.error('Reopen chat error:', err);
        throw err;
      }
    },
    [currentChat]
  );

  // Select a chat
  const selectChat = useCallback(
    async (chatSession) => {
      setCurrentChat(chatSession);
      await loadMessages(chatSession.chatId);
      await markMessagesAsRead(chatSession.chatId);
    },
    [loadMessages, markMessagesAsRead]
  );

  // Start chat with support (auto-connect to admin)
  const startSupportChat = useCallback(async () => {
    console.log('[DEBUG] startSupportChat called - creating new chat session');
    try {
      setError(null);
      // The backend will create a new unique chat session
      console.log(
        '[DEBUG] Calling createOrGetChatSession for new support chat'
      );
      const chatSession = await createOrGetChatSession(null, true); // null userId, isSupportChat = true
      console.log(
        '[DEBUG] New support chat session created:',
        chatSession.chatId,
        'status:',
        chatSession.status
      );

      // Clear any existing messages and set new chat to prevent duplicates
      setMessages([]);
      setCurrentChat(chatSession);

      console.log('[DEBUG] Loading messages for new chat:', chatSession.chatId);
      await loadMessages(chatSession.chatId);
      console.log(
        '[DEBUG] startSupportChat completed successfully - new chat ready with clean state'
      );
      return chatSession;
    } catch (err) {
      console.error('[DEBUG] Start support chat error:', err);
      throw err;
    }
  }, [createOrGetChatSession, loadMessages]);

  // Load chat sessions on mount
  useEffect(() => {
    if (user) {
      loadChatSessions();
    }
  }, [user, loadChatSessions]);

  // Restore active chat session on mount/refresh
  useEffect(() => {
    const restoreActiveChat = async () => {
      if (!user) return;

      try {
        console.log('[DEBUG] Checking for active chat session to restore...');
        const response = await chatAPI.getActiveChatSession();
        const { hasActiveChat, chatSession } = response.data;

        if (hasActiveChat && chatSession) {
          console.log(
            '[DEBUG] Restoring active chat session:',
            chatSession.chatId,
            'status:',
            chatSession.status
          );

          // Clear any existing state first to prevent duplicates
          setMessages([]);
          setCurrentChat(chatSession);

          await loadMessages(chatSession.chatId);
          console.log(
            '[DEBUG] Active chat session restored successfully - UI updated silently'
          );
        } else {
          console.log('[DEBUG] No active chat session to restore');
        }
      } catch (error) {
        console.error('[DEBUG] Failed to restore active chat session:', error);
        // Don't set error state for this - it's not critical
      }
    };

    restoreActiveChat();
  }, [user]); // Only run when user changes (login/logout)

  return {
    // State
    chatSessions,
    currentChat,
    messages,
    loading,
    error,
    isConnected,
    typingUsers,

    // Actions
    loadChatSessions,
    createOrGetChatSession,
    loadMessages,
    sendMessage,
    markMessagesAsRead,
    closeChat,
    resolveChat,
    reopenChat,
    selectChat,
    startSupportChat,
    setTyping,

    // Utilities
    clearError: () => setError(null),
  };
};




