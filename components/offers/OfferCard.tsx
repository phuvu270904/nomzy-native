import { RestaurantCoupon } from "@/api/couponsApi";
import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

export interface OfferData {
  id: string;
  discount: number;
  title: string;
  subtitle: string;
  image: string;
  backgroundColor: string;
  validUntil?: string;
  category?: string;
}

interface OfferCardProps {
  offer?: OfferData;
  restaurantCoupon?: RestaurantCoupon;
  onPress?: (offer: OfferData | RestaurantCoupon) => void;
}

export function OfferCard({ offer, restaurantCoupon, onPress }: OfferCardProps) {
  const handlePress = () => {
    if (restaurantCoupon) {
      onPress?.(restaurantCoupon);
    } else if (offer) {
      onPress?.(offer);
    }
  };

  // Get data from either offer or restaurantCoupon
  const discountValue = restaurantCoupon 
    ? restaurantCoupon.coupon.type === "percentage" 
      ? Math.round(parseFloat(restaurantCoupon.coupon.value))
      : Math.round(parseFloat(restaurantCoupon.coupon.value))
    : offer?.discount || 0;
  
  const discountText = restaurantCoupon
    ? restaurantCoupon.coupon.type === "percentage" 
      ? `${discountValue}%`
      : `$${discountValue}`
    : `${discountValue}%`;
  
  const title = restaurantCoupon 
    ? restaurantCoupon.coupon.name 
    : offer?.title || "";
  
  const subtitle = restaurantCoupon 
    ? restaurantCoupon.coupon.description 
    : offer?.subtitle || "";
  
  const image = restaurantCoupon 
    ? restaurantCoupon.restaurant.avatar 
    : offer?.image || "";
  
  const backgroundColor = restaurantCoupon
    ? generateColorFromId(restaurantCoupon.id)
    : offer?.backgroundColor || "#4CAF50";

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.textSection}>
          <ThemedText style={styles.discountText}>{discountText}</ThemedText>
          <ThemedText style={styles.titleText} numberOfLines={1}>{title}</ThemedText>
          <ThemedText style={styles.subtitleText} numberOfLines={2}>{subtitle}</ThemedText>
        </View>

        <View style={styles.imageSection}>
          <Image
            source={{ uri: image }}
            style={styles.foodImage}
            resizeMode="cover"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// Helper function to generate consistent colors based on ID
function generateColorFromId(id: number): string {
  const colors = [
    "#4CAF50", // Green
    "#FF9800", // Orange
    "#E91E63", // Pink
    "#3F51B5", // Indigo
    "#00BCD4", // Cyan
    "#FFC107", // Amber
    "#9C27B0", // Purple
    "#FF5722", // Deep Orange
    "#009688", // Teal
    "#673AB7", // Deep Purple
  ];
  return colors[id % colors.length];
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
    minHeight: 120,
  },
  textSection: {
    flex: 1,
    paddingRight: 16,
  },
  discountText: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 4,
    lineHeight: 40,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    opacity: 0.9,
    letterSpacing: 0.3,
  },
  imageSection: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  foodImage: {
    width: "100%",
    height: "100%",
  },
});
