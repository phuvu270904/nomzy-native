import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface ProfileMenuItemData {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  showArrow?: boolean;
  badge?: string | number;
  onPress?: () => void;
}

interface ProfileMenuItemProps {
  item: ProfileMenuItemData;
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({ item }) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: item.iconColor
                ? `${item.iconColor}15`
                : "#F5F5F5",
            },
          ]}
        >
          <Ionicons
            name={item.icon}
            size={20}
            color={item.iconColor || "#757575"}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {item.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
        {item.showArrow !== false && (
          <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: "#757575",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    backgroundColor: "#FF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default ProfileMenuItem;
