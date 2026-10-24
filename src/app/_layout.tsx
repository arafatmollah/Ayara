import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts as useArabicFonts,
  NotoNaskhArabic_400Regular,
  NotoNaskhArabic_500Medium,
  NotoNaskhArabic_600SemiBold,
  NotoNaskhArabic_700Bold,
} from '@expo-google-fonts/noto-naskh-arabic';
import {
  useFonts as useSansFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { AudioProvider } from '../services/audioContext';
import { AudioPlayerBar } from '../components/AudioPlayerBar';
import { AyaraLaunchScreen } from '../components/AyaraLaunchScreen';
import { COLORS } from '../constants/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [arabicLoaded] = useArabicFonts({
    NotoNaskhArabic_400Regular,
    NotoNaskhArabic_500Medium,
    NotoNaskhArabic_600SemiBold,
    NotoNaskhArabic_700Bold,
  });

  const [sansLoaded] = useSansFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  // Track launch animation completion once per app lifecycle
  const [isLaunchDone, setIsLaunchDone] = useState(false);
  const [isNativeSplashHidden, setIsNativeSplashHidden] = useState(false);

  const fontsLoaded = Boolean(arabicLoaded && sansLoaded);

  useEffect(() => {
    if (fontsLoaded && !isNativeSplashHidden) {
      // Hide native splash screen as soon as custom animated launch screen mounts
      SplashScreen.hideAsync().catch(() => {});
      setIsNativeSplashHidden(true);
    }
  }, [fontsLoaded, isNativeSplashHidden]);

  const handleLaunchComplete = useCallback(() => {
    setIsLaunchDone(true);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider style={styles.rootContainer}>
      <AudioProvider>
        <StatusBar style={isLaunchDone ? 'dark' : 'light'} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: COLORS.surface },
            headerTintColor: COLORS.primaryDark,
            headerTitleStyle: { fontFamily: 'PlusJakartaSans_700Bold' },
            contentStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="surah/[id]"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
        </Stack>
        <AudioPlayerBar />

        {/* Animated Launch Screen - runs only at startup, never on navigation */}
        {!isLaunchDone && (
          <AyaraLaunchScreen onAnimationComplete={handleLaunchComplete} />
        )}
      </AudioProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#0D0714', // Exact match with native splash background to prevent white flash
  },
});
