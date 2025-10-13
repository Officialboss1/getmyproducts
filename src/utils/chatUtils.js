/**
 * Chat utility functions for deduplication and state management
 */

// Deduplicate array of objects by a key
export const deduplicateByKey = (array, key) => {
  return Array.from(new Map(array.map((item) => [item[key], item])).values());
};

// Deduplicate messages by _id
export const deduplicateMessages = (messages) => {
  return deduplicateByKey(messages, '_id');
};

// Deduplicate chat sessions by chatId
export const deduplicateChatSessions = (chatSessions) => {
  return deduplicateByKey(chatSessions, 'chatId');
};

// Update chat list with deduplication - merge incoming data safely
export const updateChatList = (existingChats, incomingChat) => {
  const existingIndex = existingChats.findIndex(
    (chat) => chat.chatId === incomingChat.chatId
  );

  if (existingIndex >= 0) {
    // Update existing chat
    const updated = [...existingChats];
    updated[existingIndex] = { ...updated[existingIndex], ...incomingChat };
    return updated;
  } else {
    // Add new chat
    return [...existingChats, incomingChat];
  }
};

// Update message list with deduplication - merge incoming data safely
export const updateMessageList = (existingMessages, incomingMessage) => {
  // Check if message already exists
  if (existingMessages.some((msg) => msg._id === incomingMessage._id)) {
    return existingMessages;
  }

  // Add new message
  return [...existingMessages, incomingMessage];
};
