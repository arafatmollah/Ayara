import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { WAQF_SIGNS } from '../constants/quranAccuracy';
import { WaqfSignInfo } from '../types/quran';

interface WaqfSignsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const WaqfSignsModal: React.FC<WaqfSignsModalProps> = ({ visible, onClose }) => {
  const [selectedSign, setSelectedSign] = useState<WaqfSignInfo | null>(WAQF_SIGNS[0]);

  const getPriorityBadge = (priority: WaqfSignInfo['priority']) => {
    switch (priority) {
      case 'compulsory':
        return { label: 'Must Stop', bg: '#FEE2E2', text: '#B91C1C' };
      case 'forbidden':
        return { label: 'Do Not Stop', bg: '#FEF2F2', text: '#DC2626' };
      case 'preferred_stop':
        return { label: 'Better to Stop', bg: '#FEF3C7', text: '#B45309' };
      case 'preferred_continue':
        return { label: 'Better to Continue', bg: '#E0F2FE', text: '#0369A1' };
      case 'permissible':
        return { label: 'Equal Choice', bg: '#ECFDF5', text: '#047857' };
      case 'paired':
        return { label: 'Stop at One Only', bg: '#EDE9FE', text: '#6D28D9' };
      case 'pause':
        return { label: 'Pause Without Breath', bg: '#F3E8FF', text: '#7E22CE' };
      default:
        return { label: 'Guide', bg: COLORS.surfaceSubtle, text: COLORS.textSecondary };
    }
  };

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
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIconBox}>
                <Ionicons name="bookmarks-outline" size={17} color={COLORS.primaryDark} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Quranic Stopping Signs</Text>
                <Text style={styles.headerSub}>عَلَامَاتُ الْوَقْفِ فِي الْمُصْحَفِ الشَّرِيفِ</Text>
              </View>
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
            {/* Quick Horizontal Selector */}
            <Text style={styles.sectionLabel}>TAP A STOPPING SIGN TO LEARN ITS RULE</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalSelector}
            >
              {WAQF_SIGNS.map((item) => {
                const isSelected = selectedSign?.id === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.signPill, isSelected && styles.signPillActive]}
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch {}
                      setSelectedSign(item);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.signPillSymbol, isSelected && styles.signPillSymbolActive]}>
                      {item.sign}
                    </Text>
                    <Text style={[styles.signPillName, isSelected && styles.signPillNameActive]}>
                      {item.nameEn.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Selected Sign Highlight Card */}
            {selectedSign && (
              <View style={styles.highlightCard}>
                <View style={styles.cardTopRow}>
                  <View style={styles.cardSymbolWrap}>
                    <Text style={styles.cardBigSymbol}>{selectedSign.sign}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <View style={styles.badgeRow}>
                      {(() => {
                        const badge = getPriorityBadge(selectedSign.priority);
                        return (
                          <View style={[styles.priorityBadge, { backgroundColor: badge.bg }]}>
                            <Text style={[styles.priorityBadgeText, { color: badge.text }]}>
                              {badge.label}
                            </Text>
                          </View>
                        );
                      })()}
                    </View>
                    <Text style={styles.cardNameAr}>{selectedSign.nameAr}</Text>
                    <Text style={styles.cardNameEn}>{selectedSign.nameEn}</Text>
                  </View>
                </View>

                <View style={styles.ruleBox}>
                  <Text style={styles.ruleTitle}>{selectedSign.ruleTitle}</Text>
                  <Text style={styles.ruleDesc}>{selectedSign.ruleDescription}</Text>
                </View>

                {selectedSign.exampleAyah && (
                  <View style={styles.exampleBox}>
                    <Text style={styles.exampleLabel}>QURANIC EXAMPLE</Text>
                    <Text style={styles.exampleArabic}>{selectedSign.exampleAyah}</Text>
                    {selectedSign.exampleRef && (
                      <Text style={styles.exampleRef}>{selectedSign.exampleRef}</Text>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Typography & Divisions Reference */}
            <View style={styles.typographySection}>
              <Text style={styles.sectionLabel}>ADDITIONAL QURANIC TYPOGRAPHY</Text>

              {/* Rub' al-Hizb */}
              <View style={styles.typeItem}>
                <View style={styles.typeSymbolBox}>
                  <Text style={styles.typeSymbol}>۞</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.typeTitle}>Rub&rsquo; al-Hizb (رُبْعُ الحِزْبِ)</Text>
                  <Text style={styles.typeDesc}>
                    An ornamental eight-pointed star indicating the start of a quarter-division (rub&rsquo;) within a Juz (total 240 rub&rsquo; across the whole Quran).
                  </Text>
                </View>
              </View>

              {/* Sajdah Marker */}
              <View style={styles.typeItem}>
                <View style={styles.typeSymbolBox}>
                  <Text style={styles.typeSymbol}>۩</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.typeTitle}>Sajdah Tilawah (سَجْدَةُ التِّلَاوَةِ)</Text>
                  <Text style={styles.typeDesc}>
                    Marks one of the 15 verses in the Quran where prostration (Sujud) is a Sunnah Mu&rsquo;akkadah upon reciting or hearing the verse.
                  </Text>
                </View>
              </View>

              {/* Ayah End Marker */}
              <View style={styles.typeItem}>
                <View style={styles.typeSymbolBox}>
                  <Text style={styles.typeSymbol}>۝</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.typeTitle}>End of Ayah (فَاصِلَةُ الآيَةِ)</Text>
                  <Text style={styles.typeDesc}>
                    A circular ornamental rosette marking the completion of an Ayah according to canonical Kufic numbering.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Close */}
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.doneBtnText}>Close Guide</Text>
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
    maxHeight: '88%',
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: FONTS.arabicMedium,
    color: COLORS.primaryDark,
    marginTop: 1,
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
  sectionLabel: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  horizontalSelector: {
    gap: 8,
    paddingBottom: 14,
  },
  signPill: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 64,
  },
  signPillActive: {
    backgroundColor: COLORS.primarySurface,
    borderColor: COLORS.primary,
  },
  signPillSymbol: {
    fontFamily: FONTS.arabicBold,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  signPillSymbolActive: {
    color: COLORS.primaryDark,
  },
  signPillName: {
    fontSize: 10,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textSecondary,
  },
  signPillNameActive: {
    color: COLORS.primaryDark,
    fontFamily: FONTS.sansBold,
  },
  highlightCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 20,
    ...SHADOWS.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardSymbolWrap: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  cardBigSymbol: {
    fontFamily: FONTS.arabicBold,
    fontSize: 30,
    color: COLORS.primaryDark,
  },
  badgeRow: {
    marginBottom: 4,
  },
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
  },
  cardNameAr: {
    fontFamily: FONTS.arabicBold,
    fontSize: 16,
    color: COLORS.textArabic,
  },
  cardNameEn: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textSecondary,
  },
  ruleBox: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  ruleTitle: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  ruleDesc: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  exampleBox: {
    backgroundColor: '#FAF9F5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  exampleLabel: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  exampleArabic: {
    fontFamily: FONTS.arabicSemiBold,
    fontSize: 18,
    color: COLORS.textArabic,
    lineHeight: 32,
    textAlign: 'right',
    marginBottom: 4,
  },
  exampleRef: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.primaryDark,
    textAlign: 'right',
  },
  typographySection: {
    marginBottom: 10,
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  typeSymbolBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeSymbol: {
    fontFamily: FONTS.arabicBold,
    fontSize: 22,
    color: COLORS.primaryDark,
  },
  typeTitle: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  typeDesc: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  doneBtn: {
    backgroundColor: COLORS.primarySurface,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  doneBtnText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
});
