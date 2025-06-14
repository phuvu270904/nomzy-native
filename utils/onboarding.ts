import AsyncStorage from '@react-native-async-storage/async-storage';

export const ONBOARDING_COMPLETE_KEY = '@nomzy:onboardingComplete';

export const setOnboardingComplete = async () => {
  try {
    console.log('Setting onboarding complete...');
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    console.log('Onboarding status set to complete');
    return true;
  } catch (error) {
    console.error('Failed to save onboarding status', error);
    // As a fallback, try using a global variable
    (global as any).onboardingComplete = true;
    return false;
  }
};

export const getOnboardingStatus = async () => {
  try {
    console.log('Checking onboarding status...');
    
    // If we're already in the onboarding screen, don't redirect there again
    // This is the most important check to break any potential infinite loops
    if ((global as any).inOnboardingScreen === true) {
      console.log('Already in onboarding screen, not redirecting');
      return false;
    }
    
    // Check for the global completion flag
    if ((global as any).onboardingComplete === true) {
      console.log('Using global fallback: onboarding is complete');
      return true;
    }
    
    // Check if onboarding status is stored in AsyncStorage
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    console.log('AsyncStorage onboarding status:', value);
    
    // If we've explicitly marked it as complete, return true
    if (value === 'true') {
      return true;
    }
    
    // Otherwise, we definitely need to show onboarding
    return false;
  } catch (error) {
    console.error('Failed to load onboarding status', error);
    // Check for the global fallback
    if ((global as any).onboardingComplete === true) {
      return true;
    }
    // If we're already in the onboarding screen, don't redirect there again
    if ((global as any).inOnboardingScreen === true) {
      return false;
    }
    return false;
  }
};

export const resetOnboardingStatus = async () => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to reset onboarding status', error);
    return false;
  }
};
