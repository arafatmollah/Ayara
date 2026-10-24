import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AyaraEmblem } from './AyaraEmblem';

interface AyaraLaunchScreenProps {
  onAnimationComplete: () => void;
}

const { width, height } = Dimensions.get('window');

export const AyaraLaunchScreen: React.FC<AyaraLaunchScreenProps> = ({
  onAnimationComplete,
}) => {
  // Animation drivers
  const backdropGlow = useRef(new Animated.Value(0)).current;
  const emblemScale = useRef(new Animated.Value(0.85)).current;
  const emblemOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkTranslateY = useRef(new Animated.Value(18)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const shimmerTranslateX = useRef(new Animated.Value(-width * 0.8)).current;
  const shimmerOpacity = useRef(new Animated.Value(0)).current;
  const screenFadeOut = useRef(new Animated.Value(1)).current;
  const screenScale = useRef(new Animated.Value(1)).current;

  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    // Check accessibility reduced-motion preference
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotion) => {
        if (isCancelled) return;

        if (reduceMotion) {
          // Simplified, tranquil fade for reduced motion users
          Animated.sequence([
            Animated.parallel([
              Animated.timing(emblemOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(wordmarkOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(subtitleOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
            ]),
            Animated.delay(800),
            Animated.timing(screenFadeOut, {
              toValue: 0,
              duration: 350,
              useNativeDriver: true,
            }),
          ]).start(() => {
            if (!isCancelled) {
              setHasCompleted(true);
              onAnimationComplete();
            }
          });
          return;
        }

        // Full cinematic animation sequence (total ~2.4 seconds)
        Animated.sequence([
          // Phase 1: Atmospheric ambient glow breathes in
          Animated.parallel([
            Animated.timing(backdropGlow, {
              toValue: 1,
              duration: 800,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            // Emblem light emergence
            Animated.timing(emblemOpacity, {
              toValue: 1,
              duration: 900,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(emblemScale, {
              toValue: 1,
              duration: 1100,
              easing: Easing.out(Easing.back(1.2)),
              useNativeDriver: true,
            }),
          ]),

          // Phase 2: Wordmark & subtitle rise and fade in
          Animated.parallel([
            Animated.timing(wordmarkOpacity, {
              toValue: 1,
              duration: 600,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(wordmarkTranslateY, {
              toValue: 0,
              duration: 600,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(subtitleOpacity, {
              toValue: 1,
              duration: 700,
              delay: 150,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),

          // Phase 3: Restrained lavender shimmer sweep across the emblem
          Animated.parallel([
            Animated.sequence([
              Animated.timing(shimmerOpacity, {
                toValue: 0.85,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.timing(shimmerOpacity, {
                toValue: 0,
                duration: 400,
                delay: 200,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(shimmerTranslateX, {
              toValue: width * 0.8,
              duration: 750,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1.0),
              useNativeDriver: true,
            }),
          ]),

          // Brief contemplation hold
          Animated.delay(350),

          // Phase 4: Seamless cinematic transition to Home screen
          Animated.parallel([
            Animated.timing(screenFadeOut, {
              toValue: 0,
              duration: 450,
              easing: Easing.inOut(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(screenScale, {
              toValue: 1.04,
              duration: 450,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          if (!isCancelled) {
            setHasCompleted(true);
            onAnimationComplete();
          }
        });
      })
      .catch(() => {
        // Fallback
        onAnimationComplete();
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleSkip = () => {
    if (hasCompleted) return;
    Animated.timing(screenFadeOut, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setHasCompleted(true);
      onAnimationComplete();
    });
  };

  if (hasCompleted) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: screenFadeOut,
          transform: [{ scale: screenScale }],
        },
      ]}
      pointerEvents={hasCompleted ? 'none' : 'auto'}
    >
      <TouchableOpacity
        style={styles.touchableArea}
        activeOpacity={1}
        onPress={handleSkip}
      >
        {/* Atmospheric Radial Glow behind Emblem */}
        <Animated.View
          style={[
            styles.ambientGlow,
            {
              opacity: backdropGlow,
              transform: [
                {
                  scale: backdropGlow.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.75, 1.15],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Center Container */}
        <View style={styles.centerBox}>
          {/* Emblem with Light Emergence */}
          <Animated.View
            style={[
              styles.emblemWrapper,
              {
                opacity: emblemOpacity,
                transform: [{ scale: emblemScale }],
              },
            ]}
          >
            <AyaraEmblem size={200} />

            {/* Lavender Shimmer Light Sweep */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.shimmerBar,
                {
                  opacity: shimmerOpacity,
                  transform: [
                    { translateX: shimmerTranslateX },
                    { rotate: '25deg' },
                  ],
                },
              ]}
            />
          </Animated.View>

          {/* Wordmark: AYARA */}
          <Animated.View
            style={[
              styles.wordmarkWrapper,
              {
                opacity: wordmarkOpacity,
                transform: [{ translateY: wordmarkTranslateY }],
              },
            ]}
          >
            <Text style={styles.wordmarkText}>AYARA</Text>
            <Text style={styles.arabicSubText}>آيَــارَى</Text>
          </Animated.View>

          {/* Subtitle Tagline */}
          <Animated.View
            style={[
              styles.subtitleWrapper,
              {
                opacity: subtitleOpacity,
              },
            ]}
          >
            <View style={styles.dividerDotRow}>
              <View style={styles.dividerLine} />
              <View style={styles.diamondDot} />
              <View style={styles.dividerLine} />
            </View>
            <Text style={styles.subtitleText}>THE NOBLE QURAN COMPANION</Text>
          </Animated.View>
        </View>

        {/* Bottom subtle brand accent */}
        <Animated.View
          style={[
            styles.bottomFooter,
            {
              opacity: subtitleOpacity,
            },
          ]}
        >
          <Text style={styles.footerArabic}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0D0714', // Exact match with native splash background
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchableArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ambientGlow: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: '#3B1669',
    opacity: 0.35,
    // Radial diffusion effect
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 60,
    elevation: 20,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emblemWrapper: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shimmerBar: {
    position: 'absolute',
    width: 60,
    height: 340,
    backgroundColor: 'rgba(237, 233, 254, 0.4)',
    shadowColor: '#C4B5FD',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
  },
  wordmarkWrapper: {
    alignItems: 'center',
    marginTop: 20,
  },
  wordmarkText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 32,
    color: '#FDFBFF',
    letterSpacing: 9,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  arabicSubText: {
    fontFamily: 'NotoNaskhArabic_600SemiBold',
    fontSize: 18,
    color: '#DDD6FE',
    letterSpacing: 4,
    marginTop: 2,
    opacity: 0.85,
  },
  subtitleWrapper: {
    alignItems: 'center',
    marginTop: 14,
  },
  dividerDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    opacity: 0.4,
  },
  dividerLine: {
    width: 32,
    height: 1,
    backgroundColor: '#C4B5FD',
  },
  diamondDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EDE9FE',
  },
  subtitleText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 11,
    color: '#C4B5FD',
    letterSpacing: 3,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  bottomFooter: {
    position: 'absolute',
    bottom: 44,
    alignItems: 'center',
  },
  footerArabic: {
    fontFamily: 'NotoNaskhArabic_400Regular',
    fontSize: 14,
    color: '#8B5CF6',
    opacity: 0.6,
  },
});
