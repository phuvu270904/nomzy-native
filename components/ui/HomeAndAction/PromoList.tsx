import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function PromoList() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discount Guaranteed! 👌</Text>
        <Text style={styles.seeAll}>See All</Text>
      </View>
      {/* Bạn có thể thêm FlatList hoặc ScrollView ở đây để hiển thị các sản phẩm */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  seeAll: {
    color: "green",
    fontWeight: "bold",
  },
});
