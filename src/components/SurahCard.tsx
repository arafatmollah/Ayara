import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { SurahMeta } from '../types/quran';
import { BANGLA_SURAHS } from '../constants/banglaQuran';

interface SurahCardProps {
  surah: SurahMeta;
  isLastRead?: boolean;
  lastReadAyah?: number;
}

export const SurahCard: React.FC<SurahCardProps> = ({ surah, isLastRead, lastReadAyah }) => {
  const isMeccan = surah.type === 'Meccan';
  const bangla = BANGLA_SURAHS[surah.n];

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics optional on web
    }
    router.push({
      pathname: '/surah/[id]',
      params: {
        id: surah.n.toString(),
        ...(isLastRead && lastReadAyah ? { targetAyah: lastReadAyah.toString() } : {}),
      },
    });
  };

  return (
    <TouchableOpacity
      style={[styles.card, isLastRead && styles.cardActive]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Surah ${surah.en}, ${surah.meaning}, ${surah.ayahs} verses`}
    >
      <View style={styles.leftSection}>
        {/* Number badge */}
        <View style={[styles.numberBadge, isLastRead && styles.numberBadgeActive]}>
          <Text style={[styles.numberText, isLastRead && styles.numberTextActive]}>{surah.n}</Text>
        </View>

        {/* Info text */}
        <View style={styles.infoCol}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            <Text style={styles.titleEn}>{surah.en}</Text>
            {bangla && <Text style={styles.titleBangla}>• {bangla.name}</Text>}
            {isLastRead && (
              <View style={styles.readingNowBadge}>
                <Text style={styles.readingNowBadgeText}>
                  {lastReadAyah ? `v.${lastReadAyah}` : 'Reading'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.meaningText}>
            {bangla ? `${bangla.meaning} • ${surah.meaning}` : surah.meaning}
          </Text>
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.typeBadge,
                isMeccan ? styles.meccanBadge : styles.medinanBadge,
              ]}
            >
              <Text
                style={[
                  styles.typeBadgeText,
                  isMeccan ? styles.meccanText : styles.medinanText,
                ]}
              >
                {surah.type}
              </Text>
            </View>
            <Text style={styles.ayahCount}>{surah.ayahs} verses</Text>
          </View>
        </View>
      </View>

      {/* Arabic Calligraphy */}
      <View style={styles.rightSection}>
        <Text style={styles.arabicName}>{surah.ar}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  numberBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primarySurface,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  numberText: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    color: COLORS.primaryDark,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  titleEn: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  titleBangla: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13.5,
    color: COLORS.primaryDark,
    marginLeft: 6,
    marginBottom: 2,
  },
  meaningText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  meccanBadge: {
    backgroundColor: COLORS.meccanBg,
    borderColor: COLORS.meccanBorder,
  },
  medinanBadge: {
    backgroundColor: COLORS.medinanBg,
    borderColor: COLORS.medinanBorder,
  },
  typeBadgeText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
  },
  meccanText: {
    color: COLORS.meccanText,
  },
  medinanText: {
    color: COLORS.medinanText,
  },
  ayahCount: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  arabicName: {
    fontFamily: FONTS.arabicBold,
    fontSize: 22,
    color: COLORS.primaryDark,
    textAlign: 'right',
  },
  cardActive: {
    borderColor: COLORS.primaryLight,
    backgroundColor: '#FBF9FF',
  },
  numberBadgeActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  numberTextActive: {
    color: COLORS.textInverse,
  },
  readingNowBadge: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  readingNowBadgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    color: COLORS.primaryDark,
  },
});
