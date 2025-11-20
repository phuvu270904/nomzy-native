import apiClient from "@/utils/apiClient";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  discountPrice: string | null;
  imageUrl: string;
  isActive: boolean;
  restaurantId: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: number;
  userId: number;
  streetAddress: string;
  city: string;
  country: string;
  postalCode: string;
  state: string;
  isDefault: boolean;
  label: string;
  latitude: string;
  longitude: string;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: number;
  name: string;
  code: string;
  description: string;
  type: string;
  value: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  validFrom: string;
  validUntil: string;
}

export interface Restaurant {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  products: Product[];
  addresses: Address[];
  image: string;
  reviews: number;
  rating: number;
  liked: boolean;
  offers: Offer[];
}

export interface SearchRestaurantsResponse {
  restaurants: Restaurant[];
  totalCount: number;
}

// Search restaurants
export const searchRestaurants = async (
  query: string
): Promise<Restaurant[]> => {
  const response = await apiClient.get("/restaurants/search", {
    params: { query },
  });
  return response.data;
};

// Get recommended restaurants
export const getRecommendedRestaurants = async (): Promise<Restaurant[]> => {
  const response = await apiClient.get("/restaurants");
  return response.data;
};
