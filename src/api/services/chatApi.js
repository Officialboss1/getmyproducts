import { api } from './api';

/**
 * Chat API
 * ----------------------------------------
 * Handles real-time chat functionality between users and admins
 */

export const chatAPI = {
  // Create or get chat session with another user
  createOrGetChatSession: (userId, isSupportChat = false) => {
    const payload = {};
    if (isSupportChat) {
      payload.isSupportChat = true;
    } else {
      payload.userId = userId;
    }
    return api.post('/chat/session', payload);
  },

  // Send a message
  sendMessage: (chatId, message, messageType = 'text') =>
    api.post('/chat/message', { chatId, message, messageType }),

  // Get chat messages
  getChatMessages: (chatId, params = {}) =>
    api.get(`/chat/${chatId}/messages`, { params }),

  // Get user's chat sessions
  getUserChatSessions: (params = {}) =>
    api.get('/chat/sessions/user', { params }),

  // Get all chat sessions (admin only)
  getAllChatSessions: (params = {}) => api.get('/chat/sessions', { params }),

  // Assign chat to admin
  assignChat: (chatId, adminId) =>
    api.put(`/chat/${chatId}/assign`, { adminId }),

  // Resolve chat session
  resolveChat: (chatId) => api.put(`/chat/${chatId}/resolve`),

  // Reopen chat session
  reopenChat: (chatId) => api.put(`/chat/${chatId}/reopen`),

  // Mark messages as read
  markMessagesAsRead: (chatId) => api.put(`/chat/${chatId}/read`),

  // Get available admins for chat assignment
  getAvailableAdmins: () => api.get('/users?role=admin'),

  // Get user's active chat session (for restoration after refresh)
  getActiveChatSession: () => api.get('/chat/active'),
};

export default chatAPI;
