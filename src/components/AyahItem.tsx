import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { AyahData } from '../types/quran';

interface AyahItemProps {
  ayah: AyahData;
  fontSize: number;
  showTranslation: boolean;
  showTransliteration: boolean;
  showWbw: boolean;
  isBookmarked: boolean;
  isPlaying: boolean;
  focusMode?: boolean;
  onPlay: () => void;
  onToggleBookmark: () => void;
}

export const AyahItem: React.FC<AyahItemProps> = ({
  ayah,
  fontSize,
  showTranslation,
  showTransliteration,
  showWbw,
  isBookmarked,
  isPlaying,
  focusMode = false,
  onPlay,
  onToggleBookmark,
}) => {
  const handleBookmarkPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onToggleBookmark();
  };

  const handlePlayPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onPlay();
  };

  return (
    <View
      style={[
        styles.container,
        isPlaying && styles.playingContainer,
        focusMode && styles.containerFocus,
      ]}
    >
      {/* Top Action Bar (discreet in focus mode) */}
      <View style={styles.topBar}>
        <View style={styles.ayahBadge}>
          <Text style={styles.ayahBadgeText}>
            {ayah.surah}:{ayah.ayah}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          {/* Play Button */}
          <TouchableOpacity
            style={[styles.actionBtn, isPlaying && styles.playBtnActive]}
            onPress={handlePlayPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pause Ayah Audio' : 'Play Ayah Audio'}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={17}
              color={isPlaying ? COLORS.audioActiveText : COLORS.primary}
            />
          </TouchableOpacity>

          {/* Bookmark Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleBookmarkPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={17}
              color={isBookmarked ? COLORS.gold : COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Spacious Arabic Text */}
      <View style={styles.arabicContainer}>
        <Text
          style={[
            styles.arabicText,
            { fontSize, lineHeight: Math.round(fontSize * 2.15) },
          ]}
          selectable
        >
          {ayah.arabic}
        </Text>
      </View>

      {/* Word-by-word Breakdown (if enabled) */}
      {showWbw && ayah.words && ayah.words.length > 0 && (
        <View style={styles.wbwContainer}>
          {ayah.words.map((w, idx) => (
            <View key={idx} style={styles.wbwCard}>
              <Text style={styles.wbwArabic}>{w.arabic}</Text>
              <Text style={styles.wbwTranslit}>{w.transliteration}</Text>
              <Text style={styles.wbwEnglish}>{w.english}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Transliteration */}
      {showTransliteration && (
        <View style={styles.translitContainer}>
          <Text style={styles.translitText}>{ayah.transliteration}</Text>
        </View>
      )}

      {/* English Translation */}
      {showTranslation && (
        <View style={styles.translationContainer}>
          <Text style={styles.translationText}>{ayah.english}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  containerFocus: {
    backgroundColor: '#FAF9F5',
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginVertical: 6,
  },
  playingContainer: {
    backgroundColor: COLORS.highlightBg,
    borderColor: COLORS.goldBorder,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ayahBadge: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  ayahBadgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    color: COLORS.primaryDark,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnActive: {
    backgroundColor: COLORS.audioActive,
    borderWidth: 1,
    borderColor: COLORS.audioActiveBorder,
  },
  arabicContainer: {
    marginBottom: 16,
    writingDirection: 'rtl',
  },
  arabicText: {
    fontFamily: FONTS.arabicSemiBold,
    color: COLORS.textArabic,
    textAlign: 'right',
    letterSpacing: 0.3,
  },
  wbwContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  wbwCard: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    minWidth: 58,
  },
  wbwArabic: {
    fontFamily: FONTS.arabicMedium,
    fontSize: 18,
    color: COLORS.primaryDark,
    marginBottom: 3,
  },
  wbwTranslit: {
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  wbwEnglish: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    color: COLORS.textPrimary,
    marginTop: 2,
    textAlign: 'center',
  },
  translitContainer: {
    marginBottom: 10,
    paddingTop: 4,
  },
  translitText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  translationContainer: {
    marginTop: 2,
  },
  translationText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 15,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
});
