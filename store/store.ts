import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import aiChatReducer from "./slices/aiChatSlice";
import cartReducer from "./slices/cartSlice";
import checkoutReducer from "./slices/checkoutSlice";
import conversationsReducer from "./slices/conversationsSlice";
import driverTrackingReducer from "./slices/driverTrackingSlice";
import onboardingReducer from "./slices/onboardingSlice";
import orderTrackingReducer from "./slices/orderTrackingSlice";

export const store = configureStore({
  reducer: {
    onboarding: onboardingReducer,
    cart: cartReducer,
    checkout: checkoutReducer,
    orderTracking: orderTrackingReducer,
    driverTracking: driverTrackingReducer,
    conversations: conversationsReducer,
    aiChat: aiChatReducer,
    // Add other reducers here as needed
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// Use throughout your app instead of plain useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
