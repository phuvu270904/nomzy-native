import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/utils/apiClient";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  onNotificationPress?: () => void;
  onCartPress?: () => void;
}

interface UserAddress {
  streetAddress?: string;
  city?: string;
  country?: string;
  state?: string;
  label?: string;
}

export default function Header({
  onNotificationPress,
  onCartPress,
}: HeaderProps) {
  const { user } = useAuth();
  const [userAddress, setUserAddress] = useState<UserAddress | null>(null);

  useEffect(() => {
    const fetchUserAddress = async () => {
      try {
        const response = await apiClient.get("/addresses/default");
        setUserAddress(response.data);
      } catch (error) {
        console.error("Failed to fetch user address:", error);
      }
    };

    fetchUserAddress();
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
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
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
