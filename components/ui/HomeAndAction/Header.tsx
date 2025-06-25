import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function Header() {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image
          source={{ uri: "https:  //i.pravatar.cc/50" }}
          style={styles.avatar}
        />
        <View style={{}}>
          <Text style={styles.deliver}>Deliver to</Text>
          <View style={styles.location}>
            <Text style={styles.locationText}>Times Square</Text>
            <Ionicons name="chevron-down" size={14} color="green" />
          </View>
        </View>
      </View>
      <View style={styles.right}>
        <Ionicons name="notifications-outline" size={24} />
        <Ionicons name="cart-outline" size={24} style={{ marginLeft: 12 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  right: {
    flexDirection: "row",
  },
});
