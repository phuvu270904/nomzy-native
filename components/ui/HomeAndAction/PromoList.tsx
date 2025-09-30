import { ApiProduct } from "@/hooks/useProducts";
import { apiClient } from "@/utils/apiClient";
import React, { useEffect, useState } from "react";
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

export default function PromoList() {
  const [discountedProducts, setDiscountedProducts] = useState<ApiProduct[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchDiscountedProducts();
  }, []);

  const fetchDiscountedProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<{ data: ApiProduct[] }>("/products");
      const products = response.data.data;

      // Filter products that have a discountPrice (not null and not empty)
      const discounted = products.filter(
        (product) => product.discountPrice && product.discountPrice !== "0",
      );

      setDiscountedProducts(discounted);
    } catch (err: any) {
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const toggleLikeLocal = (productId: number) => {
    setLikedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // Transform API products to PromoItem format
  const promoItems: PromoItem[] = discountedProducts.map((product) => {
    const originalPrice = parseFloat(product.price);
    const discountPrice = parseFloat(product.discountPrice || product.price);

    // Generate a fallback image if the API image URL is a placeholder
    const fallbackImage = `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsBGOs2225fFqTfnl5EKlrEUBn5-drby1x3Q&s`;
    const imageUrl =
      product.imageUrl && !product.imageUrl.includes("example.com")
        ? product.imageUrl
        : fallbackImage;

    return {
      id: product.id,
      name: product.name,
      distance: "0.5 km", // Default distance since API doesn't provide it
      rating: 4.5, // Default rating since API doesn't provide it
      reviews: Math.floor(Math.random() * 100) + 10, // Random reviews since API doesn't provide it
      price: discountPrice,
      originalPrice: originalPrice,
      image: imageUrl,
      liked: likedItems.has(product.id),
    };
  });

  if (loading) {
    return (
      <View>
        <View style={styles.header}>
          <Text style={styles.title}>Discount Guaranteed!</Text>
        </View>
        <Text style={styles.loadingText}>Loading promos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View>
        <View style={styles.header}>
          <Text style={styles.title}>Discount Guaranteed!</Text>
        </View>
        <Text style={styles.errorText}>Error loading promos: {error}</Text>
      </View>
    );
  }

  if (promoItems.length === 0) {
    return <View></View>;
  }
  return (
    <View>
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
                  onPress={() => toggleLikeLocal(item.id)}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  errorText: {
    color: "red",
    paddingHorizontal: 20,
  },
  loadingText: {
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
