import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { addToCartAsync, fetchCart } from "@/store/slices/cartSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { apiClient } from "@/utils/apiClient";

interface Product {
  id: number;
  name: string;
  price: string;
  discountPrice?: string;
  description?: string;
  imageUrl?: string;
  category?:
    | string
    | {
        id: number;
        name: string;
        icon?: string;
        isActive?: boolean;
        createdAt?: string;
        updatedAt?: string;
      };
  restaurant?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { error: cartError } = useAppSelector((state) => state.cart);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/products/${id}`);
      setProduct(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch product details");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setAddingToCart(true);

      // Dispatch add to cart action
      const result = await dispatch(
        addToCartAsync({
          productId: product.id,
          quantity,
        }),
      );

      if (addToCartAsync.fulfilled.match(result)) {
        // Refetch cart to ensure we have complete product data
        await dispatch(fetchCart());
        
        // Success - show confirmation
        Alert.alert(
          "Added to Cart",
          `${product.name} (${quantity}x) has been added to your cart.`,
          [
            {
              text: "Continue Shopping",
              style: "cancel",
            },
            {
              text: "View Cart",
              onPress: () => router.push("/carts"),
            },
          ],
        );
      } else {
        // Handle error
        const errorMessage =
          (result.payload as string) ||
          cartError ||
          "Failed to add item to cart";
        Alert.alert("Error", errorMessage, [
          {
            text: "OK",
            style: "default",
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add item to cart", [
        {
          text: "OK",
          style: "default",
        },
      ]);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22C55E" />
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || "Product not found"}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchProductDetails}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentPrice = product.discountPrice || product.price;
  const hasDiscount =
    product.discountPrice && product.discountPrice !== product.price;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: product.imageUrl || "https://via.placeholder.com/400x300",
            }}
            style={styles.productImage}
          />

          {/* Header Overlay */}
          <View style={styles.headerOverlay}>
            <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.headerButton} onPress={handleLike}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? "#FF4757" : "#000"}
              />
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.titleSection}>
            <Text style={styles.productName}>{product.name}</Text>
            {product.restaurant && (
              <Text style={styles.restaurantName}>
                by {product.restaurant.name}
              </Text>
            )}
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text style={styles.currentPrice}>${currentPrice}</Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>${product.price}</Text>
            )}
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* Category */}
          {product.category && (
            <View style={styles.categorySection}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>
                  {typeof product.category === "string"
                    ? product.category
                    : product.category?.name}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Cart Section */}
      <View style={styles.bottomSection}>
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(-1)}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.addToCartButton,
            addingToCart && styles.addToCartButtonDisabled,
          ]}
          onPress={handleAddToCart}
          disabled={addingToCart}
        >
          {addingToCart ? (
            <View style={styles.addToCartLoading}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={[styles.addToCartText, { marginLeft: 8 }]}>
                Adding...
              </Text>
            </View>
          ) : (
            <Text style={styles.addToCartText}>
              Add to Cart - ${(parseFloat(currentPrice) * quantity).toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF4757",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    height: 300,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  headerOverlay: {
    position: "absolute",
    top: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  discountBadge: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "#22C55E",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  productInfo: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 16,
    color: "#666",
  },
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: "700",
    color: "#22C55E",
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 18,
    color: "#999",
    textDecorationLine: "line-through",
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  bottomSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quantitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: "center",
  },
  addToCartButton: {
    backgroundColor: "#22C55E",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  addToCartButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  addToCartLoading: {
    flexDirection: "row",
    alignItems: "center",
  },
  addToCartText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});
