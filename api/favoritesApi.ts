import { apiClient } from "@/utils/apiClient";

// Favorite Types
export interface FavoriteResponse {
  id: number;
  userId: number;
  restaurantId: number;
  createdAt: string;
  restaurant: {
    id: number;
    name: string;
    avatar: string;
  };
}

// Favorites API functions
export const favoritesApi = {
  // Get user's favorite restaurants
  getFavorites: async (): Promise<FavoriteResponse[]> => {
    const response = await apiClient.get<FavoriteResponse[]>("/favorites");
    return response.data;
  },

  // Add restaurant to favorites
  addFavorite: async (restaurantId: number): Promise<FavoriteResponse> => {
    const response = await apiClient.post<FavoriteResponse>(
      `/favorites/${restaurantId}`
    );
    return response.data;
  },

  // Remove restaurant from favorites
  removeFavorite: async (restaurantId: number): Promise<void> => {
    await apiClient.delete(`/favorites/${restaurantId}`);
  },
};
