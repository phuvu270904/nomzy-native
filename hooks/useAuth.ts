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
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem(AUTH_TOKEN_KEY),
        AsyncStorage.getItem(USER_DATA_KEY),
      ]);

      if (token && userData) {
        const user = JSON.parse(userData);
        setAuthState({
          token,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
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

  const login = async (token: string) => {
    try {
      await Promise.all([AsyncStorage.setItem(AUTH_TOKEN_KEY, token)]);

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

  return {
    ...authState,
    login,
    logout,
    updateUser,
  };
};
