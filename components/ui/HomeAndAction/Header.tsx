import apiClient from "@/utils/apiClient";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  onNotificationPress?: () => void;
  onCartPress?: () => void;
}

export default function Header({
  onNotificationPress,
  onCartPress,
}: HeaderProps) {
  const [userAddress, setUserAddress] = useState<any | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await apiClient.get("/auth/profile");

        setUserAddress(
          response.data.user.addresses?.find((addr: any) => addr.isDefault) ||
            null,
        );
        setUserAvatar(response.data.user.avatar || null);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const getDisplayAddress = () => {
    if (userAddress) {
      if (userAddress.streetAddress && userAddress.city) {
        return `${userAddress.streetAddress}, ${userAddress.city}`;
      }
      if (userAddress.city) return userAddress.city;
      if (userAddress.streetAddress) return userAddress.streetAddress;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {userAvatar ? (
          <Image source={{ uri: userAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={24} color="#666" />
          </View>
        )}
        {userAddress && (
          <View>
            <Text style={styles.deliver}>Deliver to</Text>
            <View style={styles.location}>
              <Text style={styles.locationText}>{getDisplayAddress()}</Text>
            </View>
          </View>
        )}
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
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
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
