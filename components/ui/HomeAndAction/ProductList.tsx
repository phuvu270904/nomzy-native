import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  liked?: boolean;
  description?: string;
}

interface ProductListProps {
  products: Product[];
  onToggleLike: (id: number) => void;
  onProductPress?: (product: Product) => void;
  hasMore: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function ProductList({
  products,
  onToggleLike,
  onProductPress,
  hasMore,
  onLoadMore,
  isLoading = false,
  error,
  onRetry,
}: ProductListProps) {
  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => onProductPress?.(item)}
    >
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.productDetails}>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productRating}>⭐ {item.rating}</Text>
        </View>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.heartButton}
        onPress={() => onToggleLike(item.id)}
      >
        <Text style={styles.heartIcon}>{item.liked ? "❤️" : "🤍"}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Create full-width layout for products like recommended items
  const renderProductGrid = () => {
    return products.map((product) => (
      <View key={product.id}>{renderProduct({ item: product })}</View>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Products</Text>
      </View>

      {/* Product List */}
      <View style={styles.gridContainer}>{renderProductGrid()}</View>

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          {onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Load More Button */}
      {hasMore && !error && (
        <TouchableOpacity
          style={styles.loadMoreButton}
          onPress={onLoadMore}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#22C55E" />
              <Text style={styles.loadingText}>Loading more...</Text>
            </View>
          ) : (
            <Text style={styles.loadMoreText}>Load More Products</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  seeAll: {
    color: "#22C55E",
    fontWeight: "600",
    fontSize: 14,
  },
  productCard: {
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
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
    resizeMode: "cover",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 5,
    lineHeight: 16,
  },
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 12,
    color: "#666",
  },
  productRating: {
    fontSize: 12,
    color: "#666",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#22C55E",
  },
  heartButton: {
    padding: 5,
  },
  heartIcon: {
    fontSize: 16,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  gridContainer: {
    marginBottom: 16,
  },
  loadMoreButton: {
    backgroundColor: "#22C55E",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 16,
    marginHorizontal: 20,
  },
  loadMoreText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: "center",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: "#dc2626",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  retryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  endContainer: {
    padding: 20,
    alignItems: "center",
  },
  endText: {
    color: "#666",
    fontSize: 14,
    fontStyle: "italic",
  },
});
