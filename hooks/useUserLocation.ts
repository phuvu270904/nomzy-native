import { useMemo } from "react";
import { useAuth } from "./useAuth";

interface UserLocation {
  lng: number | undefined;
  lat: number | undefined;
  hasLocation: boolean;
}

export const useUserLocation = (): UserLocation => {
  const { user } = useAuth();

  const location = useMemo(() => {
    const defaultAddress = user?.user.addresses.find(
      (address: any) => address.isDefault,
    );

    return {
      lng: defaultAddress?.lng,
      lat: defaultAddress?.lat,
      hasLocation: !!(defaultAddress?.lng && defaultAddress?.lat),
    };
  }, [user]);

  return location;
};
