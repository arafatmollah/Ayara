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
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { RELEASES_DATA, markWhatsNewSeen } from '../constants/releaseNotes';
import { getCurrentVersion } from '../services/appUpdate';

interface WhatsNewModalProps {
  visible: boolean;
  onClose: () => void;
  initialVersion?: string;
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({
  visible,
  onClose,
  initialVersion,
}) => {
  const currentAppVersion = getCurrentVersion();
  const defaultVersion = initialVersion || currentAppVersion || '1.3.0';

  const [selectedVersion, setSelectedVersion] = useState<string>(() => {
    const exists = RELEASES_DATA.some((r) => r.version === defaultVersion);
    return exists ? defaultVersion : RELEASES_DATA[0].version;
  });

  const activeRelease =
    RELEASES_DATA.find((r) => r.version === selectedVersion) || RELEASES_DATA[0];

  const handleDismiss = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    await markWhatsNewSeen(currentAppVersion);
    onClose();
  };

  const handleOpenGitHub = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (activeRelease.githubUrl) {
      await Linking.openURL(activeRelease.githubUrl);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleDismiss} />

        <View style={styles.sheet}>
          <View style={styles.grabber} />

          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBox}>
                <Ionicons name="sparkles" size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>What’s New in Ayara</Text>
                <Text style={styles.headerSub}>مَا جَدَّ فِي رِحْلَةِ القُرْآنِ</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleDismiss}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close What's New"
            >
              <Ionicons name="close" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Version Selector Tabs */}
          <View style={styles.versionTabsRow}>
            {RELEASES_DATA.map((rel) => {
              const isSelected = selectedVersion === rel.version;
              return (
                <TouchableOpacity
                  key={rel.version}
                  style={[styles.versionTab, isSelected && styles.versionTabActive]}
                  onPress={() => {
                    try {
                      Haptics.selectionAsync();
                    } catch {}
                    setSelectedVersion(rel.version);
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Switch to version ${rel.version}`}
                >
                  <Text
                    style={[
                      styles.versionTabText,
                      isSelected && styles.versionTabTextActive,
                    ]}
                  >
                    v{rel.version}
                  </Text>
                  {rel.isLatest && (
                    <View
                      style={[
                        styles.latestBadge,
                        isSelected && styles.latestBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.latestBadgeText,
                          isSelected && styles.latestBadgeTextActive,
                        ]}
                      >
                        LATEST
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Release Banner */}
            <View style={styles.bannerCard}>
              <View style={styles.bannerHeaderRow}>
                <View style={styles.bannerBadge}>
                  <Text style={styles.bannerBadgeText}>VERSION {activeRelease.version}</Text>
                </View>
                <Text style={styles.bannerDateText}>{activeRelease.date}</Text>
              </View>
              <Text style={styles.bannerTitle}>{activeRelease.title}</Text>
              <Text style={styles.bannerHighlight}>{activeRelease.highlight}</Text>
            </View>

            {/* Feature Cards List */}
            <Text style={styles.featuresHeading}>HIGHLIGHTS & IMPROVEMENTS</Text>

            {activeRelease.features.map((feature, idx) => (
              <View key={idx} style={styles.featureCard}>
                <View
                  style={[
                    styles.featureIconBox,
                    feature.badgeColor
                      ? { backgroundColor: `${feature.badgeColor}18` }
                      : { backgroundColor: COLORS.primarySurface },
                  ]}
                >
                  <Ionicons
                    name={feature.icon as any}
                    size={22}
                    color={feature.badgeColor || COLORS.primary}
                  />
                </View>

                <View style={styles.featureContent}>
                  <View style={styles.featureTitleRow}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    {feature.tag && (
                      <View
                        style={[
                          styles.tagBadge,
                          feature.badgeColor
                            ? { backgroundColor: `${feature.badgeColor}20` }
                            : {},
                        ]}
                      >
                        <Text
                          style={[
                            styles.tagBadgeText,
                            feature.badgeColor ? { color: feature.badgeColor } : {},
                          ]}
                        >
                          {feature.tag}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.featureDesc}>{feature.description}</Text>
                </View>
              </View>
            ))}

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Footer Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleDismiss}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Continue to Ayara"
            >
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Explore Ayara</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleOpenGitHub}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="View full release on GitHub"
            >
              <Ionicons name="logo-github" size={16} color={COLORS.textPrimary} />
              <Text style={styles.secondaryBtnText}>GitHub Release Notes</Text>
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  headerTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontFamily: FONTS.arabicSemiBold,
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionTabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  versionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  versionTabActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  versionTabText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  versionTabTextActive: {
    color: COLORS.textInverse,
  },
  latestBadge: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  latestBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  latestBadgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 9,
    color: COLORS.primaryDark,
    letterSpacing: 0.5,
  },
  latestBadgeTextActive: {
    color: '#FFFFFF',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  bannerCard: {
    backgroundColor: COLORS.primarySurface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: 20,
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bannerBadge: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  bannerBadgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    color: COLORS.textInverse,
    letterSpacing: 0.8,
  },
  bannerDateText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  bannerTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  bannerHighlight: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  featuresHeading: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  featureContent: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  featureTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: COLORS.primarySurface,
  },
  tagBadgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    color: COLORS.primary,
  },
  featureDesc: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 14,
    borderRadius: 16,
    ...SHADOWS.sm,
  },
  primaryBtnText: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryBtnText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
});
