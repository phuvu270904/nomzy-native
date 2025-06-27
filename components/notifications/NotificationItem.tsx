import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export interface NotificationData {
  id: string;
  type: "cancelled" | "success" | "info" | "payment" | "account";
  title: string;
  description: string;
  timestamp: string;
  isNew: boolean;
}

interface NotificationItemProps {
  notification: NotificationData;
  onPress?: (notification: NotificationData) => void;
}

const getNotificationIcon = (type: NotificationData["type"]) => {
  switch (type) {
    case "cancelled":
      return {
        name: "close" as const,
        color: "#FF5252",
        backgroundColor: "#FFEBEE",
      };
    case "success":
      return {
        name: "checkmark" as const,
        color: "#4CAF50",
        backgroundColor: "#E8F5E8",
      };
    case "info":
      return {
        name: "star" as const,
        color: "#FF9800",
        backgroundColor: "#FFF3E0",
      };
    case "payment":
      return {
        name: "card" as const,
        color: "#2196F3",
        backgroundColor: "#E3F2FD",
      };
    case "account":
      return {
        name: "person" as const,
        color: "#4CAF50",
        backgroundColor: "#E8F5E8",
      };
    default:
      return {
        name: "notifications" as const,
        color: "#9E9E9E",
        backgroundColor: "#F5F5F5",
      };
  }
};

export function NotificationItem({
  notification,
  onPress,
}: NotificationItemProps) {
  const iconConfig = getNotificationIcon(notification.type);

  const handlePress = () => {
    onPress?.(notification);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: iconConfig.backgroundColor },
          ]}
        >
          <Ionicons name={iconConfig.name} size={20} color={iconConfig.color} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.header}>
            <ThemedText style={styles.title}>{notification.title}</ThemedText>
            {notification.isNew && (
              <View style={styles.newBadge}>
                <ThemedText style={styles.newBadgeText}>New</ThemedText>
              </View>
            )}
          </View>

          <ThemedText style={styles.timestamp}>
            {notification.timestamp}
          </ThemedText>
          <ThemedText style={styles.description}>
            {notification.description}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E2E2E",
    flex: 1,
  },
  newBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  timestamp: {
    fontSize: 12,
    color: "#9E9E9E",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
  },
});
