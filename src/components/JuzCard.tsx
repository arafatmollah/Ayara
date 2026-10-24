import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { JuzMeta } from '../types/quran';
import { getSurahMeta } from '../services/quranData';

interface JuzCardProps {
  juz: JuzMeta;
}

export const JuzCard: React.FC<JuzCardProps> = ({ juz }) => {
  const startSurah = getSurahMeta(juz.start.s);
  const endSurah = getSurahMeta(juz.end.s);

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics optional on web
    }
    router.push({
      pathname: '/surah/[id]',
      params: {
        id: juz.start.s.toString(),
        targetAyah: juz.start.a.toString(),
      },
    });
  };

  const rangeText = `${startSurah?.en || `Surah ${juz.start.s}`}:${juz.start.a} — ${endSurah?.en || `Surah ${juz.end.s}`}:${juz.end.a}`;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Juz ${juz.n}, ${juz.name}`}
    >
      <View style={styles.leftSection}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{juz.n}</Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.titleEn}>{juz.name}</Text>
          <Text style={styles.rangeText}>{rangeText}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text style={styles.arabicName}>{juz.nameAr}</Text>
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
    backgroundColor: COLORS.goldSurface,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  numberText: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    color: COLORS.goldDark,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  titleEn: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  rangeText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
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
});
