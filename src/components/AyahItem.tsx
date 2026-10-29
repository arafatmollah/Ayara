import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { AyahData, TranslationLanguage, WordData } from '../types/quran';
import { isSajdahAyah, toArabicNumerals } from '../constants/quranAccuracy';

interface AyahItemProps {
  ayah: AyahData;
  fontSize: number;
  showTranslation: boolean;
  translationLanguage?: TranslationLanguage;
  showTransliteration: boolean;
  showWbw: boolean;
  isBookmarked: boolean;
  isPlaying: boolean;
  focusMode?: boolean;
  selectedWordIndex?: number | null;
  onPlay: () => void;
  onToggleBookmark: () => void;
  onWordSelect?: (word: WordData, wordIndex: number, ayah: AyahData) => void;
  onSajdahPress?: (surah: number, ayah: number) => void;
  onReportPress?: (ayah: AyahData) => void;
}

export const AyahItem: React.FC<AyahItemProps> = ({
  ayah,
  fontSize,
  showTranslation,
  translationLanguage = 'english',
  showTransliteration,
  showWbw,
  isBookmarked,
  isPlaying,
  focusMode = false,
  selectedWordIndex = null,
  onPlay,
  onToggleBookmark,
  onWordSelect,
  onSajdahPress,
  onReportPress,
}) => {
  const isSajdah = isSajdahAyah(ayah.surah, ayah.ayah);

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

  const handleWordPress = (word: WordData, index: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onWordSelect?.(word, index, ayah);
  };

  const handleSajdahPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    onSajdahPress?.(ayah.surah, ayah.ayah);
  };

  const handleReportPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onReportPress?.(ayah);
  };

  return (
    <View
      style={[
        styles.container,
        isPlaying && styles.playingContainer,
        focusMode && styles.containerFocus,
        isSajdah && styles.sajdahContainer,
      ]}
    >
      {/* Top Action Bar (discreet in focus mode) */}
      <View style={styles.topBar}>
        <View style={styles.badgeGroup}>
          <View style={styles.ayahBadge}>
            <Text style={styles.ayahBadgeText}>
              {ayah.surah}:{ayah.ayah}
            </Text>
          </View>

          {isSajdah && (
            <TouchableOpacity
              style={styles.sajdahBadge}
              onPress={handleSajdahPress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Sajdah Tilawah verse. Tap to view prostration ruling and du'a."
            >
              <Text style={styles.sajdahBadgeIcon}>۩</Text>
              <Text style={styles.sajdahBadgeText}>Sajdah</Text>
            </TouchableOpacity>
          )}
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

          {/* Report Inaccuracy Button */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleReportPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Report suspected accuracy issue with this verse"
          >
            <Ionicons name="flag-outline" size={15} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Spacious Arabic Text with Interactive Words & Uthmani Ayah Ending */}
      <View style={styles.arabicContainer}>
        {ayah.words && ayah.words.length > 0 ? (
          <Text
            style={[
              styles.arabicText,
              { fontSize, lineHeight: Math.round(fontSize * 2.15) },
            ]}
          >
            {ayah.words.map((w, idx) => {
              const isSelected = selectedWordIndex === idx;
              return (
                <Text
                  key={idx}
                  onPress={() => handleWordPress(w, idx)}
                  style={[
                    styles.arabicWordInteractive,
                    isSelected && styles.arabicWordSelected,
                  ]}
                  suppressHighlighting={false}
                >
                  {w.arabic}
                  {idx < ayah.words!.length - 1 ? ' ' : ''}
                </Text>
              );
            })}
            <Text style={styles.ayahEndOrnament}>
              {' ' + '۝' + toArabicNumerals(ayah.ayah) + ' '}
            </Text>
          </Text>
        ) : (
          <Text
            style={[
              styles.arabicText,
              { fontSize, lineHeight: Math.round(fontSize * 2.15) },
            ]}
            selectable
          >
            {ayah.arabic}
            <Text style={styles.ayahEndOrnament}>
              {' ' + '۝' + toArabicNumerals(ayah.ayah) + ' '}
            </Text>
          </Text>
        )}
      </View>

      {/* Word-by-word Breakdown (if enabled) */}
      {showWbw && ayah.words && ayah.words.length > 0 && (
        <View style={styles.wbwContainer}>
          {ayah.words.map((w, idx) => {
            const isSelected = selectedWordIndex === idx;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.wbwCard, isSelected && styles.wbwCardSelected]}
                onPress={() => handleWordPress(w, idx)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Learn word ${w.arabic}, ${w.english}`}
              >
                <Text style={[styles.wbwArabic, isSelected && styles.wbwArabicSelected]}>
                  {w.arabic}
                </Text>
                <Text style={styles.wbwTranslit}>{w.transliteration}</Text>
                <Text style={styles.wbwEnglish}>{w.english}</Text>
                {w.rootAr && (
                  <View style={styles.wbwRootChip}>
                    <Text style={styles.wbwRootText}>root {w.rootAr}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Transliteration */}
      {showTransliteration && (
        <View style={styles.translitContainer}>
          <Text style={styles.translitText}>{ayah.transliteration}</Text>
        </View>
      )}

      {/* Translation (English, Bangla, or Both) */}
      {showTranslation && (
        <View style={styles.translationContainer}>
          {(translationLanguage === 'bangla' || translationLanguage === 'both') && !!ayah.bangla && (
            <View style={translationLanguage === 'both' ? styles.banglaBlock : undefined}>
              {translationLanguage === 'both' && (
                <Text style={styles.translationLangBadge}>বাংলা (মুহিউদ্দীন খান)</Text>
              )}
              <Text style={styles.banglaText}>{ayah.bangla}</Text>
            </View>
          )}

          {(translationLanguage === 'english' || translationLanguage === 'both' || !ayah.bangla) && (
            <View style={translationLanguage === 'both' && !!ayah.bangla ? styles.englishBlock : undefined}>
              {translationLanguage === 'both' && !!ayah.bangla && (
                <Text style={styles.translationLangBadge}>English (Saheeh Int.)</Text>
              )}
              <Text style={styles.translationText}>{ayah.english}</Text>
            </View>
          )}
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
  sajdahContainer: {
    borderColor: '#FDE68A',
    backgroundColor: '#FEFDF8',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  sajdahBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  sajdahBadgeIcon: {
    fontFamily: FONTS.arabicBold,
    fontSize: 14,
    color: '#B45309',
  },
  sajdahBadgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    color: '#92400E',
  },
  ayahEndOrnament: {
    fontFamily: FONTS.arabicBold,
    color: COLORS.primary,
    fontSize: 20,
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
  banglaText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 15.5,
    color: COLORS.textPrimary,
    lineHeight: 25,
  },
  banglaBlock: {
    marginBottom: 10,
  },
  englishBlock: {
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight || '#F0EFEA',
  },
  translationLangBadge: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 10.5,
    color: COLORS.primaryDark,
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  arabicWordInteractive: {
    color: COLORS.textArabic,
  },
  arabicWordSelected: {
    color: COLORS.primaryDark,
    backgroundColor: COLORS.primarySurface,
  },
  wbwCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySurface,
    ...SHADOWS.sm,
  },
  wbwArabicSelected: {
    color: COLORS.primaryDark,
  },
  wbwRootChip: {
    backgroundColor: COLORS.goldSurface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },
  wbwRootText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 9,
    color: COLORS.goldDark,
  },
});
