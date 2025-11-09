import React from "react";
import { StyleSheet, Text, View } from "react-native";

export interface ProfileStatsData {
  totalOrders: number;
  favoriteRestaurants: number;
  reviews: number;
}

interface ProfileStatsProps {
  stats: ProfileStatsData;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({ stats }) => {
  const statsItems = [
    {
      label: "Total Orders",
      value: stats.totalOrders.toString(),
      color: "#1BAC4B",
    },
    {
      label: "Favorites",
      value: stats.favoriteRestaurants.toString(),
      color: "#FF6B6B",
    },
    {
      label: "Reviews",
      value: stats.reviews.toString(),
      color: "#4ECDC4",
    },
  ];

  return (
    <View style={styles.container}>
      {statsItems.map((item, index) => (
        <View key={index} style={styles.statItem}>
          <Text style={[styles.statValue, { color: item.color }]}>
            {item.value}
          </Text>
          <Text style={styles.statLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#757575",
    textAlign: "center",
  },
});

export default ProfileStats;
