import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const handleFacebookLogin = () => {
    console.log('Facebook login pressed');
    // Implement Facebook login logic
  };

  const handleGoogleLogin = () => {
    console.log('Google login pressed');
    // Implement Google login logic
  };

  const handleAppleLogin = () => {
    console.log('Apple login pressed');
    // Implement Apple login logic
  };

  const handleNomzyLogin = () => {
    console.log('Phone login pressed');
    // Navigate to phone number input screen
    router.navigate('/login');
  };

  const handleSignUp = () => {
    console.log('Sign up pressed');
    // Navigate to sign up screen
    router.navigate('/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Main content */}
      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image 
            source={require('../assets/images/onboarding/onboarding-1.png')} 
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <ThemedText style={styles.title}>Let&apos;s you in</ThemedText>

        {/* Social login buttons */}
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity 
            style={styles.socialButton} 
            onPress={handleFacebookLogin}
            activeOpacity={0.7}
          >
            <View style={styles.socialButtonContent}>
              <Ionicons name="logo-google" size={20} color="#EC4436" />
              <ThemedText style={styles.socialButtonText}>Continue with Facebook</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton} 
            onPress={handleGoogleLogin}
            activeOpacity={0.7}
          >
            <View style={styles.socialButtonContent}>
              <Ionicons name="logo-facebook" size={20} color="#219BEE" />
              <ThemedText style={styles.socialButtonText}>Continue with Google</ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.socialButton} 
            onPress={handleAppleLogin}
            activeOpacity={0.7}
          >
            <View style={styles.socialButtonContent}>
              <Ionicons name="logo-apple" size={20} color="#000" />
              <ThemedText style={styles.socialButtonText}>Continue with Apple</ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <ThemedText style={styles.dividerText}>or</ThemedText>
          <View style={styles.dividerLine} />
        </View>

        {/* Phone login button */}
        <TouchableOpacity 
          style={styles.phoneButton} 
          onPress={handleNomzyLogin}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.phoneButtonText}>Sign in with Nomzy account</ThemedText>
        </TouchableOpacity>

        {/* Sign up link */}
        <View style={styles.signUpContainer}>
          <ThemedText style={styles.signUpText}>Don&apos;t have an account? </ThemedText>
          <TouchableOpacity onPress={handleSignUp}>
            <ThemedText style={styles.signUpLink}>Sign up</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
  },
  illustration: {
    width: width * 0.6,
    height: width * 0.6,
    maxWidth: 250,
    maxHeight: 250,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
    color: '#2E2E2E',
    letterSpacing: -0.5,
  },
  socialButtonsContainer: {
    marginBottom: 30,
  },
  socialButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2E2E2E',
    marginLeft: 5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9E9E9E',
  },
  phoneButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  phoneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  signUpLink: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
});