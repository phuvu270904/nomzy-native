import { apiClient } from "@/utils/apiClient";

export interface UpdateProfileRequest {
  name?: string;
  gender?: "male" | "female" | "other";
  phone_number?: string;
  avatar?: string;
}

export interface UserProfileResponse {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  avatar?: string;
  gender?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Auth API functions
export const authApi = {
  // Update user profile
  updateProfile: async (
    profileData: UpdateProfileRequest
  ): Promise<UserProfileResponse> => {
    const response = await apiClient.post<UserProfileResponse>(
      "/auth/updateProfile",
      profileData
    );
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<{ user: UserProfileResponse }> => {
    const response = await apiClient.get<{ user: UserProfileResponse }>(
      "/auth/profile"
    );
    return response.data;
  },
};
