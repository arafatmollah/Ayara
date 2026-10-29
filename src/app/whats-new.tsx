import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';
import { RELEASES_DATA, markWhatsNewSeen } from '../constants/releaseNotes';
import { getCurrentVersion } from '../services/appUpdate';

export default function WhatsNewScreen() {
  const currentAppVersion = getCurrentVersion();
  const [selectedVersion, setSelectedVersion] = useState<string>(
    RELEASES_DATA[0].version
  );

  const activeRelease =
    RELEASES_DATA.find((r) => r.version === selectedVersion) || RELEASES_DATA[0];

  const handleBack = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    await markWhatsNewSeen(currentAppVersion);
    router.back();
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
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>What’s New in Ayara</Text>
          <Text style={styles.headerSub}>مَا جَدَّ فِي رِحْلَةِ القُرْآنِ</Text>
        </View>

        <View style={{ width: 40 }} />
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Release Highlight Card */}
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

        {/* Feature Highlights */}
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

        {/* Action Buttons */}
        <View style={styles.actionsBox}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleBack}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Continue to Ayara"
          >
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Continue to Ayara</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleOpenGitHub}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="View full release on GitHub"
          >
            <Ionicons name="logo-github" size={16} color={COLORS.textPrimary} />
            <Text style={styles.secondaryBtnText}>View GitHub Release Notes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    color: COLORS.textPrimary,
  },
  headerSub: {
    fontFamily: FONTS.arabicSemiBold,
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 1,
  },
  versionTabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
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
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
    ...SHADOWS.sm,
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
  actionsBox: {
    marginTop: 16,
    gap: 12,
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
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryBtnText: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
});
