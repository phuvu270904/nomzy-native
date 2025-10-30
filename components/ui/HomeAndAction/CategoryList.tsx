import { useFetch } from "@/hooks/useFetch";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function CategoryList() {
  const {
    data: categories,
    loading,
    error,
  } = useFetch<Category[]>("/categories");

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Error loading categories: {error}</Text>
      </View>
    );
  }

  if (!categories || categories.length === 0) {
    return <View></View>;
  }

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/categories/${categoryId}` as any);
  };

  const handleMorePress = () => {
    router.push("/categories" as any);
  };

  return (
    <View style={styles.container}>
      {categories.slice(0, 7).map((cat, index) => (
        <TouchableOpacity
          key={cat.id || index}
          style={styles.item}
          onPress={() => handleCategoryPress(cat.id)}
        >
          <View style={styles.iconContainer}>
            <Image
              source={{ uri: cat.icon }}
              style={styles.iconImage}
              resizeMode="contain"
              onError={(error) =>
                console.log("Image load error:", error.nativeEvent.error)
              }
            />
          </View>
          <Text style={styles.label}>{cat.name}</Text>
        </TouchableOpacity>
      ))}
      {categories.length > 7 && (
        <TouchableOpacity style={styles.item} onPress={handleMorePress}>
          <View style={styles.iconContainer}>
            <Text style={styles.moreIcon}>...</Text>
          </View>
          <Text style={styles.label}>More</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  item: {
    width: "25%",
    alignItems: "center",
    marginVertical: 10,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  iconImage: {
    width: 30,
    height: 30,
  },
  icon: {
    fontSize: 24,
    color: "#4CAF50",
  },
  label: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  moreIcon: {
    fontSize: 24,
    color: "#666",
    fontWeight: "bold",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  errorText: {
    fontSize: 14,
    color: "#ff4444",
    textAlign: "center",
  },
});
