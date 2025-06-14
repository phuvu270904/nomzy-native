import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { OnboardingStep } from '@/components/OnboardingStep';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { setOnboardingComplete } from '@/utils/onboarding';

const { width } = Dimensions.get('window');

const steps = [
  {
    id: '1',
    title: 'Welcome to Nomzy',
    description: 'Your personal food discovery app that helps you find amazing dishes near you.',
    image: require('@/assets/images/react-logo.png'), // Use first onboarding image
  },
  {
    id: '2',
    title: 'Explore Local Cuisine',
    description: 'Discover local restaurants and popular dishes that match your taste preferences.',
    image: require('@/assets/images/partial-react-logo.png'), // Use second onboarding image
  },
  {
    id: '3',
    title: 'Share Your Experience',
    description: 'Share your food experiences with friends and build a community of food lovers.',
    image: require('@/assets/images/favicon.png'), // Use third onboarding image
  },
  {
    id: '4',
    title: "Let's Get Started",
    description: 'Ready to start your food adventure? Create your profile and start exploring!',
    image: require('@/assets/images/splash-icon.png'), // Use fourth onboarding image
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const backgroundColor = useThemeColor({ light: '#F5F5F5', dark: '#1A1A1A' }, 'background');
  const accentColor = useThemeColor({ light: '#A1CEDC', dark: '#1D3D47' }, 'tint');
  
  const completeOnboarding = async () => {
    try {
      const success = await setOnboardingComplete();
      console.log("Completed onboarding, success:", success);
      // Add a global fallback in case AsyncStorage fails
      (global as any).onboardingComplete = true;
      router.navigate('/(tabs)');
    } catch (error) {
      console.error("Error completing onboarding:", error);
      // Even if there's an error, try to navigate to the main app
      (global as any).onboardingComplete = true;
      router.navigate('/(tabs)');
    }
  };

  const renderItem = ({ item }: { item: typeof steps[0] }) => (
    <OnboardingStep
      title={item.title}
      description={item.description}
      image={item.image}
    />
  );

  const handleNext = () => {
    if (currentIndex === steps.length - 1) {
      completeOnboarding();
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    flatListRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
    });
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar style="auto" />
      <FlatList
        ref={flatListRef}
        data={steps}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        style={{ width }}
        contentContainerStyle={{ width: width * steps.length }}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEnabled={true}
      />

      <View style={styles.pagination}>
        {steps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: currentIndex === index ? accentColor : '#D9D9D9',
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonsContainer}>
        {currentIndex < steps.length - 1 ? (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <ThemedText style={styles.skipText}>Skip</ThemedText>
          </TouchableOpacity>
        ) : null}
        
        <TouchableOpacity onPress={handleNext} style={[styles.nextButton, { backgroundColor: accentColor }]}>
          <ThemedText style={styles.nextButtonText}>
            {currentIndex === steps.length - 1 ? 'Get Started' : 'Next'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 50 : 20,
  },
  skipButton: {
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 16,
  },
  nextButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
