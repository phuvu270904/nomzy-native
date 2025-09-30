import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Alert, FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import MessageEmptyState from "@/components/messages/MessageEmptyState";
import MessageHeader from "@/components/messages/MessageHeader";
import MessageItem, { Message } from "@/components/messages/MessageItem";

// Mock data for demonstration
const mockMessages: Message[] = [
  {
    id: "1",
    name: "Customer Support",
    avatar: "https://via.placeholder.com/48",
    lastMessage: "Hello! How can we help you today?",
    time: "2:30 PM",
    unreadCount: 2,
    isOnline: true,
    type: "customer_support",
  },
  {
    id: "2",
    name: "Pizza Palace",
    avatar: "https://via.placeholder.com/48",
    lastMessage:
      "Your order is being prepared and will be ready in 15 minutes.",
    time: "1:45 PM",
    unreadCount: 1,
    isOnline: true,
    type: "restaurant",
  },
  {
    id: "3",
    name: "Delivery Driver - John",
    avatar: "https://via.placeholder.com/48",
    lastMessage: "I'm on my way to your location. ETA 5 minutes.",
    time: "1:20 PM",
    unreadCount: 0,
    isOnline: true,
    type: "delivery",
  },
  {
    id: "4",
    name: "Burger House",
    avatar: "https://via.placeholder.com/48",
    lastMessage: "Thank you for your order! We're preparing it now.",
    time: "12:30 PM",
    unreadCount: 0,
    isOnline: false,
    type: "restaurant",
  },
  {
    id: "5",
    name: "Delivery Driver - Sarah",
    avatar: "https://via.placeholder.com/48",
    lastMessage: "Order delivered successfully. Thank you!",
    time: "Yesterday",
    unreadCount: 0,
    isOnline: false,
    type: "delivery",
  },
];

export default function MessageScreen() {
  const [messages] = useState<Message[]>(mockMessages);

  const handleMessagePress = (message: Message) => {
    Alert.alert("Open Chat", `Opening conversation with ${message.name}`, [
      { text: "Cancel", style: "cancel" },
      { text: "Open", onPress: () => console.log("Open chat:", message.id) },
    ]);
  };

  const handleSearchPress = () => {
    Alert.alert("Search", "Search functionality would be implemented here");
  };

  const handleMorePress = () => {
    Alert.alert("More Options", "Additional options would be shown here");
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <MessageItem message={item} onPress={() => handleMessagePress(item)} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <MessageHeader
        onSearchPress={handleSearchPress}
        onMorePress={handleMorePress}
      />

      {messages.length > 0 ? (
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
});
