import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const MessageEmptyState: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="chatbubbles-outline" size={64} color="#BDBDBD" />
      </View>
      <Text style={styles.title}>No Messages Yet</Text>
      <Text style={styles.subtitle}>
        Your conversations with restaurants, delivery drivers, and support will
        appear here.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212121",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    lineHeight: 24,
  },
});

export default MessageEmptyState;
