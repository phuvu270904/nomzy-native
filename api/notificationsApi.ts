import { apiClient } from "@/utils/apiClient";

export interface Notification {
  id: number;
  title: string;
  message: string;
  image: string | null;
  userId: number;
  isRead: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch all notifications for the current user
 */
export const fetchNotifications = async (): Promise<Notification[]> => {
  try {
    const response = await apiClient.get<Notification[]>("/notifications");
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};
