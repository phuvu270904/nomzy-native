import apiClient from "@/utils/apiClient";
import { useEffect, useState } from "react";

interface UserLocation {
  lng: number;
  lat: number;
  hasLocation: boolean;
}

export const useUserLocation = (): UserLocation => {
  const [location, setLocation] = useState<UserLocation>({
    lng: 0,
    lat: 0,
    hasLocation: false,
  });

  useEffect(() => {
    const fetchDefaultLocation = async () => {
      try {
        const response = await apiClient.get("/addresses/default");
        const data = response.data;

        setLocation({
          lng: data?.longitude,
          lat: data?.latitude,
          hasLocation: !!(data?.longitude && data?.latitude),
        });
      } catch (error) {
        console.error("Failed to fetch default location:", error);
      }
    };

    fetchDefaultLocation();
  }, []);

  return location;
};
