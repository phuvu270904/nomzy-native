import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { NotificationHeader } from "@/components/notifications/NotificationHeader";
import {
  NotificationData,
  NotificationItem,
} from "@/components/notifications/NotificationItem";
import { ThemedView } from "@/components/ThemedView";

// Sample notification data
const sampleNotifications: NotificationData[] = [
  {
    id: "1",
    type: "cancelled",
    title: "Orders Cancelled!",
    description:
      "You have cancelled an order at Burger Hut. We apologize for your inconvenience. We will try to improve our service next time 😊",
    timestamp: "19 Dec, 2022 | 20:50 PM",
    isNew: true,
  },
  {
    id: "2",
    type: "success",
    title: "Orders Successful!",
    description:
      "You have placed an order at Burger Hut and paid $24. Your food will arrive soon. Enjoy your meal! 🍔",
    timestamp: "19 Dec, 2022 | 20:49 PM",
    isNew: true,
  },
  {
    id: "3",
    type: "info",
    title: "New Services Available!",
    description:
      "You can now make multiple food orders at one time. You can also cancel your orders.",
    timestamp: "14 Dec, 2022 | 10:52 AM",
    isNew: false,
  },
  {
    id: "4",
    type: "payment",
    title: "Credit Card Connected!",
    description:
      "Your credit card has been successfully linked with Foodu. Enjoy our services.",
    timestamp: "12 Dec, 2022 | 15:38 PM",
    isNew: false,
  },
  {
    id: "5",
    type: "account",
    title: "Account Setup Successful!",
    description:
      "Your account creation is successful, you can now experience our services.",
    timestamp: "12 Dec, 2022 | 14:27 PM",
    isNew: false,
  },
];

export default function NotificationScreen() {
  const [notifications, setNotifications] =
    useState<NotificationData[]>(sampleNotifications);

  const handleBack = () => {
    router.back();
  };

  const handleSettings = () => {
    console.log("Settings pressed");
    // Navigate to notification settings
    // router.navigate('/notification-settings');
  };

  const handleNotificationPress = (notification: NotificationData) => {
    console.log("Notification pressed:", notification.title);

    // Mark notification as read (remove "New" badge)
    if (notification.isNew) {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, isNew: false } : item,
        ),
      );
    }

    // Handle navigation based on notification type
    switch (notification.type) {
      case "cancelled":
      case "success":
        // Navigate to order details
        // router.navigate(`/order-details/${notification.id}`);
        break;
      case "payment":
        // Navigate to payment methods
        // router.navigate('/payment-methods');
        break;
      case "account":
        // Navigate to profile
        // router.navigate('/(tabs)/profile');
        break;
      default:
        break;
    }
  };

  const renderNotification = ({ item }: { item: NotificationData }) => (
    <NotificationItem notification={item} onPress={handleNotificationPress} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <NotificationHeader onBack={handleBack} onSettings={handleSettings} />

      <ThemedView style={styles.content}>
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  listContainer: {
    paddingTop: 20,
    paddingBottom: 100, // Space for tab navigation
  },
});
