import { apiClient } from "@/utils/apiClient";

// Driver Review Types
export interface DriverReviewRequest {
  rating: number;
  review: string;
  isAnonymous: boolean;
}

export interface DriverReviewResponse {
  id: number;
  userId: number;
  driverId: number;
  rating: number;
  review: string;
  isAnonymous: boolean;
  user: {
    id: number;
    name: string;
    email: string;
  };
  driver: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Restaurant Feedback Types
export interface RestaurantFeedbackRequest {
  rating: number;
  review: string;
  isAnonymous: boolean;
}

export interface RestaurantFeedbackResponse {
  id: number;
  userId: number;
  restaurantId: number;
  rating: number;
  review: string;
  isAnonymous: boolean;
  user: {
    id: number;
    name: string;
    email: string;
  };
  restaurant: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Reviews API functions
export const reviewsApi = {
  // Submit driver review
  submitDriverReview: async (
    driverId: number,
    data: DriverReviewRequest
  ): Promise<DriverReviewResponse> => {
    const response = await apiClient.post<DriverReviewResponse>(
      `/driver-reviews/driver/${driverId}`,
      data
    );
    return response.data;
  },

  // Get driver reviews (for driver to see their own reviews)
  getDriverReviews: async (): Promise<DriverReviewResponse[]> => {
    const response = await apiClient.get<DriverReviewResponse[]>(
      `/driver-reviews/user`
    );
    return response.data;
  },

  // Submit restaurant feedback
  submitRestaurantFeedback: async (
    restaurantId: number,
    data: RestaurantFeedbackRequest
  ): Promise<RestaurantFeedbackResponse> => {
    const response = await apiClient.post<RestaurantFeedbackResponse>(
      `/feedbacks/restaurant/${restaurantId}`,
      data
    );
    return response.data;
  },
};
