import React, { useState, useEffect } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SHADOWS } from '../../constants/theme';
import {
  getDailyProgress,
  getLastRead,
  getWeeklyActivity,
  getTimeSegmentStats,
  setDailyGoal,
  getUserProfile,
  setUserProfile,
  getKhatmahProgress,
  getRecentHistory,
  recordVersesRead,
} from '../../services/storage';
import { getDailyReflection, getNextReflection, DailyReflectionItem } from '../../services/reflections';
import {
  DailyProgress,
  DayActivity,
  KhatmahProgress,
  LastReadItem,
  PersonalStats,
  TimeSegment,
  UserProfile,
} from '../../types/quran';

export default function QuranlyHomeScreen() {
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Believer',
    joinedAt: Date.now(),
  });
  const [progress, setProgress] = useState<DailyProgress>({
    date: '',
    versesRead: 0,
    hasanat: 0,
    dailyGoal: 3,
    streakDays: 0,
  });
  const [weeklyDays, setWeeklyDays] = useState<DayActivity[]>([]);
  const [lastRead, setLastRead] = useState<LastReadItem | null>(null);
  const [recentList, setRecentList] = useState<LastReadItem[]>([]);
  const [khatmah, setKhatmah] = useState<KhatmahProgress>({
    uniqueVersesCount: 0,
    totalQuranVerses: 6236,
    percent: 0,
    completedSurahsCount: 0,
  });
  const [timeSegment, setTimeSegment] = useState<TimeSegment>('Today');
  const [stats, setStats] = useState<PersonalStats>({
    hasanat: 0,
    verses: 0,
    timeMinutes: 0,
    streak: 0,
  });

  const [reflection, setReflection] = useState<DailyReflectionItem>(() => getDailyReflection());

  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [customGoalText, setCustomGoalText] = useState('');
  const [editNameText, setEditNameText] = useState('');

  const loadData = async () => {
    const [prof, prog, week, lr, st, km, rec] = await Promise.all([
      getUserProfile(),
      getDailyProgress(),
      getWeeklyActivity(),
      getLastRead(),
      getTimeSegmentStats(timeSegment),
      getKhatmahProgress(),
      getRecentHistory(),
    ]);
    setProfile(prof);
    setProgress(prog);
    setWeeklyDays(week);
    setLastRead(lr);
    setStats(st);
    setKhatmah(km);
    setRecentList(rec);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [timeSegment])
  );

  const handleSegmentChange = async (seg: TimeSegment) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setTimeSegment(seg);
    const updatedStats = await getTimeSegmentStats(seg);
    setStats(updatedStats);
  };

  const handleQuickLog = async (count: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    await recordVersesRead(count);
    await loadData();
  };

  const handleNextReflection = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setReflection((prev) => getNextReflection(prev.id));
  };

  const handleReadPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    const targetSurah = lastRead ? lastRead.surah.toString() : '1';
    const targetAyah = lastRead ? lastRead.ayah.toString() : '1';

    router.push({
      pathname: '/surah/[id]',
      params: { id: targetSurah, targetAyah },
    });
  };

  const handleUpdateGoal = async (newGoal: number) => {
    if (newGoal <= 0) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    await setDailyGoal(newGoal);
    setIsGoalModalVisible(false);
    setCustomGoalText('');
    loadData();
  };

  const handleSaveName = async () => {
    if (!editNameText.trim()) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    const updated = await setUserProfile(editNameText.trim());
    setProfile(updated);
    setIsNameModalVisible(false);
    setEditNameText('');
  };

  const percent = Math.min(
    100,
    progress.dailyGoal > 0 ? Math.round((progress.versesRead / progress.dailyGoal) * 100) : 0
  );

  const avatarInitial = profile.name ? profile.name.charAt(0).toUpperCase() : 'U';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header: Avatar, Greeting, Streak points */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.userCol}
            onPress={() => {
              setEditNameText(profile.name);
              setIsNameModalVisible(true);
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Edit profile name"
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{avatarInitial}</Text>
            </View>
            <View>
              <View style={styles.nameRow}>
                <Text style={styles.greetingTitle}>Salam, {profile.name}</Text>
                <Ionicons name="pencil" size={12} color={COLORS.textMuted} style={{ marginLeft: 6 }} />
              </View>
              <Text style={styles.greetingSub}>Noble Quran companion</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.streakBadge}>
            <Ionicons name="book" size={17} color={COLORS.primaryLight} />
            <Text style={styles.streakBadgeText}>{progress.streakDays}</Text>
          </View>
        </View>

        {/* Weekly Calendar / Habit Strip (M T W T F S S) */}
        <View style={styles.weekStripContainer}>
          {weeklyDays.map((day, idx) => {
            return (
              <View
                key={idx}
                style={[
                  styles.dayCircle,
                  day.isToday && styles.dayCircleToday,
                  day.isCompleted && styles.dayCircleCompleted,
                ]}
              >
                <Text
                  style={[
                    styles.dayLetterText,
                    day.isToday && styles.dayLetterTextToday,
                    day.isCompleted && styles.dayLetterTextCompleted,
                  ]}
                >
                  {day.dayLetter}
                </Text>
                {day.isCompleted && (
                  <View style={styles.completedCheckDot} />
                )}
              </View>
            );
          })}
        </View>

        {/* Hero Goal Card with Purple / Violet Gradient */}
        <LinearGradient
          colors={[COLORS.heroGradientStart, COLORS.heroGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          {/* Top row: Goal title & Percentage */}
          <View style={styles.heroTopRow}>
            <Text style={styles.heroTitle}>Goal</Text>
            <Text style={styles.heroPercentText}>{percent}%</Text>
          </View>

          {/* Sub row: current reading position & edit icon */}
          <TouchableOpacity
            style={styles.heroSubRow}
            onPress={() => setIsGoalModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.heroPositionText}>
              {lastRead ? `${lastRead.surah} ${lastRead.surahName} | ${lastRead.ayah}` : '1 Al-Fatiha | 1/7'}
            </Text>
            <Ionicons name="pencil" size={13} color="rgba(255, 255, 255, 0.85)" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          {/* Progress bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
          </View>

            {/* Verses count per day label */}
            <Text style={styles.progressCounterText}>
              {progress.versesRead}/{progress.dailyGoal} verses per day
            </Text>

            {/* Quick Log Row */}
            <View style={styles.quickLogRow}>
              <Text style={styles.quickLogLabel}>Quick Log:</Text>
              <TouchableOpacity
                style={styles.quickLogPill}
                onPress={() => handleQuickLog(1)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickLogPillText}>+1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickLogPill}
                onPress={() => handleQuickLog(3)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickLogPillText}>+3</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickLogPill}
                onPress={() => handleQuickLog(5)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickLogPillText}>+5</Text>
              </TouchableOpacity>
            </View>

            {/* Large Pill Action Button: Read Quran */}
            <TouchableOpacity
              style={styles.readQuranButton}
              onPress={handleReadPress}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Read Quran"
            >
              <Text style={styles.readQuranButtonText}>Read Quran</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Dynamic Khatmah Journey Card */}
          <View style={styles.khatmahCard}>
            <View style={styles.khatmahTopRow}>
              <View style={styles.khatmahIconBox}>
                <Ionicons name="ribbon" size={18} color={COLORS.primaryDark} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.khatmahTitle}>Khatmah Journey</Text>
                <Text style={styles.khatmahSub}>
                  {khatmah.uniqueVersesCount.toLocaleString()} / 6,236 Ayahs • {khatmah.percent}% completed
                </Text>
              </View>
              <View style={styles.khatmahBadge}>
                <Text style={styles.khatmahBadgeText}>{khatmah.percent}%</Text>
              </View>
            </View>
            <View style={styles.khatmahProgressTrack}>
              <View
                style={[
                  styles.khatmahProgressFill,
                  { width: `${Math.max(1, khatmah.percent)}%` },
                ]}
              />
            </View>
            <Text style={styles.khatmahRemainingText}>
              {(6236 - khatmah.uniqueVersesCount).toLocaleString()} verses remaining to complete the Holy Quran
            </Text>
          </View>

          {/* Segmented Time Control: Today | Week | All */}
          <View style={styles.segmentContainer}>
            {(['Today', 'Week', 'All'] as TimeSegment[]).map((tab) => {
              const isActive = timeSegment === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                  onPress={() => handleSegmentChange(tab)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.segmentBtnText,
                      isActive && styles.segmentBtnTextActive,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Dynamic Metric Cards: Hasanat, Verses, and Time */}
          <View style={styles.metricsRow}>
            {/* Hasanat Card */}
            <View style={styles.metricCardItem}>
              <View style={styles.metricIconWrapHasanat}>
                <Ionicons name="heart" size={20} color="#F87171" />
              </View>
              <Text style={styles.metricLabel}>Hasanat</Text>
              <Text style={styles.metricValue}>
                {stats.hasanat.toLocaleString()}
              </Text>
              <Text style={styles.metricSub}>10x rewards</Text>
            </View>

            {/* Verses Card */}
            <View style={styles.metricCardItem}>
              <View style={styles.metricIconWrapVerses}>
                <Ionicons name="book" size={20} color="#60A5FA" />
              </View>
              <Text style={styles.metricLabel}>Verses</Text>
              <Text style={styles.metricValue}>
                {stats.verses.toLocaleString()}
              </Text>
              <Text style={styles.metricSub}>Ayahs recited</Text>
            </View>

            {/* Time Minutes Card */}
            <View style={styles.metricCardItem}>
              <View style={styles.metricIconWrapTime}>
                <Ionicons name="time" size={20} color="#A78BFA" />
              </View>
              <Text style={styles.metricLabel}>Time</Text>
              <Text style={styles.metricValue}>
                {stats.timeMinutes}m
              </Text>
              <Text style={styles.metricSub}>Minutes read</Text>
            </View>
          </View>

          {/* Dynamic Recent Reading History Strip */}
          {recentList.length > 0 && (
            <View style={styles.recentSection}>
              <View style={styles.recentSectionHeader}>
                <Text style={styles.recentSectionTitle}>Continue Reading</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/reading')}>
                  <Text style={styles.recentSeeAll}>View All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentScroll}
              >
                {recentList.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.recentCard}
                    onPress={() =>
                      router.push({
                        pathname: '/surah/[id]',
                        params: {
                          id: item.surah.toString(),
                          targetAyah: item.ayah.toString(),
                        },
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.recentBadge}>
                      <Text style={styles.recentBadgeNum}>{item.surah}</Text>
                    </View>
                    <View style={{ flex: 1, marginRight: 6 }}>
                      <Text style={styles.recentSurahName} numberOfLines={1}>
                        {item.surahName}
                      </Text>
                      <Text style={styles.recentAyahNum}>Verse {item.ayah}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={14} color={COLORS.primaryDark} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Dynamic Daily Contemplation / Reflection Card */}
          <View style={styles.reflectionCard}>
            <View style={styles.reflectionTagRow}>
              <View style={styles.reflectionTag}>
                <Text style={styles.reflectionTagText}>{reflection.theme}</Text>
              </View>
              <View style={styles.reflectionActionsRight}>
                <TouchableOpacity
                  style={styles.reflectionCycleBtn}
                  onPress={handleNextReflection}
                  activeOpacity={0.7}
                >
                  <Ionicons name="shuffle" size={13} color={COLORS.primaryDark} />
                  <Text style={styles.reflectionCycleText}>Next</Text>
                </TouchableOpacity>
                <Ionicons name="sparkles" size={16} color={COLORS.primary} style={{ marginLeft: 6 }} />
              </View>
            </View>

            <Text style={styles.reflectionArabic}>
              {reflection.arabic}
            </Text>

            <Text style={styles.reflectionTrans}>
              "{reflection.translation}"
            </Text>
            <Text style={styles.reflectionRef}>
              Surah {reflection.surahName} • {reflection.surah}:{reflection.ayah}
            </Text>

            <Text style={styles.reflectionContemplationText}>
              💡 {reflection.contemplation}
            </Text>

            <TouchableOpacity
              style={styles.reflectionAction}
              onPress={() => {
                router.push({
                  pathname: '/surah/[id]',
                  params: {
                    id: reflection.surah.toString(),
                    targetAyah: reflection.ayah.toString(),
                  },
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.reflectionActionText}>Reflect in Reader</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.primaryDark} />
            </TouchableOpacity>
          </View>
      </ScrollView>

      {/* Goal Customization Modal */}
      <Modal
        visible={isGoalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsGoalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Daily Reading Goal</Text>
            <Text style={styles.modalSub}>
              How many verses would you like to recite each day?
            </Text>

            <View style={styles.goalOptionsRow}>
              {[3, 5, 10, 20].map((goalNum) => (
                <TouchableOpacity
                  key={goalNum}
                  style={[
                    styles.goalOptionBtn,
                    progress.dailyGoal === goalNum && styles.goalOptionBtnActive,
                  ]}
                  onPress={() => handleUpdateGoal(goalNum)}
                >
                  <Text
                    style={[
                      styles.goalOptionText,
                      progress.dailyGoal === goalNum && styles.goalOptionTextActive,
                    ]}
                  >
                    {goalNum}
                  </Text>
                  <Text
                    style={[
                      styles.goalOptionSub,
                      progress.dailyGoal === goalNum && styles.goalOptionSubActive,
                    ]}
                  >
                    verses
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Goal Input */}
            <View style={styles.customGoalRow}>
              <TextInput
                style={styles.customGoalInput}
                placeholder="Or enter custom goal..."
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
                value={customGoalText}
                onChangeText={setCustomGoalText}
              />
              <TouchableOpacity
                style={styles.customGoalSubmitBtn}
                onPress={() => {
                  const parsed = parseInt(customGoalText, 10);
                  if (parsed > 0) handleUpdateGoal(parsed);
                }}
              >
                <Text style={styles.customGoalSubmitText}>Save</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setIsGoalModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Name Modal */}
      <Modal
        visible={isNameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Your Name</Text>
            <Text style={styles.modalSub}>
              Personalize your greeting and reading journey
            </Text>

            <TextInput
              style={styles.nameTextInput}
              placeholder="Enter your name..."
              placeholderTextColor={COLORS.textMuted}
              value={editNameText}
              onChangeText={setEditNameText}
              autoFocus
              maxLength={24}
            />

            <View style={styles.nameModalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsNameModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nameSaveBtn}
                onPress={handleSaveName}
              >
                <Text style={styles.nameSaveText}>Save Name</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 110,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6EE7B7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    fontFamily: FONTS.sansBold,
    fontSize: 20,
    color: '#064E3B',
  },
  greetingTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  greetingSub: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  streakBadgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    color: COLORS.primary,
  },
  weekStripContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    position: 'relative',
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  dayCircleCompleted: {
    backgroundColor: COLORS.primary,
  },
  dayLetterText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  dayLetterTextToday: {
    fontFamily: FONTS.sansBold,
    color: COLORS.primary,
  },
  dayLetterTextCompleted: {
    fontFamily: FONTS.sansBold,
    color: COLORS.textInverse,
  },
  completedCheckDot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  heroCard: {
    borderRadius: 26,
    padding: 22,
    marginBottom: 18,
    ...SHADOWS.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 24,
    color: COLORS.textInverse,
  },
  heroPercentText: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  heroSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  heroPositionText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  progressBarTrack: {
    height: 9,
    backgroundColor: COLORS.heroBarTrack,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.heroBarFill,
    borderRadius: 5,
  },
  progressCounterText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  quickLogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  quickLogLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginRight: 2,
  },
  quickLogPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  quickLogPillText: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    color: COLORS.textInverse,
  },
  readQuranButton: {
    backgroundColor: COLORS.heroBtnBg,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  readQuranButtonText: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    color: COLORS.textInverse,
    letterSpacing: 0.3,
  },
  khatmahCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  khatmahTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  khatmahIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  khatmahTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  khatmahSub: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  khatmahBadge: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  khatmahBadgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    color: COLORS.primaryDark,
  },
  khatmahProgressTrack: {
    height: 6,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  khatmahProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  khatmahRemainingText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 20,
    padding: 4,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 16,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  segmentBtnText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  segmentBtnTextActive: {
    fontFamily: FONTS.sansBold,
    color: COLORS.primary,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  metricCardItem: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  metricIconWrapHasanat: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(248, 113, 113, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricIconWrapVerses: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricIconWrapTime: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  metricValue: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  metricSub: {
    fontFamily: FONTS.sansRegular,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  recentSection: {
    marginBottom: 18,
  },
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  recentSectionTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  recentSeeAll: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.primary,
  },
  recentScroll: {
    gap: 10,
    paddingRight: 10,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 155,
    ...SHADOWS.sm,
  },
  recentBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  recentBadgeNum: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    color: COLORS.primaryDark,
  },
  recentSurahName: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  recentAyahNum: {
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  reflectionActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reflectionCycleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reflectionCycleText: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    color: COLORS.primaryDark,
  },
  reflectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    ...SHADOWS.sm,
  },
  reflectionTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reflectionTag: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reflectionTagText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  reflectionArabic: {
    fontFamily: FONTS.arabicSemiBold,
    fontSize: 20,
    color: COLORS.textArabic,
    textAlign: 'right',
    lineHeight: 36,
    marginBottom: 10,
  },
  reflectionTrans: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: 6,
  },
  reflectionRef: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.primary,
    marginBottom: 10,
  },
  reflectionContemplationText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  reflectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  reflectionActionText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  modalTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  modalSub: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  goalOptionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  goalOptionBtn: {
    width: 62,
    height: 64,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceSubtle,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalOptionBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  goalOptionText: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  goalOptionTextActive: {
    color: COLORS.textInverse,
  },
  goalOptionSub: {
    fontFamily: FONTS.sansRegular,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  goalOptionSubActive: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  customGoalRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginBottom: 14,
  },
  customGoalInput: {
    flex: 1,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  customGoalSubmitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customGoalSubmitText: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    color: COLORS.textInverse,
  },
  nameTextInput: {
    width: '100%',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: FONTS.sansMedium,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  nameModalActionsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
  },
  nameSaveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  nameSaveText: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    color: COLORS.textInverse,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
