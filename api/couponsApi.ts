import { apiClient } from "@/utils/apiClient";

// Types
export interface Coupon {
  id: number;
  name: string;
  code: string;
  description: string;
  type: "percentage" | "fixed";
  value: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  isGlobal: boolean;
  usageLimit: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Restaurant {
  id: number;
  name: string;
  gender: string | null;
  email: string;
  password: string;
  phone_number: string;
  avatar: string;
  role: string;
  refresh_token: string;
  resetToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantCoupon {
  id: number;
  restaurantId: number;
  couponId: number;
  createdAt: string;
  updatedAt: string;
  coupon: Coupon;
  restaurant: Restaurant;
}

export interface ClaimCouponRequest {
  couponId: number;
}

export interface ClaimCouponResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Get all restaurant coupons
 */
export const getAllRestaurantCoupons = async (): Promise<
  RestaurantCoupon[]
> => {
  try {
    const response = await apiClient.get<RestaurantCoupon[]>(
      "/restaurant-coupons/all"
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all restaurant coupons:", error);
    throw error;
  }
};

/**
 * Get coupons for a specific restaurant
 */
export const getRestaurantCoupons = async (
  restaurantId: number
): Promise<RestaurantCoupon[]> => {
  try {
    const response = await apiClient.get<RestaurantCoupon[]>(
      `/restaurant-coupons/restaurant/${restaurantId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching coupons for restaurant ${restaurantId}:`,
      error
    );
    throw error;
  }
};

/**
 * Claim a coupon
 */
export const claimCoupon = async (
  couponId: number
): Promise<ClaimCouponResponse> => {
  try {
    const response = await apiClient.post<ClaimCouponResponse>(
      "/user-coupons/claim",
      { couponId }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error claiming coupon:", error);
    
    // Return a structured error response
    if (error.response?.data) {
      throw error.response.data;
    }
    
    throw {
      success: false,
      message: error.message || "Failed to claim coupon",
    };
  }
};
