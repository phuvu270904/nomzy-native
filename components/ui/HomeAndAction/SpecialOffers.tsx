import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function SpecialOffers() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Special Offers</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.discount}>30%</Text>
          <Text style={styles.text}>DISCOUNT ONLY</Text>
          <Text style={styles.text}>VALID FOR TODAY!</Text>
        </View>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=120&h=120&fit=crop&crop=center",
          }}
          style={styles.image}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  seeAll: {
    color: "#4CAF50",
    fontWeight: "600",
    fontSize: 14,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "space-between",
  },
  discount: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
  },
  text: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});
