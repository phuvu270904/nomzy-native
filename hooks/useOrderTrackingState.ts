import {
    selectCurrentOrder,
    selectDriverInfo,
    selectDriverLocation,
    selectOrderStatus,
    selectOrderTracking,
} from "@/store/slices/orderTrackingSlice";
import { useAppSelector } from "@/store/store";

export const useOrderTrackingState = () => {
  const state = useAppSelector(selectOrderTracking);
  const driverInfo = useAppSelector(selectDriverInfo);
  const driverLocation = useAppSelector(selectDriverLocation);
  const currentOrder = useAppSelector(selectCurrentOrder);
  const orderStatus = useAppSelector(selectOrderStatus);

  return {
    // Full state object
    ...state,
    
    // Convenience properties (same as state but more explicit)
    driverInfo,
    driverLocation,
    currentOrder,
    orderStatus,
  };
};
