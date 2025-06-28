import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  onNotificationPress?: () => void;
  onCartPress?: () => void;
}

export default function Header({
  onNotificationPress,
  onCartPress,
}: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
          }}
          style={styles.avatar}
        />
        <View>
          <Text style={styles.deliver}>Deliver to</Text>
          <View style={styles.location}>
            <Text style={styles.locationText}>Times Square</Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </View>
        </View>
      </View>
      <View style={styles.right}>
        <TouchableOpacity
          onPress={onNotificationPress}
          style={styles.iconButton}
        >
          <View style={styles.notificationBadge} />
          <Ionicons name="notifications-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onCartPress} style={styles.iconButton}>
          <Ionicons name="bag-handle-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliver: {
    fontSize: 12,
    color: "gray",
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginRight: 4,
  },
  dropdownIcon: {
    marginLeft: 4,
    color: "#4CAF50",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 15,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4444",
    zIndex: 1,
  },
});
