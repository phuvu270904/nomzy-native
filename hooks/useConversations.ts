/**
 * useConversations Hook
 * 
 * Manages WebSocket connection to the conversations namespace for real-time chat.
 * Handles conversations list, messages, typing indicators, and online status.
 * 
 * Features:
 * - Auto-connect when user is authenticated
 * - Real-time message delivery
 * - Typing indicators
 * - Online/offline status
 * - Message read receipts
 * 
 * The socket connects to /conversations namespace with userId and role in query params.
 */

import { useAuth } from "@/hooks/useAuth";
import type { Conversation, ConversationMessage } from "@/store/slices/conversationsSlice";
import {
    addConversation,
    addMessage,
    clearAll,
    markMessagesAsRead,
    setConnected,
    setConnecting,
    setConnectionError,
    setConversations,
    setLoadingConversations,
    setLoadingMessages,
    setMessages,
    setUserOffline,
    setUserOnline,
    setUserTyping,
    updateConversationLastMessage,
} from "@/store/slices/conversationsSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// Get WebSocket base URL
const getSocketUrl = () => {
  if (!__DEV__) {
    return "wss://your-api-domain.com"; // Production URL
  }

  const { expoConfig } = Constants;
  if (expoConfig?.hostUri) {
    const ip = expoConfig.hostUri.split(":")[0];
    return `ws://${ip}:8190`;
  }

  return "ws://localhost:8190";
};

export interface UseConversationsReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  // Conversations
  conversations: Conversation[];
  isLoadingConversations: boolean;
  loadConversations: () => void;

  // Active conversation
  activeConversationId: number | null;
  messages: ConversationMessage[];
  isLoadingMessages: boolean;

  // Actions
  startConversation: (otherUserId: number) => void;
  joinConversation: (conversationId: number) => void;
  sendMessage: (conversationId: number, message: string) => void;
  loadMessages: (conversationId: number, limit?: number, offset?: number) => void;
  markAsRead: (conversationId: number) => void;
  sendTyping: (conversationId: number, isTyping: boolean) => void;

  // Typing users
  typingUsers: Array<{ userId: number; isTyping: boolean }>;

  // Online users
  onlineUsers: number[];

  // Manual connection control
  connect: () => Promise<boolean>;
  disconnect: () => void;
}

