import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { OnboardingStep } from '@/components/OnboardingStep';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { completeOnboarding } from '@/store/slices/onboardingSlice';
import { useAppDispatch } from '../../store/store';

const { width } = Dimensions.get('window');

const steps = [
  {
    id: '1',
    title: 'Order for Food',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
    image: require('../../assets/images/onboarding/onboarding-1.png'),
  },
  {
    id: '2',
    title: 'Easy Payment',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
    image: require('../../assets/images/onboarding/onboarding-2.png'),
  },
  {
    id: '3',
    title: 'Fast Delivery',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
    image: require('../../assets/images/onboarding/onboarding-3.png'),
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const backgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#1A1A1A' }, 'background');
  const primaryGreen = '#4CAF50'; // Main green color from design
  const lightGray = '#E0E0E0'; // For inactive dots
  const dispatch = useAppDispatch();
  
  const handleOnboardingComplete = () => {
    dispatch(completeOnboarding());
    console.log("Completed onboarding");
    router.navigate('/auth');
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
      handleOnboardingComplete();
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    flatListRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
    });
  };


  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <StatusBar style="dark" />
      
      {/* Background decorative circles */}
      <View style={styles.backgroundDecorations}>
        <View style={[styles.decorativeCircle, styles.topLeft]} />
        <View style={[styles.decorativeCircle, styles.topRight]} />
        <View style={[styles.decorativeCircle, styles.bottomLeft]} />
        <View style={[styles.decorativeCircle, styles.bottomRight]} />
      </View>

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

      {/* Bottom section with pagination and buttons */}
      <View style={styles.bottomSection}>
        {/* Pagination dots */}
        <View style={styles.pagination}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: currentIndex === index ? primaryGreen : lightGray,
                  width: currentIndex === index ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Action button */}
        <TouchableOpacity 
          onPress={handleNext} 
          style={[styles.actionButton, { backgroundColor: primaryGreen }]}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.actionButtonText}>
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
  backgroundDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  decorativeCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  topLeft: {
    top: 60,
    left: -30,
  },
  topRight: {
    top: 120,
    right: -40,
  },
  bottomLeft: {
    bottom: 200,
    left: -50,
  },
  bottomRight: {
    bottom: 300,
    right: -30,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    height: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  actionButton: {
    width: width - 48,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});