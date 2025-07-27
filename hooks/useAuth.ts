import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed
}

interface AuthState {
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_DATA_KEY = "user_data";

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Initialize auth state from storage
  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const [token, refreshToken] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(REFRESH_TOKEN_KEY),
      ]);

      if (token && refreshToken) {
        // Only consider authenticated if we have both tokens
        setAuthState({
          token,
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
          isLoading: false,
          isAuthenticated: false,
        }));
      }
    } catch (error) {
      console.error("Error loading auth state:", error);
      setAuthState((prev) => ({
        ...prev,
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

  const forceLogout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(AUTH_TOKEN_KEY),
        AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
        AsyncStorage.removeItem(USER_DATA_KEY),
      ]);

      setAuthState({
        token: null,
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
  };
};
