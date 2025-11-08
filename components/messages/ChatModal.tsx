import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useConversations";
import type { ConversationMessage } from "@/store/slices/conversationsSlice";
import { setActiveConversation } from "@/store/slices/conversationsSlice";
import { useAppDispatch } from "@/store/store";

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
  otherUserId: number;
  otherUserName: string;
  otherUserPhoto?: string;
  otherUserRole?: string;
}

// Format time for messages
const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export function ChatModal({
  visible,
  onClose,
  otherUserId,
  otherUserName,
  otherUserPhoto,
  otherUserRole,
}: ChatModalProps) {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const {
    messages,
    isLoadingMessages,
    conversations,
    joinConversation,
    sendMessage,
    loadMessages,
    markAsRead,
    sendTyping,
    typingUsers,
    onlineUsers,
    startConversation,
    isConnected,
  } = useConversations();

  const [messageText, setMessageText] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUserId = user?.user?.id;

  const isOtherUserOnline = onlineUsers.includes(otherUserId);

  // Find or create conversation
  useEffect(() => {
    if (!visible || !isConnected) return;

    const findOrCreateConversation = async () => {
      // Check if conversation already exists
      const existingConversation = conversations.find(
        (conv) =>
          conv.user1Id === otherUserId || conv.user2Id === otherUserId
      );

      if (existingConversation) {
        console.log("Found existing conversation:", existingConversation.id);
        setConversationId(existingConversation.id);
        dispatch(setActiveConversation(existingConversation.id));
        joinConversation(existingConversation.id);
        loadMessages(existingConversation.id);
        markAsRead(existingConversation.id);
      } else {
        console.log("Creating new conversation with user:", otherUserId);
        setIsInitializing(true);
        startConversation(otherUserId);
        
        // Wait for conversation to be created
        setTimeout(() => {
          const newConversation = conversations.find(
            (conv) =>
              conv.user1Id === otherUserId || conv.user2Id === otherUserId
          );
          if (newConversation) {
            console.log("New conversation created:", newConversation.id);
            setConversationId(newConversation.id);
            dispatch(setActiveConversation(newConversation.id));
            joinConversation(newConversation.id);
            loadMessages(newConversation.id);
          }
          setIsInitializing(false);
        }, 1500);
      }
    };

    findOrCreateConversation();
  }, [visible, otherUserId, isConnected, conversations, dispatch, joinConversation, loadMessages, markAsRead, startConversation]);

  // Update conversation ID when conversations change (for newly created conversations)
  useEffect(() => {
    if (!conversationId && conversations.length > 0 && visible) {
      const conversation = conversations.find(
        (conv) =>
          conv.user1Id === otherUserId || conv.user2Id === otherUserId
      );
      if (conversation) {
        console.log("Setting conversation ID from conversations update:", conversation.id);
        setConversationId(conversation.id);
        dispatch(setActiveConversation(conversation.id));
        joinConversation(conversation.id);
        loadMessages(conversation.id);
        setIsInitializing(false);
      }
    }
  }, [conversations, otherUserId, conversationId, visible, dispatch, joinConversation, loadMessages]);

  // Mark messages as loaded once we have them
  useEffect(() => {
    if (conversationId && messages.length >= 0 && !hasLoadedOnce && visible) {
      setHasLoadedOnce(true);
    }
  }, [conversationId, messages.length, hasLoadedOnce, visible]);

  // Mark as read when messages change
  useEffect(() => {
    if (conversationId && messages.length > 0 && visible) {
      markAsRead(conversationId);
    }
  }, [messages.length, conversationId, visible, markAsRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && visible) {
      console.log("Messages updated, count:", messages.length, "Conversation ID:", conversationId);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, visible, conversationId]);

  // Clear active conversation and reset state when modal closes
  useEffect(() => {
    if (!visible) {
      if (conversationId) {
        console.log("Clearing active conversation on modal close");
        dispatch(setActiveConversation(null));
      }
      // Reset state for next time
      setHasLoadedOnce(false);
      setConversationId(null);
      setIsInitializing(false);
    }
  }, [visible, conversationId, dispatch]);

  const handleSend = () => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || !conversationId) {
      console.log("Cannot send message - missing data:", { trimmedMessage: !!trimmedMessage, conversationId });
      return;
    }

    console.log("Sending message to conversation:", conversationId, "Text:", trimmedMessage);
    sendMessage(conversationId, trimmedMessage);
    setMessageText("");

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    sendTyping(conversationId, false);
    
    // Scroll to bottom after sending
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleTextChange = (text: string) => {
    setMessageText(text);

    // Send typing indicator
    if (conversationId) {
      sendTyping(conversationId, true);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendTyping(conversationId, false);
      }, 3000);
    }
  };

  const renderMessage = ({ item }: { item: ConversationMessage }) => {
    const isSent = item.senderId === currentUserId;

    return (
      <View style={[styles.messageContainer, isSent && styles.sentContainer]}>
        {!isSent && (
          <View style={styles.avatarContainer}>
            {otherUserPhoto ? (
              <Image source={{ uri: otherUserPhoto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={16} color="#666" />
              </View>
            )}
          </View>
        )}

        <View style={styles.messageContent}>
          <View
            style={[
              styles.bubble,
              isSent ? styles.sentBubble : styles.receivedBubble,
            ]}
          >
            <ThemedText
              style={[styles.messageText, isSent && styles.sentText]}
            >
              {item.message}
            </ThemedText>
          </View>
          <View style={styles.messageFooter}>
            <ThemedText style={styles.timeText}>
              {formatMessageTime(item.createdAt)}
            </ThemedText>
            {isSent && (
              <Ionicons
                name={item.isRead ? "checkmark-done" : "checkmark"}
                size={14}
                color={item.isRead ? "#4CAF50" : "#999"}
                style={styles.readIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={[styles.container, { 
        paddingTop: insets.top,
        paddingBottom: insets.bottom 
      }]}>
        <StatusBar barStyle="dark-content" />
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={0}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color="#2E2E2E" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <View style={styles.headerAvatar}>
                {otherUserPhoto ? (
                  <Image
                    source={{ uri: otherUserPhoto }}
                    style={styles.headerAvatarImage}
                  />
                ) : (
                  <View style={styles.headerAvatarPlaceholder}>
                    <Ionicons name="person" size={20} color="#666" />
                  </View>
                )}
                {isOtherUserOnline && <View style={styles.onlineIndicator} />}
              </View>
              <View style={styles.headerInfo}>
                <ThemedText style={styles.headerName}>
                  {otherUserName}
                </ThemedText>
                <ThemedText style={styles.headerStatus}>
                  {isOtherUserOnline ? "Online" : "Offline"}
                  {otherUserRole && ` • ${otherUserRole}`}
                </ThemedText>
              </View>
            </View>

            <View style={styles.headerRight} />
          </View>

        {/* Messages List */}
        {!hasLoadedOnce && (isLoadingMessages || isInitializing) ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <ThemedText style={styles.loadingText}>
              {isInitializing ? "Starting conversation..." : "Loading messages..."}
            </ThemedText>
          </View>
        ) : !isConnected ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="cloud-offline" size={48} color="#999" />
            <ThemedText style={styles.errorText}>
              Not connected to chat service
            </ThemedText>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={64} color="#CCC" />
                <ThemedText style={styles.emptyText}>
                  No messages yet
                </ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  Start the conversation!
                </ThemedText>
              </View>
            }
          />
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <View style={styles.typingContainer}>
            <ThemedText style={styles.typingText}>
              {otherUserName} is typing...
            </ThemedText>
          </View>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={messageText}
            onChangeText={handleTextChange}
            multiline
            maxLength={1000}
            editable={!!conversationId && isConnected}
          />
          <Pressable
            style={[
              styles.sendButton,
              (!messageText.trim() || !conversationId || !isConnected) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!messageText.trim() || !conversationId || !isConnected}
          >
            <Ionicons
              name="send"
              size={20}
              color={
                messageText.trim() && conversationId && isConnected
                  ? "#FFFFFF"
                  : "#CCC"
              }
            />
          </Pressable>
        </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  headerAvatar: {
    position: "relative",
    marginRight: 12,
  },
  headerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
  },
  headerStatus: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FF6B35",
    textAlign: "center",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#BBB",
    marginTop: 8,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 12,
    maxWidth: "80%",
  },
  sentContainer: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  messageContent: {
    flex: 1,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  receivedBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
  },
  sentBubble: {
    backgroundColor: "#4CAF50",
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: "#2E2E2E",
    lineHeight: 18,
  },
  sentText: {
    color: "#FFFFFF",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 10,
    color: "#999999",
  },
  readIcon: {
    marginLeft: 4,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F5F5F5",
  },
  typingText: {
    fontSize: 12,
    color: "#666666",
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#2E2E2E",
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
});
