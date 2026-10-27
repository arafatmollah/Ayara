import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import { enableDailyLearnReminder, getReminderSettings } from '../services/notifications';
import { autoCheckForUpdates } from '../services/appUpdate';

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
  const isNativeSplashHiddenRef = useRef(false);

  const fontsLoaded = Boolean(arabicLoaded && sansLoaded);

  useEffect(() => {
    if (fontsLoaded && !isNativeSplashHiddenRef.current) {
      isNativeSplashHiddenRef.current = true;
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  useEffect(() => {
    (async () => {
      try {
        const settings = await getReminderSettings();
        if (settings.enabled) {
          await enableDailyLearnReminder(settings.hour, settings.minute);
        }
      } catch {}
      try {
        // Check for updates from GitHub releases (non-blocking)
        setTimeout(() => {
          autoCheckForUpdates().catch(() => {});
        }, 2000);
      } catch {}
    })();
  }, []);

  const handleLaunchComplete = useCallback(() => {
    setIsLaunchDone(true);
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider style={styles.rootContainer}>
      <AudioProvider>
        <StatusBar style="dark" />
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
          <Stack.Screen
            name="trainer"
            options={{
              headerShown: false,
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="memorize"
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="learn"
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
    backgroundColor: '#FFFFFF', // Clean white background for splash and launch
  },
});
