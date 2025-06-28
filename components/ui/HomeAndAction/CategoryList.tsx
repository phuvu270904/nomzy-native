import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const categories = [
  { label: "Hambur..", icon: "🍔" },
  { label: "Pizza", icon: "🍕" },
  { label: "Noodles", icon: "🍜" },
  { label: "Meat", icon: "🍖" },
  { label: "Vegeta..", icon: "🥬" },
  { label: "Dessert", icon: "🍰" },
  { label: "Drink", icon: "🍺" },
  { label: "More", icon: "..." },
];

export default function CategoryList() {
  return (
    <View style={styles.container}>
      {categories.map((cat, index) => (
        <TouchableOpacity key={index} style={styles.item}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{cat.icon}</Text>
          </View>
          <Text style={styles.label}>{cat.label}</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    marginTop: 20,
  },
  item: {
    width: "22%",
    alignItems: "center",
    marginVertical: 10,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
    color: "#4CAF50",
  },
  label: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
