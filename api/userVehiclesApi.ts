import { apiClient } from "@/utils/apiClient";

export interface UserVehicle {
  id: number;
  userId: number;
  type: string;
  vehName: string;
  regNumber: string;
  license: string;
  createdAt: string;
  updatedAt: string;
}

// User Vehicles API functions
export const userVehiclesApi = {
  // Get user's vehicles
  getUserVehicles: async (): Promise<UserVehicle[]> => {
    const response = await apiClient.get<UserVehicle[]>("/user-vehicles");
    return response.data;
  },
};
