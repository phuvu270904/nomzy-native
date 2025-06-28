import React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface RecommendedItem {
  id: number;
  name: string;
  distance: string;
  rating: number;
  reviews: number;
  price: number;
  image: string;
  liked: boolean;
}

interface RecommendedListProps {
  recommendedItems: RecommendedItem[];
  onToggleLike: (id: number) => void;
  filterOptions: string[];
}

export default function RecommendedList({
  recommendedItems,
  onToggleLike,
  filterOptions,
}: RecommendedListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recommended For You</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Options */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {filterOptions.map((filter, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterButton,
              index === 0 && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                index === 0 && styles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recommended Items */}
      <View style={styles.recommendedContainer}>
        {recommendedItems.map((item) => (
          <View key={item.id} style={styles.recommendedItem}>
            <Image
              source={{ uri: item.image }}
              style={styles.recommendedImage}
            />
            <View style={styles.recommendedInfo}>
              <Text style={styles.recommendedName}>{item.name}</Text>
              <View style={styles.recommendedDetails}>
                <Text style={styles.recommendedDistance}>{item.distance}</Text>
                <Text style={styles.recommendedRating}>
                  ⭐ {item.rating} ({item.reviews})
                </Text>
              </View>
              <Text style={styles.recommendedPrice}>
                ${item.price.toFixed(2)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.heartButton}
              onPress={() => onToggleLike(item.id)}
            >
              <Text style={styles.heartIcon}>{item.liked ? "❤️" : "🤍"}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  seeAllText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  filterContainer: {
    paddingLeft: 20,
    marginBottom: 15,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  recommendedContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  recommendedItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  recommendedImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  recommendedInfo: {
    flex: 1,
  },
  recommendedName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 5,
  },
  recommendedDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  recommendedDistance: {
    fontSize: 12,
    color: "#666",
  },
  recommendedRating: {
    fontSize: 12,
    color: "#666",
  },
  recommendedPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4CAF50",
  },
  heartButton: {
    padding: 5,
  },
  heartIcon: {
    fontSize: 16,
  },
});
