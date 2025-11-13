import { apiClient } from "@/utils/apiClient";

export interface DriverReview {
  id: number;
  userId: number;
  driverId: number;
  rating: number;
  review: string;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  driver: {
    id: number;
    name: string;
  };
}

// Driver Reviews API functions
export const driverReviewsApi = {
  // Get reviews for the current driver
  getDriverReviews: async (): Promise<DriverReview[]> => {
    const response = await apiClient.get<DriverReview[]>("/driver-reviews/user");
    return response.data;
  },
};

// Helper function to calculate average rating
export const calculateAverageRating = (reviews: DriverReview[]): number => {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Number((sum / reviews.length).toFixed(1));
};
