import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";

interface NotificationHeaderProps {
  onBack?: () => void;
  onSettings?: () => void;
}

export function NotificationHeader({
  onBack,
  onSettings,
}: NotificationHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#2E2E2E" />
      </TouchableOpacity>

      <ThemedText style={styles.title}>Notification</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E2E2E",
    flex: 1,
    marginHorizontal: 16,
  },
});
