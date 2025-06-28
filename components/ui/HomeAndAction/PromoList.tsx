import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PromoItem {
  id: number;
  name: string;
  distance: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice: number;
  image: string;
  liked: boolean;
}

interface PromoListProps {
  promoItems: PromoItem[];
  onToggleLike: (id: number) => void;
}

export default function PromoList({
  promoItems,
  onToggleLike,
}: PromoListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discount Guaranteed!</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.promoItemsContainer}
      >
        {promoItems.map((item) => (
          <View key={item.id} style={styles.promoItemCard}>
            <View style={styles.promoBadge}>
              <Text style={styles.promoBadgeText}>PROMO</Text>
            </View>
            <Image source={{ uri: item.image }} style={styles.promoItemImage} />
            <View style={styles.promoItemInfo}>
              <Text style={styles.promoItemName}>{item.name}</Text>
              <View style={styles.promoItemDetails}>
                <Text style={styles.promoItemDistance}>{item.distance}</Text>
                <Text style={styles.promoItemRating}>
                  ⭐ {item.rating} ({item.reviews})
                </Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.currentPrice}>
                  ${item.price.toFixed(2)}
                </Text>
                <Text style={styles.originalPrice}>
                  ${item.originalPrice.toFixed(2)}
                </Text>
                <TouchableOpacity
                  style={styles.heartButton}
                  onPress={() => onToggleLike(item.id)}
                >
                  <Text style={styles.heartIcon}>
                    {item.liked ? "❤️" : "🤍"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  seeAll: {
    color: "green",
    fontWeight: "bold",
  },
  promoItemsContainer: {
    paddingLeft: 20,
    paddingBottom: 20,
  },
  promoItemCard: {
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 15,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    position: "relative",
  },
  promoBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  promoBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  promoItemImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  promoItemInfo: {
    padding: 15,
  },
  promoItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 5,
  },
  promoItemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  promoItemDistance: {
    fontSize: 12,
    color: "#666",
  },
  promoItemRating: {
    fontSize: 12,
    color: "#666",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4CAF50",
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
    flex: 1,
  },
  heartButton: {
    padding: 5,
  },
  heartIcon: {
    fontSize: 16,
  },
});
