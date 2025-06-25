import React from "react";
import { StyleSheet, Text, View } from "react-native";

const categories = [
  { label: "Hambur..", icon: "🍔" },
  { label: "Pizza", icon: "🍕" },
  { label: "Noodles", icon: "🍜" },
  { label: "Meat", icon: "🍖" },
  { label: "Vegeta..", icon: "🥬" },
  { label: "Dessert", icon: "🍰" },
  { label: "Drink", icon: "🍺" },
  { label: "More", icon: "🧁" },
];

export default function CategoryList() {
  return (
    <View style={styles.container}>
      {categories.map((cat, index) => (
        <View key={index} style={styles.item}>
          <Text style={styles.icon}>{cat.icon}</Text>
          <Text style={styles.label}>{cat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  item: {
    width: "22%",
    alignItems: "center",
    marginVertical: 10,
  },
  icon: {
    fontSize: 28,
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    color: "#000",
  },
});
