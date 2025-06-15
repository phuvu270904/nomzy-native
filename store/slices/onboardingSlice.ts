import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk } from '../store';

export const ONBOARDING_COMPLETE_KEY = '@nomzy:onboardingComplete';

interface OnboardingState {
  isComplete: boolean;
  inOnboardingScreen: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: OnboardingState = {
  isComplete: false,
  inOnboardingScreen: false,
  isLoading: false,
  error: null,
};

export const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setOnboardingCompleteState: (state, action: PayloadAction<boolean>) => {
      state.isComplete = action.payload;
    },
    setInOnboardingScreen: (state, action: PayloadAction<boolean>) => {
      state.inOnboardingScreen = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setOnboardingCompleteState,
  setInOnboardingScreen,
  setLoading,
  setError,
} = onboardingSlice.actions;

// Async thunks
export const completeOnboarding = (): AppThunk => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    console.log('Setting onboarding complete...');
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    console.log('Onboarding status set to complete');
    dispatch(setOnboardingCompleteState(true));
    dispatch(setError(null));
  } catch (error) {
    console.error('Failed to save onboarding status', error);
    dispatch(setError('Failed to save onboarding status'));
    // Still mark as complete in Redux state even if AsyncStorage fails
    dispatch(setOnboardingCompleteState(true));
  } finally {
    dispatch(setLoading(false));
  }
};

export const checkOnboardingStatus = (): AppThunk => async (dispatch, getState) => {
  dispatch(setLoading(true));
  try {
    console.log('Checking onboarding status...');
    
    // First check if we're already in the onboarding screen
    const { inOnboardingScreen } = getState().onboarding;
    if (inOnboardingScreen) {
      console.log('Already in onboarding screen, not redirecting');
      dispatch(setLoading(false));
      return false;
    }
    
    // Check if onboarding is already marked complete in state
    const { isComplete } = getState().onboarding;
    if (isComplete) {
      console.log('Redux state: onboarding is complete');
      dispatch(setLoading(false));
      return true;
    }
    
    // Check if onboarding status is stored in AsyncStorage
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    console.log('AsyncStorage onboarding status:', value);
    
    // If we've explicitly marked it as complete, update state and return true
    if (value === 'true') {
      dispatch(setOnboardingCompleteState(true));
      dispatch(setLoading(false));
      return true;
    }
    
    // Otherwise, we definitely need to show onboarding
    dispatch(setLoading(false));
    return false;
  } catch (error) {
    console.error('Failed to load onboarding status', error);
    dispatch(setError('Failed to load onboarding status'));
    dispatch(setLoading(false));
    return false;
  }
};

export const resetOnboardingStatus = (): AppThunk => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    dispatch(setOnboardingCompleteState(false));
    dispatch(setError(null));
    return true;
  } catch (error) {
    console.error('Failed to reset onboarding status', error);
    dispatch(setError('Failed to reset onboarding status'));
    return false;
  } finally {
    dispatch(setLoading(false));
  }
};

export default onboardingSlice.reducer;
