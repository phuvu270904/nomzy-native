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

export interface SendVerificationCodeRequest {
  email: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  verificationCode: string;
}

export interface RegisterDriverRequest {
  name: string;
  email: string;
  password: string;
  phone_number: string;
  verificationCode: string;
}

// Auth API functions
export const authApi = {
  // Send verification code to email
  sendVerificationCode: async (
    data: SendVerificationCodeRequest
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      "/auth/send-verification-code",
      data
    );
    return response.data;
  },

  // Verify email with code
  verifyEmail: async (
    data: VerifyEmailRequest
  ): Promise<{ message: string; verified: boolean }> => {
    const response = await apiClient.post<{ message: string; verified: boolean }>(
      "/auth/verify-email",
      data
    );
    return response.data;
  },

  // Register user with verification code
  registerUser: async (data: RegisterUserRequest): Promise<any> => {
    const response = await apiClient.post("/auth/registerUser", data);
    return response.data;
  },

  // Register driver with verification code
  registerDriver: async (data: RegisterDriverRequest): Promise<any> => {
    const response = await apiClient.post("/auth/registerDriver", data);
    return response.data;
  },

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
