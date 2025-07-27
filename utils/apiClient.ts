import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";
import { router } from "expo-router";

// Base API configuration
const getApiBaseUrl = () => {
  if (!__DEV__) {
    return "https://your-api-domain.com/api"; // Production URL
  }

  const { expoConfig } = Constants;
  if (expoConfig?.hostUri) {
    const ip = expoConfig.hostUri.split(":")[0];
    return `http://${ip}:8190/api`;
  }

  return "http://localhost:8190/api";
};

const API_BASE_URL = getApiBaseUrl();

// Helper function to handle logout and redirect
const handleAuthFailure = async (message: string = "Authentication failed") => {
  console.log(message);

  // Clear all authentication data
  await AsyncStorage.multiRemove(["auth_token", "refresh_token", "user_data"]);

  // Redirect to auth page
  try {
    router.replace("/auth");
  } catch (routerError) {
    console.error("Error redirecting to auth:", routerError);
  }
};

// Token refresh flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });

  failedQueue = [];
};

// Function to refresh token
const refreshAuthToken = async (): Promise<string> => {
  try {
    const refreshToken = await AsyncStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    console.log("Attempting refresh with token in request body...");

    // Create a separate axios instance for token refresh to avoid interceptors
    const refreshInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await refreshInstance.post("/auth/refresh", {
      refreshToken,
    });

    console.log("Refresh request successful, processing response...");
    const { jwt } = response.data;

    // Validate token before storing
    if (!jwt) {
      throw new Error("No JWT token received from refresh endpoint");
    }

    console.log("Refresh response received:", {
      hasJWT: !!jwt,
    });

    // Store the new JWT token
    await AsyncStorage.setItem("auth_token", jwt);

    console.log("Token refreshed successfully");
    return jwt;
  } catch (error: any) {
    console.error(
      "Token refresh failed:",
      error.response?.data || error.message,
    );

    // Check if the error is due to unauthorized refresh token
    if (error.response?.status === 401 || error.response?.status === 403) {
      await handleAuthFailure(
        "Refresh token expired or invalid, redirecting to auth",
      );
    } else {
      // If refresh fails for other reasons, still clear tokens but don't redirect
      await AsyncStorage.multiRemove([
        "auth_token",
        "refresh_token",
        "user_data",
      ]);
    }

    throw error;
  }
};

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
    const originalRequest = error.config;

    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);

      // Handle token expiration
      if (
        (error.response.status === 401 ||
          error.response.data?.message === "TOKEN_EXPIRED") &&
        !originalRequest._retry
      ) {
        console.log("Token expired, attempting to refresh...");

        if (isRefreshing) {
          console.log("Token refresh already in progress, queuing request...");
          // If already refreshing, queue the request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log("Starting token refresh process...");
          const newToken = await refreshAuthToken();
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          console.log(
            "Token refreshed successfully, retrying original request...",
          );
          return apiClient(originalRequest);
        } catch (refreshError: any) {
          console.error("Token refresh process failed:", refreshError.message);
          processQueue(refreshError, null);

          // If refresh failed due to unauthorized, redirect to auth
          if (
            refreshError.response?.status === 401 ||
            refreshError.response?.status === 403
          ) {
            await handleAuthFailure(
              "Token refresh failed, redirecting to auth",
            );
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Handle other 401 errors (invalid credentials, etc.)
      if (error.response?.status === 401) {
        await handleAuthFailure("Unauthorized access, redirecting to auth");
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
