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
  offer: OfferData;
  onPress?: (offer: OfferData) => void;
}

export function OfferCard({ offer, onPress }: OfferCardProps) {
  const handlePress = () => {
    onPress?.(offer);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: offer.backgroundColor }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <View style={styles.textSection}>
          <ThemedText style={styles.discountText}>{offer.discount}%</ThemedText>
          <ThemedText style={styles.titleText}>{offer.title}</ThemedText>
          <ThemedText style={styles.subtitleText}>{offer.subtitle}</ThemedText>
        </View>

        <View style={styles.imageSection}>
          <Image
            source={{ uri: offer.image }}
            style={styles.foodImage}
            resizeMode="cover"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
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
    textTransform: "uppercase",
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
