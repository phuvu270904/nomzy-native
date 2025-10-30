import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "driver";
}

interface AuthState {
  token: string | null;
  user: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_DATA_KEY = "user_data";

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state from storage
  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const [token, refreshToken, userData] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(REFRESH_TOKEN_KEY),
        AsyncStorage.getItem(USER_DATA_KEY),
      ]);

      if (token && refreshToken) {
        // Parse user data if available
        let user = null;
        if (userData) {
          try {
            user = JSON.parse(userData);
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
          }
        }

        // Only consider authenticated if we have both tokens
        setAuthState({
          token,
          user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        // Clear any invalid tokens
        if (token || refreshToken) {
          await AsyncStorage.multiRemove([
            AUTH_TOKEN_KEY,
            REFRESH_TOKEN_KEY,
            USER_DATA_KEY,
          ]);
        }
        setAuthState((prev) => ({
          ...prev,
          user: null,
          isLoading: false,
          isAuthenticated: false,
        }));
      }
    } catch (error) {
      console.error("Error loading auth state:", error);
      setAuthState((prev) => ({
        ...prev,
        user: null,
        isLoading: false,
      }));
    }
  };

  const login = async (token: string, refreshToken: string) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(AUTH_TOKEN_KEY, token),
        AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
      ]);

      setAuthState({
        token,
        user: null, // User data will be fetched separately
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error("Error saving auth data:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(USER_DATA_KEY),
      ]);

      setAuthState({
        token: null,
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error("Error clearing auth data:", error);
      throw error;
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(updatedUser));
      setAuthState((prev) => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      console.error("Error updating user data:", error);
      throw error;
    }
  };

  const refreshToken = async (): Promise<string | null> => {
    try {
      const storedRefreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!storedRefreshToken) {
        throw new Error("No refresh token available");
      }

      // This will be used by apiClient to refresh the token
      return storedRefreshToken;
    } catch (error) {
      console.error("Error getting refresh token:", error);
      // If refresh fails, logout the user
      await logout();
      return null;
    }
  };

  const updateTokens = async (
    newAccessToken: string,
    newRefreshToken?: string,
  ) => {
    try {
      const promises = [AsyncStorage.setItem(AUTH_TOKEN_KEY, newAccessToken)];

      if (newRefreshToken) {
        promises.push(AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken));
      }

      await Promise.all(promises);

      setAuthState((prev) => ({
        ...prev,
        token: newAccessToken,
      }));
    } catch (error) {
      console.error("Error updating tokens:", error);
      throw error;
    }
  };

  const fetchUserProfile = async (): Promise<any | null> => {
    try {
      const { apiClient } = await import("@/utils/apiClient");
      const response = await apiClient.get("/auth/profile");

      if (response.data) {
        const userData = response.data;

        // Store user data in AsyncStorage
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));

        // Update auth state with user data
        setAuthState((prev) => ({
          ...prev,
          user: userData,
        }));

        return userData;
      }

      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const forceLogout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(USER_DATA_KEY),
      ]);

      setAuthState({
        token: null,
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error("Error during force logout:", error);
    }
  };

  return {
    ...authState,
    login,
    logout,
    updateUser,
    refreshToken,
    updateTokens,
    forceLogout,
    fetchUserProfile,
  };
};
