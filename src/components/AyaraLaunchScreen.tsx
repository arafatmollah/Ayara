import React, { useEffect, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { AyaraEmblem } from './AyaraEmblem';

interface AyaraLaunchScreenProps {
  onAnimationComplete: () => void;
}

const { width } = Dimensions.get('window');

export const AyaraLaunchScreen: React.FC<AyaraLaunchScreenProps> = ({
  onAnimationComplete,
}) => {
  // Animation drivers using useState to guarantee stable instances without render-time ref access
  const [backdropGlow] = useState(() => new Animated.Value(0));
  const [emblemScale] = useState(() => new Animated.Value(0.75));
  const [emblemOpacity] = useState(() => new Animated.Value(0));
  const [wordmarkTranslateY] = useState(() => new Animated.Value(22));
  const [wordmarkOpacity] = useState(() => new Animated.Value(0));
  const [subtitleOpacity] = useState(() => new Animated.Value(0));
  const [shimmerTranslateX] = useState(() => new Animated.Value(-width * 0.8));
  const [shimmerOpacity] = useState(() => new Animated.Value(0));
  const [screenFadeOut] = useState(() => new Animated.Value(1));
  const [screenScale] = useState(() => new Animated.Value(1));
  const [sparkleBounce] = useState(() => new Animated.Value(0));

  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    // Check accessibility reduced-motion preference
    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotion) => {
        if (isCancelled) return;

        if (reduceMotion) {
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

        // Full cheerful cinematic animation sequence (~2.2 seconds)
        Animated.sequence([
          // Phase 1: Playful radiant glow & cheerful bouncy emblem entry
          Animated.parallel([
            Animated.timing(backdropGlow, {
              toValue: 1,
              duration: 750,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(emblemOpacity, {
              toValue: 1,
              duration: 800,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(emblemScale, {
              toValue: 1,
              duration: 950,
              easing: Easing.out(Easing.back(1.5)), // Joyful spring bounce
              useNativeDriver: true,
            }),
            Animated.timing(sparkleBounce, {
              toValue: 1,
              duration: 1000,
              easing: Easing.out(Easing.elastic(1.2)),
              useNativeDriver: true,
            }),
          ]),

          // Phase 2: Wordmark & Playful Tagline Rise
          Animated.parallel([
            Animated.timing(wordmarkOpacity, {
              toValue: 1,
              duration: 550,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(wordmarkTranslateY, {
              toValue: 0,
              duration: 550,
              easing: Easing.out(Easing.back(1.2)),
              useNativeDriver: true,
            }),
            Animated.timing(subtitleOpacity, {
              toValue: 1,
              duration: 650,
              delay: 100,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),

          // Phase 3: Playful Golden Shimmer sweep across the emblem
          Animated.parallel([
            Animated.sequence([
              Animated.timing(shimmerOpacity, {
                toValue: 0.9,
                duration: 220,
                useNativeDriver: true,
              }),
              Animated.timing(shimmerOpacity, {
                toValue: 0,
                duration: 380,
                delay: 180,
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
          Animated.delay(300),

          // Phase 4: Seamless transition to the Home screen
          Animated.parallel([
            Animated.timing(screenFadeOut, {
              toValue: 0,
              duration: 400,
              easing: Easing.inOut(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(screenScale, {
              toValue: 1.05,
              duration: 400,
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
        onAnimationComplete();
      });

    return () => {
      isCancelled = true;
    };
  }, [
    backdropGlow,
    emblemOpacity,
    emblemScale,
    onAnimationComplete,
    screenFadeOut,
    screenScale,
    shimmerOpacity,
    shimmerTranslateX,
    sparkleBounce,
    subtitleOpacity,
    wordmarkOpacity,
    wordmarkTranslateY,
  ]);

  const handleSkip = () => {
    if (hasCompleted) return;
    Animated.timing(screenFadeOut, {
      toValue: 0,
      duration: 200,
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
        {/* Playful Radiant Multi-Tone Halo Glow behind Emblem */}
        <Animated.View
          style={[
            styles.sunbeamGlow,
            {
              opacity: backdropGlow,
              transform: [
                {
                  scale: backdropGlow.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.65, 1.12],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.lavenderGlow,
            {
              opacity: backdropGlow,
              transform: [
                {
                  scale: backdropGlow.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.25],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Center Box */}
        <View style={styles.centerBox}>
          {/* Emblem with Cheerful Light Emergence */}
          <Animated.View
            style={[
              styles.emblemWrapper,
              {
                opacity: emblemOpacity,
                transform: [{ scale: emblemScale }],
              },
            ]}
          >
            <AyaraEmblem size={210} />

            {/* Playful Floating Sparkle Badges */}
            <Animated.View
              style={[
                styles.floatingSparkleTopRight,
                {
                  opacity: emblemOpacity,
                  transform: [
                    {
                      scale: sparkleBounce.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                    {
                      translateY: sparkleBounce.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, -4],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name="sparkles" size={20} color="#F59E0B" />
            </Animated.View>

            <Animated.View
              style={[
                styles.floatingSparkleBottomLeft,
                {
                  opacity: emblemOpacity,
                  transform: [
                    {
                      scale: sparkleBounce.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      }),
                    },
                    {
                      translateY: sparkleBounce.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-10, 2],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name="sparkles" size={16} color="#8B5CF6" />
            </Animated.View>

            {/* Radiant Shimmer Bar */}
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
            <View style={styles.wordmarkRow}>
              <Text style={styles.wordmarkText}>AYARA</Text>
              <Ionicons
                name="sparkles"
                size={14}
                color="#F59E0B"
                style={styles.wordmarkSparkle}
              />
            </View>
            <Text style={styles.arabicSubText}>آيَـــارَى</Text>
          </Animated.View>

          {/* Playful Tagline Pill */}
          <Animated.View
            style={[
              styles.subtitleWrapper,
              {
                opacity: subtitleOpacity,
              },
            ]}
          >
            <View style={styles.taglinePill}>
              <View style={styles.taglineDot} />
              <Text style={styles.subtitleText}>NOBLE QURAN COMPANION</Text>
              <View style={styles.taglineDot} />
            </View>
          </Animated.View>
        </View>

        {/* Bottom Playful Divine Blessing */}
        <Animated.View
          style={[
            styles.bottomFooter,
            {
              opacity: subtitleOpacity,
            },
          ]}
        >
          <View style={styles.footerRow}>
            <Text style={styles.footerArabic}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFFFFF', // Bright, crisp, clean white background
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
  sunbeamGlow: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: '#FEF3C7',
    opacity: 0.65,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 50,
    elevation: 10,
  },
  lavenderGlow: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: '#EDE9FE',
    opacity: 0.55,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 65,
    elevation: 8,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emblemWrapper: {
    width: 230,
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  floatingSparkleTopRight: {
    position: 'absolute',
    top: 14,
    right: 22,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  floatingSparkleBottomLeft: {
    position: 'absolute',
    bottom: 22,
    left: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },
  shimmerBar: {
    position: 'absolute',
    width: 65,
    height: 350,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
  },
  wordmarkWrapper: {
    alignItems: 'center',
    marginTop: 18,
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmarkText: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 34,
    color: '#2E1065', // Rich, deep royal violet
    letterSpacing: 8,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  wordmarkSparkle: {
    marginLeft: 2,
    marginTop: -14,
  },
  arabicSubText: {
    fontFamily: 'NotoNaskhArabic_600SemiBold',
    fontSize: 20,
    color: '#7C3AED', // Bright vibrant violet
    letterSpacing: 4,
    marginTop: 3,
    textAlign: 'center',
  },
  subtitleWrapper: {
    alignItems: 'center',
    marginTop: 12,
  },
  taglinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  taglineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
    marginHorizontal: 7,
  },
  subtitleText: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 10,
    color: '#6D28D9',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
  },
  bottomFooter: {
    position: 'absolute',
    bottom: 42,
    alignItems: 'center',
  },
  footerRow: {
    backgroundColor: '#FAF5FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3E8FF',
  },
  footerArabic: {
    fontFamily: 'NotoNaskhArabic_500Medium',
    fontSize: 13,
    color: '#7C3AED',
    opacity: 0.85,
  },
});
