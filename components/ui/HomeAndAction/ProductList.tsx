import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  liked: boolean;
}

interface ProductListProps {
  products: Product[];
  onToggleLike: (id: number) => void;
  onProductPress?: (product: Product) => void;
}

export default function ProductList({
  products,
  onToggleLike,
  onProductPress,
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
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.productDetails}>
          <View style={styles.leftDetails}>
            <Text style={styles.productCategory}>{item.category}</Text>
            <Text style={styles.productRating}>⭐ {item.rating}</Text>
          </View>
          <View style={styles.rightDetails}>
            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
            <TouchableOpacity
              style={styles.heartButton}
              onPress={() => onToggleLike(item.id)}
            >
              <Text style={styles.heartIcon}>{item.liked ? "❤️" : "🤍"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Products</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
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
  row: {
    justifyContent: "space-between",
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
    lineHeight: 16,
  },
  productDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  leftDetails: {
    flex: 1,
  },
  rightDetails: {
    alignItems: "flex-end",
  },
  productCategory: {
    fontSize: 10,
    color: "#999",
    marginBottom: 2,
  },
  productRating: {
    fontSize: 12,
    color: "#666",
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#22C55E",
    marginBottom: 4,
  },
  heartButton: {
    padding: 4,
  },
  heartIcon: {
    fontSize: 16,
  },
});
