import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useConversations";
import type { ConversationMessage } from "@/store/slices/conversationsSlice";
import { setActiveConversation } from "@/store/slices/conversationsSlice";
import { useAppDispatch } from "@/store/store";

// Format time for messages
const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = parseInt(id || "0", 10);

  const { user } = useAuth();
  const dispatch = useAppDispatch();
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
    isConnected,
  } = useConversations();

  const [messageText, setMessageText] = useState("");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get conversation details
  const conversation = conversations.find((c) => c.id === conversationId);
  const currentUserId = user?.user?.id;
  const otherUser =
    conversation?.user1Id === currentUserId
      ? conversation?.user2
      : conversation?.user1;

  // Initialize conversation - set active and load messages
  useEffect(() => {
    if (conversationId && isConnected) {
      console.log("Initializing conversation:", conversationId);
      dispatch(setActiveConversation(conversationId));
      joinConversation(conversationId);
      loadMessages(conversationId);
      markAsRead(conversationId);
    }

    // Cleanup: clear active conversation when unmounting
    return () => {
      console.log("Clearing active conversation on unmount");
      dispatch(setActiveConversation(null));
    };
  }, [conversationId, isConnected, dispatch, joinConversation, loadMessages, markAsRead]);

  // Mark messages as loaded once we have them
  useEffect(() => {
    if (conversationId && messages.length >= 0 && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [conversationId, messages.length, hasLoadedOnce]);

  // Mark as read when messages change
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      markAsRead(conversationId);
    }
  }, [messages.length, conversationId, markAsRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      console.log("Messages updated, count:", messages.length);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

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
            {otherUser?.photo ? (
              <Image source={{ uri: otherUser.photo }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={20} color="#666" />
              </View>
            )}
          </View>
        )}

        <View style={styles.messageContent}>
          <View style={[styles.bubble, isSent ? styles.sentBubble : styles.receivedBubble]}>
            <ThemedText style={[styles.messageText, isSent && styles.sentText]}>
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
                size={16}
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
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#2E2E2E" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            {otherUser?.photo ? (
              <Image source={{ uri: otherUser.photo }} style={styles.headerAvatarImage} />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <Ionicons name="person" size={20} color="#666" />
              </View>
            )}
          </View>
          <View style={styles.headerInfo}>
            <ThemedText style={styles.headerName}>
              {otherUser?.name || "Unknown User"}
            </ThemedText>
            {otherUser?.role && (
              <ThemedText style={styles.headerStatus}>
                {otherUser.role.charAt(0).toUpperCase() + otherUser.role.slice(1)}
              </ThemedText>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
          <Ionicons name="ellipsis-vertical" size={20} color="#2E2E2E" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      {!hasLoadedOnce && isLoadingMessages ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>Loading messages...</ThemedText>
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
            {otherUser?.name || "User"} is typing...
          </ThemedText>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
  moreButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 16,
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
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  messageContent: {
    flex: 1,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
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
    fontSize: 15,
    color: "#2E2E2E",
    lineHeight: 20,
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
    fontSize: 11,
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
