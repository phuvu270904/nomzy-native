import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface Message {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isOnline?: boolean;
  type: "customer_support" | "restaurant" | "delivery";
}

interface MessageItemProps {
  message: Message;
  onPress: () => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onPress }) => {
  const getTypeIndicator = () => {
    switch (message.type) {
      case "customer_support":
        return "Support";
      case "restaurant":
        return "Restaurant";
      case "delivery":
        return "Delivery";
      default:
        return "";
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: message.avatar }} style={styles.avatar} />
        {message.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {message.name}
          </Text>
          <View style={styles.rightSection}>
            <Text style={styles.time}>{message.time}</Text>
            {message.unreadCount && message.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {message.unreadCount > 99 ? "99+" : message.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.messageRow}>
          <Text style={styles.typeIndicator}>{getTypeIndicator()}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {message.lastMessage}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#1BAC4B",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    flex: 1,
    marginRight: 8,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  time: {
    fontSize: 12,
    color: "#757575",
  },
  unreadBadge: {
    backgroundColor: "#1BAC4B",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeIndicator: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1BAC4B",
    marginRight: 8,
    minWidth: 60,
  },
  lastMessage: {
    fontSize: 14,
    color: "#757575",
    flex: 1,
  },
});

export default MessageItem;
