import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

export interface ProfileToggleItemData {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  value: boolean;
  onToggle: (value: boolean) => void;
}

interface ProfileToggleItemProps {
  item: ProfileToggleItemData;
}

const ProfileToggleItem: React.FC<ProfileToggleItemProps> = ({ item }) => {
  return (
    <View style={styles.container}>
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

      <Switch
        value={item.value}
        onValueChange={item.onToggle}
        trackColor={{ false: "#E0E0E0", true: "#81C784" }}
        thumbColor={item.value ? "#4CAF50" : "#F5F5F5"}
        ios_backgroundColor="#E0E0E0"
      />
    </View>
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
});

export default ProfileToggleItem;
