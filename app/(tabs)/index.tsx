import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Sample data
const categories = [
  { id: '1', name: 'Burger', icon: '🍔' },
  { id: '2', name: 'Pizza', icon: '🍕' },
  { id: '3', name: 'Noodle', icon: '🍜' },
  { id: '4', name: 'Meat', icon: '🥩' },
  { id: '5', name: 'Dessert', icon: '🍰' },
  { id: '6', name: 'Drink', icon: '🥤' },
  { id: '7', name: 'More', icon: '➕' },
];

const discountRestaurants = [
  {
    id: '1',
    name: 'Mixed Salad Bowls',
    image: '/placeholder.svg?height=120&width=160',
    rating: 4.9,
    deliveryTime: '15-20',
    deliveryFee: 'Free',
  },
  {
    id: '2',
    name: 'Vegetarian Meals',
    image: '/placeholder.svg?height=120&width=160',
    rating: 4.8,
    deliveryTime: '20-25',
    deliveryFee: '$2.99',
  },
];

const recommendedItems = [
  {
    id: '1',
    name: 'Vegetarian Noodles',
    image: '/placeholder.svg?height=80&width=80',
    rating: 4.8,
    price: '$12.99',
    restaurant: 'Healthy Kitchen',
  },
  {
    id: '2',
    name: 'Pizza Hut - Yummy',
    image: '/placeholder.svg?height=80&width=80',
    rating: 4.7,
    price: '$15.99',
    restaurant: 'Pizza Hut',
  },
  {
    id: '3',
    name: 'Novosibirsk Cheese Burger',
    image: '/placeholder.svg?height=80&width=80',
    rating: 4.6,
    price: '$8.99',
    restaurant: 'Burger Palace',
  },
  {
    id: '4',
    name: 'Fruit Salad - Europe',
    image: '/placeholder.svg?height=80&width=80',
    rating: 4.8,
    price: '$6.99',
    restaurant: 'Fresh Garden',
  },
];

export default function HomeScreen() {
  // function resetOnboardingAndRestart() {
  //   import('@/utils/onboarding').then(({ resetOnboardingStatus }) => {
  //     resetOnboardingStatus().then(() => {
  //       // Force reload the app to trigger onboarding
  //       router.replace('/onboarding');
  //     });
  //   });
  // }

  const renderCategory = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity style={styles.categoryItem} activeOpacity={0.7}>
      <View style={styles.categoryIcon}>
        <ThemedText style={styles.categoryEmoji}>{item.icon}</ThemedText>
      </View>
      <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  const renderDiscountRestaurant = ({ item }: { item: typeof discountRestaurants[0] }) => (
    <TouchableOpacity style={styles.restaurantCard} activeOpacity={0.7}>
      <Image source={{ uri: item.image }} style={styles.restaurantImage} />
      <View style={styles.restaurantInfo}>
        <ThemedText style={styles.restaurantName}>{item.name}</ThemedText>
        <View style={styles.restaurantDetails}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <ThemedText style={styles.rating}>{item.rating}</ThemedText>
          </View>
          <ThemedText style={styles.deliveryInfo}>
            {item.deliveryTime} min • {item.deliveryFee}
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRecommendedItem = ({ item }: { item: typeof recommendedItems[0] }) => (
    <TouchableOpacity style={styles.recommendedItem} activeOpacity={0.7}>
      <Image source={{ uri: item.image }} style={styles.recommendedImage} />
      <View style={styles.recommendedInfo}>
        <ThemedText style={styles.recommendedName}>{item.name}</ThemedText>
        <ThemedText style={styles.recommendedRestaurant}>{item.restaurant}</ThemedText>
        <View style={styles.recommendedDetails}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <ThemedText style={styles.recommendedRating}>{item.rating}</ThemedText>
          </View>
          <ThemedText style={styles.recommendedPrice}>{item.price}</ThemedText>
        </View>
      </View>
      <TouchableOpacity style={styles.favoriteButton}>
        <Ionicons name="heart-outline" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={{ uri: '/placeholder.svg?height=40&width=40' }}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <ThemedText style={styles.greeting}>Good Morning</ThemedText>
              <ThemedText style={styles.userName}>Trina Square</ThemedText>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="notifications-outline" size={24} color="#2E2E2E" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="bag-outline" size={24} color="#2E2E2E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Special Offers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Special Offers</ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.seeAll}>See all</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.offerBanner}>
            <View style={styles.offerContent}>
              <ThemedText style={styles.offerDiscount}>30%</ThemedText>
              <ThemedText style={styles.offerText}>OFF</ThemedText>
              <ThemedText style={styles.offerSubtext}>Free delivery</ThemedText>
            </View>
            <Image
              source={{ uri: '/placeholder.svg?height=80&width=100' }}
              style={styles.offerImage}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          />
        </View>

        {/* Discount Guaranteed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Discount Guaranteed</ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.seeAll}>See all</ThemedText>
            </TouchableOpacity>
          </View>
          <FlatList
            data={discountRestaurants}
            renderItem={renderDiscountRestaurant}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.restaurantsContainer}
          />
        </View>

        {/* Recommended for You */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recommended for You</ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.seeAll}>See all</ThemedText>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recommendedItems}
            renderItem={renderRecommendedItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* <ThemedView>
          <ThemedText type="subtitle">Test Onboarding</ThemedText>
          <ThemedText>Want to see the onboarding screens again?</ThemedText>
          <TouchableOpacity
            onPress={resetOnboardingAndRestart}>
            <ThemedText>Reset Onboarding</ThemedText>
          </TouchableOpacity>
        </ThemedView> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 50,
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E2E2E',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E2E2E',
  },
  seeAll: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  offerBanner: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerContent: {
    flex: 1,
  },
  offerDiscount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  offerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    // marginTop: 8,
  },
  offerSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  offerImage: {
    width: 100,
    height: 80,
    borderRadius: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    color: '#2E2E2E',
    fontWeight: '500',
  },
  restaurantsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  restaurantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    width: 160,
  },
  restaurantImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  restaurantInfo: {
    padding: 12,
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E2E2E',
    marginBottom: 8,
  },
  restaurantDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#2E2E2E',
    marginLeft: 4,
    fontWeight: '500',
  },
  deliveryInfo: {
    fontSize: 10,
    color: '#9E9E9E',
  },
  recommendedItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  recommendedImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  recommendedInfo: {
    flex: 1,
  },
  recommendedName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E2E2E',
    marginBottom: 4,
  },
  recommendedRestaurant: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 8,
  },
  recommendedDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendedRating: {
    fontSize: 12,
    color: '#2E2E2E',
    marginLeft: 4,
    fontWeight: '500',
  },
  recommendedPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  favoriteButton: {
    padding: 8,
  },
});