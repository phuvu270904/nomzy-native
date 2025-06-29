import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

// Base API configuration
const getApiBaseUrl = () => {
  if (!__DEV__) {
    return "https://your-api-domain.com/api"; // Production URL
  }

  // Development URLs - uncomment the one you need

  // Option 1: For Android Emulator
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8190/api";
  }

  // Option 2: For iOS Simulator
  if (Platform.OS === "ios") {
    return "http://localhost:8190/api";
  }

  // Option 3: For Physical Device - Replace with your computer's IP
  // return "http://192.168.1.100:8190/api"; // Replace with your actual IP

  // Fallback
  return "http://localhost:8190/api";
};

const API_BASE_URL = getApiBaseUrl();

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
    console.log(
      "Making API request to:",
      `${config.baseURL || ""}${config.url || ""}`,
    );
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
    console.log("API response received:", response.status, response.statusText);
    return response;
  },
  async (error) => {
    console.error("API request failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    if (error.response?.status === 401) {
      // Handle unauthorized access
      await AsyncStorage.multiRemove(["auth_token", "user_data"]);
      // You might want to redirect to login screen here
    }
    return Promise.reject(error);
  },
);

export default apiClient;
