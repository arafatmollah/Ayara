import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { SajdahAyahInfo } from '../types/quran';

interface SajdahTilawahModalProps {
  visible: boolean;
  sajdahInfo: SajdahAyahInfo | null;
  onClose: () => void;
}

export const SajdahTilawahModal: React.FC<SajdahTilawahModalProps> = ({
  visible,
  sajdahInfo,
  onClose,
}) => {
  if (!sajdahInfo) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.grabber} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerBadge}>
              <Text style={styles.headerSymbol}>۩</Text>
              <Text style={styles.headerBadgeText}>
                Sajdah Tilawah • {sajdahInfo.surahName} {sajdahInfo.surah}:{sajdahInfo.ayah}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Prostration Verse Callout */}
            <View style={styles.verseBox}>
              <Text style={styles.verseArabicPhrase}>{sajdahInfo.arabicPhrase} ۩</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaPill}>Juz {sajdahInfo.juz}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaPill}>Ruku {sajdahInfo.ruku}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={[styles.metaPill, { color: COLORS.primaryDark, fontFamily: FONTS.sansBold }]}>
                  {sajdahInfo.ruling}
                </Text>
              </View>
            </View>

            {/* Hadith on Sajdah Tilawah */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="sparkles" size={16} color={COLORS.gold} />
                <Text style={styles.cardTitle}>Virtue of Prostration</Text>
              </View>
              <Text style={styles.hadithText}>
                The Messenger of Allah (ﷺ) said: &ldquo;When the son of Adam recites a verse of prostration and prostrates, Satan withdraws weeping, saying: &lsquo;Woe to me! The son of Adam was commanded to prostrate and he prostrated, so Paradise is his; whereas I was commanded to prostrate and refused, so Hellfire is mine.&rsquo;&rdquo;
              </Text>
              <Text style={styles.hadithSource}>Sahih Muslim (81)</Text>
            </View>

            {/* Recommended Prophetic Du'a 1 */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="heart" size={16} color={COLORS.primary} />
                <Text style={styles.cardTitle}>Sunnah Du&rsquo;a of Recitation</Text>
              </View>
              <Text style={styles.duaArabic}>{sajdahInfo.duaAr}</Text>
              <Text style={styles.duaTranslit}>{sajdahInfo.duaTr}</Text>
              <Text style={styles.duaEnglish}>&ldquo;{sajdahInfo.duaEn}&rdquo;</Text>
              <Text style={styles.hadithSource}>{sajdahInfo.hadithRef}</Text>
            </View>

            {/* Quick Fiqh Ruling Note */}
            <View style={styles.fiqhBox}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.primaryDark} />
              <Text style={styles.fiqhText}>
                <Text style={{ fontFamily: FONTS.sansBold }}>How to perform: </Text>
                Make Takbir (Allahu Akbar) without raising hands, prostrate once, recite the Du&rsquo;a above or &lsquo;Subhana Rabbiyal A&rsquo;la&rsquo; 3 times, then rise with Takbir. Tashahhud and Tasleem are not required according to the majority of scholars.
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Button */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.understandBtn}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.understandBtnText}>I Understand • BarakAllah</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: 24,
    ...SHADOWS.md,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSymbol: {
    fontSize: 20,
    color: COLORS.primaryDark,
    fontFamily: FONTS.arabicBold,
  },
  headerBadgeText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  verseBox: {
    backgroundColor: COLORS.primarySurface,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: 14,
  },
  verseArabicPhrase: {
    fontFamily: FONTS.arabicBold,
    fontSize: 24,
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 40,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  metaPill: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textSecondary,
  },
  metaDot: {
    color: COLORS.textMuted,
  },
  card: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  hadithText: {
    fontSize: 13,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textPrimary,
    lineHeight: 19,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  hadithSource: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
    textAlign: 'right',
  },
  duaArabic: {
    fontFamily: FONTS.arabicSemiBold,
    fontSize: 20,
    color: COLORS.textArabic,
    lineHeight: 36,
    textAlign: 'right',
    marginBottom: 8,
  },
  duaTranslit: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 17,
    marginBottom: 6,
  },
  duaEnglish: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginBottom: 8,
  },
  fiqhBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 10,
    marginBottom: 20,
  },
  fiqhText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: '#92400E',
    lineHeight: 17,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  understandBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  understandBtnText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textInverse,
  },
});
