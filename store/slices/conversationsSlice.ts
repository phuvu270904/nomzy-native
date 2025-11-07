import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ConversationUser {
  id: number;
  name: string;
  email?: string;
  photo?: string;
  role: "user" | "driver" | "restaurant";
}

export interface ConversationMessage {
  id: number;
  conversationId: number;
  senderId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: ConversationUser;
}

export interface Conversation {
  id: number;
  user1Id: number;
  user2Id: number;
  lastMessageText: string | null;
  lastMessageTime: string | null;
  unreadCount?: number;
  user1?: ConversationUser;
  user2?: ConversationUser;
  createdAt: string;
  updatedAt: string;
}

interface TypingStatus {
  conversationId: number;
  userId: number;
  isTyping: boolean;
}

interface ConversationsState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // Conversations list
  conversations: Conversation[];
  isLoadingConversations: boolean;

  // Active conversation
  activeConversationId: number | null;
  messages: Record<number, ConversationMessage[]>; // conversationId -> messages
  isLoadingMessages: Record<number, boolean>;

  // Typing indicators
  typingUsers: TypingStatus[];

  // Online users
  onlineUsers: number[];
}

const initialState: ConversationsState = {
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  conversations: [],
  isLoadingConversations: false,
  activeConversationId: null,
  messages: {},
  isLoadingMessages: {},
  typingUsers: [],
  onlineUsers: [],
};

const conversationsSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    // Connection actions
    setConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
      if (action.payload) {
        state.connectionError = null;
      }
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      state.isConnecting = false;
      if (action.payload) {
        state.connectionError = null;
      }
    },
    setConnectionError: (state, action: PayloadAction<string | null>) => {
      state.connectionError = action.payload;
      state.isConnecting = false;
    },

    // Conversations actions
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
      state.isLoadingConversations = false;
    },
    setLoadingConversations: (state, action: PayloadAction<boolean>) => {
      state.isLoadingConversations = action.payload;
    },
    addConversation: (state, action: PayloadAction<Conversation>) => {
      const exists = state.conversations.find(
        (c) => c.id === action.payload.id
      );
      if (!exists) {
        state.conversations.unshift(action.payload);
      }
    },
    updateConversation: (state, action: PayloadAction<Conversation>) => {
      const index = state.conversations.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.conversations[index] = action.payload;
      }
    },
    updateConversationLastMessage: (
      state,
      action: PayloadAction<{
        conversationId: number;
        lastMessageText: string;
        lastMessageTime: string;
      }>
    ) => {
      const index = state.conversations.findIndex(
        (c) => c.id === action.payload.conversationId
      );
      if (index !== -1) {
        state.conversations[index].lastMessageText =
          action.payload.lastMessageText;
        state.conversations[index].lastMessageTime =
          action.payload.lastMessageTime;
        // Move to top
        const [conversation] = state.conversations.splice(index, 1);
        state.conversations.unshift(conversation);
      }
    },

    // Active conversation actions
    setActiveConversation: (state, action: PayloadAction<number | null>) => {
      state.activeConversationId = action.payload;
    },

    // Messages actions
    setMessages: (
      state,
      action: PayloadAction<{ conversationId: number; messages: ConversationMessage[] }>
    ) => {
      state.messages[action.payload.conversationId] = action.payload.messages;
      state.isLoadingMessages[action.payload.conversationId] = false;
    },
    setLoadingMessages: (
      state,
      action: PayloadAction<{ conversationId: number; isLoading: boolean }>
    ) => {
      state.isLoadingMessages[action.payload.conversationId] =
        action.payload.isLoading;
    },
    addMessage: (state, action: PayloadAction<ConversationMessage>) => {
      const conversationId = action.payload.conversationId;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      // Check if message already exists
      const exists = state.messages[conversationId].find(
        (m) => m.id === action.payload.id
      );
      if (!exists) {
        state.messages[conversationId].push(action.payload);
      }
    },
    prependMessages: (
      state,
      action: PayloadAction<{ conversationId: number; messages: ConversationMessage[] }>
    ) => {
      const conversationId = action.payload.conversationId;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId] = [
        ...action.payload.messages,
        ...state.messages[conversationId],
      ];
    },
    markMessagesAsRead: (
      state,
      action: PayloadAction<{ conversationId: number; readBy: number }>
    ) => {
      const conversationId = action.payload.conversationId;
      const messages = state.messages[conversationId];
      if (messages) {
        messages.forEach((msg) => {
          if (msg.senderId !== action.payload.readBy) {
            msg.isRead = true;
          }
        });
      }
      // Update unread count in conversation
      const conversation = state.conversations.find(
        (c) => c.id === conversationId
      );
      if (conversation) {
        conversation.unreadCount = 0;
      }
    },

    // Typing actions
    setUserTyping: (state, action: PayloadAction<TypingStatus>) => {
      const index = state.typingUsers.findIndex(
        (t) =>
          t.conversationId === action.payload.conversationId &&
          t.userId === action.payload.userId
      );
      if (action.payload.isTyping) {
        if (index === -1) {
          state.typingUsers.push(action.payload);
        } else {
          state.typingUsers[index] = action.payload;
        }
      } else {
        if (index !== -1) {
          state.typingUsers.splice(index, 1);
        }
      }
    },

    // Online users actions
    setUserOnline: (state, action: PayloadAction<number>) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    setUserOffline: (state, action: PayloadAction<number>) => {
      state.onlineUsers = state.onlineUsers.filter(
        (id) => id !== action.payload
      );
    },

    // Clear actions
    clearMessages: (state, action: PayloadAction<number>) => {
      delete state.messages[action.payload];
    },
    clearAll: (state) => {
      return initialState;
    },
  },
});

export const {
  setConnecting,
  setConnected,
  setConnectionError,
  setConversations,
  setLoadingConversations,
  addConversation,
  updateConversation,
  updateConversationLastMessage,
  setActiveConversation,
  setMessages,
  setLoadingMessages,
  addMessage,
  prependMessages,
  markMessagesAsRead,
  setUserTyping,
  setUserOnline,
  setUserOffline,
  clearMessages,
  clearAll,
} = conversationsSlice.actions;

export default conversationsSlice.reducer;

// Selectors
export const selectIsConnected = (state: any) =>
  state.conversations.isConnected;
export const selectConversations = (state: any) =>
  state.conversations.conversations;
export const selectActiveConversationId = (state: any) =>
  state.conversations.activeConversationId;
export const selectMessages = (conversationId: number) => (state: any) =>
  state.conversations.messages[conversationId] || [];
export const selectTypingUsers = (conversationId: number) => (state: any) =>
  state.conversations.typingUsers.filter(
    (t: TypingStatus) => t.conversationId === conversationId
  );
export const selectOnlineUsers = (state: any) =>
  state.conversations.onlineUsers;