export const useConversations = (): UseConversationsReturn => {
  const { isAuthenticated, user } = useAuth();
  const dispatch = useAppDispatch();

  // Local socket state
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Get state from Redux
  const {
    isConnected,
    isConnecting,
    connectionError,
    conversations,
    isLoadingConversations,
    activeConversationId,
    messages: allMessages,
    isLoadingMessages: allLoadingMessages,
    typingUsers,
    onlineUsers,
  } = useAppSelector((state) => state.conversations);

  const userId = useRef<number | null>(null);
  const userRole = useRef<"user" | "driver" | "restaurant" | null>(null);
  const hasTriedAutoConnect = useRef(false);

  // Keep socketRef in sync with socket state
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  // Get messages for active conversation
  const messages = activeConversationId
    ? allMessages[activeConversationId] || []
    : [];

  const isLoadingMessages = activeConversationId
    ? allLoadingMessages[activeConversationId] || false
    : false;

  // Initialize user data
  const initUserData = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem("user_data");
      if (userData) {
        const parsedData = JSON.parse(userData);
        userId.current =
          typeof parsedData.user.id === "string"
            ? parseInt(parsedData.user.id)
            : parsedData.user.id;
        userRole.current = parsedData.user.role || "user";
        console.log("Conversations - User ID loaded:", userId.current, "Role:", userRole.current);
        return true;
      } else {
        console.log("Conversations - No user data found in AsyncStorage");
        return false;
      }
    } catch (error) {
      console.error("Conversations - Failed to get user data:", error);
      return false;
    }
  }, []);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    console.log("Setting up conversations socket event listeners");

    // Remove any existing listeners to avoid duplicates
    socket.off("conversations-loaded");
    socket.off("conversation-started");
    socket.off("joined-conversation");
    socket.off("new-message");
    socket.off("message-sent");
    socket.off("messages-loaded");
    socket.off("messages-read");
    socket.off("user-typing");
    socket.off("user-online");
    socket.off("user-offline");
    socket.off("error");

    // Conversations loaded
    socket.on("conversations-loaded", (data: { conversations: Conversation[] }) => {
      console.log("Conversations loaded:", data.conversations.length);
      dispatch(setConversations(data.conversations));
    });

    // Conversation started
    socket.on("conversation-started", (data: { conversation: Conversation }) => {
      console.log("Conversation started:", data.conversation.id);
      dispatch(addConversation(data.conversation));
      // Auto-join the new conversation
      socket.emit("join-conversation", { conversationId: data.conversation.id });
    });

    // Joined conversation
    socket.on("joined-conversation", (data: { conversationId: number }) => {
      console.log("Joined conversation:", data.conversationId);
    });

    // New message
    socket.on("new-message", (data: { conversationId: number; message: ConversationMessage }) => {
      console.log("New message received:", data.message.id);
      dispatch(addMessage(data.message));
      dispatch(
        updateConversationLastMessage({
          conversationId: data.conversationId,
          lastMessageText: data.message.message,
          lastMessageTime: data.message.createdAt,
        })
      );
    });

    // Message sent
    socket.on("message-sent", (data: { message: ConversationMessage }) => {
      console.log("Message sent successfully:", data.message.id);
      dispatch(addMessage(data.message));
      dispatch(
        updateConversationLastMessage({
          conversationId: data.message.conversationId,
          lastMessageText: data.message.message,
          lastMessageTime: data.message.createdAt,
        })
      );
    });

    // Messages loaded
    socket.on("messages-loaded", (data: { messages: ConversationMessage[] }) => {
      console.log("Messages loaded:", data.messages.length);
      if (activeConversationId) {
        dispatch(
          setMessages({
            conversationId: activeConversationId,
            messages: data.messages,
          })
        );
      }
    });

    // Messages read
    socket.on("messages-read", (data: { conversationId: number; readBy: number }) => {
      console.log("Messages marked as read by user:", data.readBy);
      dispatch(
        markMessagesAsRead({
          conversationId: data.conversationId,
          readBy: data.readBy,
        })
      );
    });

    // User typing
    socket.on("user-typing", (data: { conversationId: number; userId: number; isTyping: boolean }) => {
      console.log("User typing:", data.userId, data.isTyping);
      dispatch(setUserTyping(data));
    });

    // User online
    socket.on("user-online", (data: { userId: number }) => {
      console.log("User online:", data.userId);
      dispatch(setUserOnline(data.userId));
    });

    // User offline
    socket.on("user-offline", (data: { userId: number }) => {
      console.log("User offline:", data.userId);
      dispatch(setUserOffline(data.userId));
    });

    // Error
    socket.on("error", (data: { message: string }) => {
      console.error("Socket error:", data.message);
      dispatch(setConnectionError(data.message));
    });

    // Cleanup function
    return () => {
      console.log("Cleaning up conversations socket listeners");
      socket.off("conversations-loaded");
      socket.off("conversation-started");
      socket.off("joined-conversation");
      socket.off("new-message");
      socket.off("message-sent");
      socket.off("messages-loaded");
      socket.off("messages-read");
      socket.off("user-typing");
      socket.off("user-online");
      socket.off("user-offline");
      socket.off("error");
    };
  }, [socket, isConnected, activeConversationId, dispatch]);

  // Connect function
  const connect = useCallback(async (): Promise<boolean> => {
    if (isConnected || isConnecting) {
      return isConnected;
    }

    try {
      console.log("Attempting to connect to conversations socket...");
      dispatch(setConnecting(true));
      dispatch(setConnectionError(null));

      // Initialize user data first
      const userDataLoaded = await initUserData();
      if (!userDataLoaded || !userId.current || !userRole.current) {
        throw new Error("Failed to load user data");
      }

      // Create new socket connection
      const socketUrl = getSocketUrl();
      console.log("Connecting to:", `${socketUrl}/conversations`);

      const newSocket = io(`${socketUrl}/conversations`, {
        query: {
          userId: userId.current.toString(),
          role: userRole.current,
        },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      // Return a promise that resolves when connection is established
      return new Promise((resolve) => {
        // Setup connection event handlers
        newSocket.on("connect", () => {
          console.log("Conversations socket connected successfully");
          setSocket(newSocket);
          dispatch(setConnected(true));
          dispatch(setConnecting(false));
          dispatch(setConnectionError(null));
          resolve(true);
        });

        newSocket.on("disconnect", (reason: string) => {
          console.log("Conversations socket disconnected:", reason);
          setSocket(null);
          dispatch(setConnected(false));
          dispatch(setConnecting(false));
        });

        newSocket.on("connect_error", (error: Error) => {
          console.error("Conversations socket connection error:", error.message);
          dispatch(setConnecting(false));
          dispatch(setConnectionError(error.message));
          resolve(false);
        });
      });
    } catch (error) {
      console.error("Failed to connect to conversations socket:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      dispatch(setConnectionError(errorMessage));
      dispatch(setConnecting(false));
      return false;
    }
  }, [isConnected, isConnecting, dispatch, initUserData]);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log("Disconnecting conversations socket");
      socketRef.current.disconnect();
      setSocket(null);
    }
    dispatch(setConnected(false));
    dispatch(setConnecting(false));
    dispatch(setConnectionError(null));
  }, [dispatch]);

  // Load conversations
  const loadConversations = useCallback(() => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.warn("Cannot load conversations: socket not connected");
      return;
    }
    console.log("Loading conversations...");
    dispatch(setLoadingConversations(true));
    socketRef.current.emit("get-conversations", {});
  }, [dispatch]);

  // Start conversation
  const startConversation = useCallback((otherUserId: number) => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.warn("Cannot start conversation: socket not connected");
      return;
    }
    console.log("Starting conversation with user:", otherUserId);
    socketRef.current.emit("start-conversation", { otherUserId });
  }, []);

  // Join conversation
  const joinConversation = useCallback((conversationId: number) => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.warn("Cannot join conversation: socket not connected");
      return;
    }
    console.log("Joining conversation:", conversationId);
    socketRef.current.emit("join-conversation", { conversationId });
  }, []);

  // Send message
  const sendMessage = useCallback((conversationId: number, message: string) => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.warn("Cannot send message: socket not connected");
      return;
    }
    console.log("Sending message to conversation:", conversationId);
    socketRef.current.emit("send-message", { conversationId, message });
  }, []);

  // Load messages
  const loadMessages = useCallback(
    (conversationId: number, limit: number = 50, offset: number = 0) => {
      if (!socketRef.current || !socketRef.current.connected) {
        console.warn("Cannot load messages: socket not connected");
        return;
      }
      console.log("Loading messages for conversation:", conversationId);
      dispatch(setLoadingMessages({ conversationId, isLoading: true }));
      socketRef.current.emit("get-messages", { conversationId, limit, offset });
    },
    [dispatch]
  );

  // Mark as read
  const markAsRead = useCallback((conversationId: number) => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.warn("Cannot mark as read: socket not connected");
      return;
    }
    console.log("Marking messages as read for conversation:", conversationId);
    socketRef.current.emit("mark-as-read", { conversationId });
  }, []);

  // Send typing
  const sendTyping = useCallback((conversationId: number, isTyping: boolean) => {
    if (!socketRef.current || !socketRef.current.connected) {
      return;
    }
    socketRef.current.emit("typing", { conversationId, isTyping });
  }, []);

  // Auto-connect when user becomes authenticated
  useEffect(() => {
    let mounted = true;

    const autoConnect = async () => {
      if (
        isAuthenticated &&
        user &&
        !isConnected &&
        !isConnecting &&
        !hasTriedAutoConnect.current
      ) {
        console.log("User authenticated, auto-connecting to conversations socket...");
        hasTriedAutoConnect.current = true;
        const connected = await connect();
        if (mounted) {
          console.log("Conversations auto-connect result:", connected);
          // Load conversations after connecting
          if (connected) {
            setTimeout(() => {
              loadConversations();
            }, 500);
          }
        }
      }
    };

    autoConnect();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user, isConnected, isConnecting, connect, loadConversations]);

  // Reset auto-connect flag and clear data when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      hasTriedAutoConnect.current = false;
      if (isConnected) {
        disconnect();
      }
      dispatch(clearAll());
    }
  }, [isAuthenticated, isConnected, disconnect, dispatch]);

  // Get typing users for active conversation
  const activeTypingUsers = activeConversationId
    ? typingUsers.filter((t) => t.conversationId === activeConversationId)
    : [];

  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,

    // Conversations
    conversations,
    isLoadingConversations,
    loadConversations,

    // Active conversation
    activeConversationId,
    messages,
    isLoadingMessages,

    // Actions
    startConversation,
    joinConversation,
    sendMessage,
    loadMessages,
    markAsRead,
    sendTyping,

    // Typing users
    typingUsers: activeTypingUsers,

    // Online users
    onlineUsers,

    // Manual connection control
    connect,
    disconnect,
  };
};
