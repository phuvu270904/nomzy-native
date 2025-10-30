import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchNotifications, Notification } from "@/api/notificationsApi";
import { NotificationHeader } from "@/components/notifications/NotificationHeader";
import {
  NotificationData,
  NotificationItem,
} from "@/components/notifications/NotificationItem";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

// Helper function to format date
const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleString("en-US", options).replace(",", " |");
};

// Helper function to map API notification to NotificationData
const mapNotificationToData = (
  notification: Notification,
): NotificationData => {
  return {
    id: notification.id.toString(),
    type: "info", // Default type, can be customized based on notification content
    title: notification.title,
    description: notification.message,
    timestamp: formatTimestamp(notification.createdAt),
    isNew: !notification.isRead,
  };
};

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await fetchNotifications();
      const mappedNotifications = data.map(mapNotificationToData);
      setNotifications(mappedNotifications);
    } catch (err) {
      console.error("Error loading notifications:", err);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = () => {
    loadNotifications(true);
  };

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <NotificationHeader onBack={handleBack} onSettings={handleSettings} />
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>
            Loading notifications...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <NotificationHeader onBack={handleBack} onSettings={handleSettings} />
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadNotifications()}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <NotificationHeader onBack={handleBack} onSettings={handleSettings} />

      <ThemedView style={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              No notifications yet
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#4CAF50"]}
                tintColor="#4CAF50"
              />
            }
          />
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: "#FF5252",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#9E9E9E",
    textAlign: "center",
  },
});
