import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MessageEmptyState from "@/components/messages/MessageEmptyState";
import MessageHeader from "@/components/messages/MessageHeader";
import MessageItem, { Message } from "@/components/messages/MessageItem";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useConversations";
import { setActiveConversation } from "@/store/slices/conversationsSlice";
import { useAppDispatch } from "@/store/store";

// Helper to format time
const formatTime = (dateString: string | null): string => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (hours < 1) {
    const minutes = Math.floor(diff / (1000 * 60));
    return minutes < 1 ? "Just now" : `${minutes}m ago`;
  } else if (hours < 24) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  } else if (hours < 48) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
};

export default function DriverMessageScreen() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const {
    conversations,
    isLoadingConversations,
    isConnected,
    isConnecting,
    loadConversations,
    onlineUsers,
  } = useConversations();

  // Reload conversations when screen is focused
  useEffect(() => {
    if (isConnected) {
      loadConversations();
    }
  }, [isConnected]);

  const handleMessagePress = (conversationId: number) => {
    // Set active conversation in Redux
    dispatch(setActiveConversation(conversationId));
    
    // Navigate to chat screen
    // @ts-ignore - Dynamic route
    router.push(`/conversations/${conversationId}`);
  };

  const handleSearchPress = () => {
    // TODO: Implement search
    console.log("Search pressed");
  };

  const handleMorePress = () => {
    // TODO: Implement more options
    console.log("More pressed");
  };

  // Transform conversations to Message format
  const messages: Message[] = conversations.map((conv) => {
    const currentUserId = user?.user?.id;
    const otherUser = conv.user1Id === currentUserId ? conv.user2 : conv.user1;
    
    // Determine conversation type based on other user's role
    let type: "customer_support" | "restaurant" | "delivery" = "delivery";
    if (otherUser?.role === "restaurant") {
      type = "restaurant";
    } else if (otherUser?.role === "user") {
      type = "delivery"; // Customer
    }

    const isOnline = otherUser ? onlineUsers.includes(otherUser.id) : false;

    return {
      id: conv.id.toString(),
      name: otherUser?.name || "Unknown User",
      avatar: otherUser?.avatar || "",
      lastMessage: conv.lastMessageText || "No messages yet",
      time: formatTime(conv.lastMessageTime),
      unreadCount: conv.unreadCount || 0,
      isOnline,
      type,
    };
  });

  const renderMessageItem = ({ item }: { item: Message }) => (
    <MessageItem
      message={item}
      onPress={() => handleMessagePress(parseInt(item.id))}
    />
  );

  // Show loading state while connecting
  if (isConnecting) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <MessageHeader
          onSearchPress={handleSearchPress}
          onMorePress={handleMorePress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>Connecting...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Show connection error
  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <MessageHeader
          onSearchPress={handleSearchPress}
          onMorePress={handleMorePress}
        />
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.errorText}>
            Unable to connect to chat service
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <MessageHeader
        onSearchPress={handleSearchPress}
        onMorePress={handleMorePress}
      />

      {isLoadingConversations ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>Loading conversations...</ThemedText>
        </View>
      ) : messages.length > 0 ? (
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <MessageEmptyState />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  messageList: {
    flex: 1,
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
    fontSize: 16,
    color: "#FF6B35",
    textAlign: "center",
    padding: 20,
  },
});
