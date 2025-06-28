import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TextInput, View } from "react-native";

export default function SearchBar() {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="gray" />
      <TextInput
        placeholder="What are you craving?"
        style={styles.input}
        placeholderTextColor="gray"
      />
    </View>
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
  input: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
    color: "#000",
  },
});
