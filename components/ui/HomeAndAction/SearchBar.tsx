import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function SearchBar() {
  const handlePress = () => {
    router.push("/search");
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="search" size={20} color="gray" />
      <Text style={styles.placeholder}>What are you craving?</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5F5F5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    marginHorizontal: 20,
    marginVertical: 15,
  },
  placeholder: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
    color: "gray",
  },
});
