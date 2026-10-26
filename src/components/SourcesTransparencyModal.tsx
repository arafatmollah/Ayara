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
import { SOURCE_PROVENANCE } from '../constants/quranAccuracy';

interface SourcesTransparencyModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenErrorReport?: () => void;
}

export const SourcesTransparencyModal: React.FC<SourcesTransparencyModalProps> = ({
  visible,
  onClose,
  onOpenErrorReport,
}) => {
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
                <Ionicons name="shield-checkmark" size={18} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Sources & Authenticity</Text>
                <Text style={styles.headerSub}>مَصَادِرُ التَّوْثِيقِ وَالدِّقَّةِ القُرْآنِيَّةِ</Text>
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
            {/* Sacred Trust Banner */}
            <View style={styles.pledgeCard}>
              <View style={styles.pledgeHeader}>
                <Ionicons name="ribbon" size={18} color={COLORS.gold} />
                <Text style={styles.pledgeTitle}>Our Sacred Accuracy Pledge</Text>
              </View>
              <Text style={styles.pledgeText}>
                The Noble Quran is the direct, unalterable Word of Allah. One misplaced diacritic or misleading attribution can undermine trust in sacred worship. Ayara bundles verified, scholarly peer-reviewed Quranic data with complete provenance across every layer.
              </Text>
            </View>

            {/* Verification Layers List */}
            <Text style={styles.sectionHeading}>DATA LAYERS & SCHOLARLY PROVENANCE</Text>

            {SOURCE_PROVENANCE.map((item, idx) => (
              <View key={idx} style={styles.layerCard}>
                <View style={styles.layerHeaderRow}>
                  <View style={styles.layerBadge}>
                    <Text style={styles.layerBadgeText}>{item.layer.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.layerStandardText}>{item.editionOrStandard}</Text>
                </View>

                <Text style={styles.layerTitle}>{item.title}</Text>
                <Text style={styles.layerAuthority}>Authority: {item.scholarOrOrganization}</Text>
                <Text style={styles.layerDesc}>{item.description}</Text>

                <View style={styles.verificationBox}>
                  <Ionicons name="checkmark-done-circle" size={14} color="#059669" />
                  <Text style={styles.verificationText}>
                    <Text style={{ fontFamily: FONTS.sansBold }}>Audit: </Text>
                    {item.verificationMethod}
                  </Text>
                </View>
              </View>
            ))}

            {/* Content Integrity & Verification Methodology */}
            <View style={styles.integrityCard}>
              <Text style={styles.integrityTitle}>Integrity Guarantee & Offline Safety</Text>
              <Text style={styles.integrityBody}>
                • <Text style={{ fontFamily: FONTS.sansBold }}>No Cloud Tampering:</Text> All 6,236 Ayahs and 77,430 words are stored locally inside the application bundle. Text cannot be altered by remote network interception.{'\n'}
                • <Text style={{ fontFamily: FONTS.sansBold }}>Zero Generative AI for Quranic Verses:</Text> No Quranic Ayah, translation, or word-by-word meaning is ever generated or rewritten by an artificial intelligence model.{'\n'}
                • <Text style={{ fontFamily: FONTS.sansBold }}>Attributed Sunnah Citations:</Text> Every spiritual claim or blessed virtue is cataloged with its canonical Hadith collection and scholarly grade.
              </Text>
            </View>

            {/* Report an Error Callout */}
            <View style={styles.reportNoticeCard}>
              <Ionicons name="alert-circle-outline" size={20} color={COLORS.primaryDark} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.reportNoticeTitle}>Found a Suspected Discrepancy?</Text>
                <Text style={styles.reportNoticeDesc}>
                  If you spot an incorrect tashkeel mark, typo, translation nuance, or audio glitch, please notify us immediately.
                </Text>
                {onOpenErrorReport && (
                  <TouchableOpacity
                    style={styles.openReportBtn}
                    onPress={() => {
                      onClose();
                      onOpenErrorReport();
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="flag" size={13} color={COLORS.textInverse} />
                    <Text style={styles.openReportBtnText}>Submit Content Error Report</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Bottom Bar */}
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.closeModalBtnText}>Close Transparency Center</Text>
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
    maxHeight: '90%',
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
  pledgeCard: {
    backgroundColor: '#FDFBF7',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  pledgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  pledgeTitle: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: '#92400E',
  },
  pledgeText: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: '#78350F',
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  layerCard: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
  },
  layerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  layerBadge: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  layerBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  layerStandardText: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textSecondary,
  },
  layerTitle: {
    fontSize: 15,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  layerAuthority: {
    fontSize: 12,
    fontFamily: FONTS.sansMedium,
    color: COLORS.primaryDark,
    marginBottom: 8,
  },
  layerDesc: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  verificationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  verificationText: {
    flex: 1,
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textPrimary,
    lineHeight: 16,
  },
  integrityCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  integrityTitle: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  integrityBody: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  reportNoticeCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primarySurface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  reportNoticeTitle: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  reportNoticeDesc: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: 10,
  },
  openReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  openReportBtnText: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    color: COLORS.textInverse,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  closeModalBtn: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  closeModalBtnText: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
});
