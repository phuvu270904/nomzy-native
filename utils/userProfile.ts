import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./apiClient";

const USER_DATA_KEY = "user_data";

export interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed
}

/**
 * Fetch user profile from the API and store it in AsyncStorage
 * This can be used anywhere in your app
 */
export const fetchAndStoreUserProfile = async (): Promise<User | null> => {
  try {
    const response = await apiClient.get("/auth/profile");

    if (response.data) {
      const userData = response.data;

      // Store user data in AsyncStorage
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

      return userData;
    }

    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

/**
 * Get stored user profile from AsyncStorage
 */
export const getStoredUserProfile = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error("Error getting stored user profile:", error);
    return null;
  }
};

/**
 * Clear stored user profile from AsyncStorage
 */
export const clearStoredUserProfile = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error("Error clearing stored user profile:", error);
  }
};
