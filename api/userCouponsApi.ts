import { apiClient } from "@/utils/apiClient";

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

export interface UserCoupon {
  id: number;
  userId: number;
  couponId: number;
  status: "claimed" | "used" | "expired";
  usedAt: string | null;
  createdAt: string;
  updatedAt: string;
  coupon: Coupon;
}

export const userCouponsApi = {
  // Get all user coupons
  getUserCoupons: async (): Promise<UserCoupon[]> => {
    const response = await apiClient.get<UserCoupon[]>("/user-coupons");
    return response.data;
  },

  // Update user coupon status
  updateUserCouponStatus: async (
    id: number,
    status: "used" | "expired"
  ): Promise<UserCoupon> => {
    const response = await apiClient.put<UserCoupon>(`/user-coupons/${id}`, {
      status,
    });
    return response.data;
  },
};
