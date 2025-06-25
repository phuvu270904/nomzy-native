import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function SpecialOffers() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Special Offers</Text>
        <Text style={styles.seeAll}>See All</Text>
      </View>
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.discount}>30%</Text>
          <Text style={styles.text}>DISCOUNT ONLY</Text>
          <Text style={styles.text}>VALID FOR TODAY!</Text>
        </View>
        <Image
          source={{ uri: "https://i.imgur.com/5Aqgz7o.png" }} // burger image
          style={styles.image}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAll: {
    color: "green",
    fontWeight: "bold",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#00C853",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  discount: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
  },
  text: {
    color: "#fff",
    fontSize: 14,
  },
  image: {
    width: 100,
    height: 80,
    resizeMode: "contain",
  },
});
