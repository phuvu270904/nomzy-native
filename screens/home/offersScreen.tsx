import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { FlatList, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OfferCard, OfferData } from "@/components/offers/OfferCard";
import { SpecialOffersHeader } from "@/components/offers/SpecialOffersHeader";
import { ThemedView } from "@/components/ThemedView";

// Sample offers data
const sampleOffers: OfferData[] = [
  {
    id: "1",
    discount: 30,
    title: "DISCOUNT ONLY",
    subtitle: "VALID FOR TODAY!",
    image: "/placeholder.svg?height=80&width=80",
    backgroundColor: "#4CAF50",
    category: "burger",
    validUntil: "Today",
  },
  {
    id: "2",
    discount: 15,
    title: "DISCOUNT ONLY",
    subtitle: "VALID FOR TODAY!",
    image: "/placeholder.svg?height=80&width=80",
    backgroundColor: "#FF9800",
    category: "salad",
    validUntil: "Today",
  },
  {
    id: "3",
    discount: 20,
    title: "DISCOUNT ONLY",
    subtitle: "VALID FOR TODAY!",
    image: "/placeholder.svg?height=80&width=80",
    backgroundColor: "#E91E63",
    category: "pasta",
    validUntil: "Today",
  },
  {
    id: "4",
    discount: 25,
    title: "DISCOUNT ONLY",
    subtitle: "VALID FOR TODAY!",
    image: "/placeholder.svg?height=80&width=80",
    backgroundColor: "#3F51B5",
    category: "noodles",
    validUntil: "Today",
  },
];

export default function SpecialOffersScreen() {
  const handleBack = () => {
    router.back();
  };

  const handleOfferPress = (offer: OfferData) => {
    console.log("Offer pressed:", offer);

    // Navigate to category or specific offer details
    if (offer.category) {
      // router.navigate(`/category/${offer.category}?discount=${offer.discount}`);
    }

    // Or navigate to a specific offer details page
    // router.navigate(`/offer-details/${offer.id}`);

    // For now, just log the offer
    console.log(
      `${offer.discount}% off on ${offer.category} - Valid ${offer.validUntil}`,
    );
  };

  const renderOffer = ({ item }: { item: OfferData }) => (
    <OfferCard offer={item} onPress={handleOfferPress} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <SpecialOffersHeader onBack={handleBack} />

      <ThemedView style={styles.content}>
        <FlatList
          data={sampleOffers}
          renderItem={renderOffer}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  listContainer: {
    paddingTop: 20,
    paddingBottom: 100, // Space for tab navigation
  },
});
