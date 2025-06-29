import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Base API configuration
const API_BASE_URL = __DEV__
  ? "http://localhost:3000/api" // Development URL
  : "https://your-api-domain.com/api"; // Production URL

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting auth token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      await AsyncStorage.multiRemove(["auth_token", "user_data"]);
      // You might want to redirect to login screen here
    }
    return Promise.reject(error);
  },
);

export default apiClient;
