import React, { useState } from 'react';
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
  getDailyMissions,
} from '../../services/storage';
import { getDailyReflection, getNextReflection, DailyReflectionItem } from '../../services/reflections';
import {
  getDailyWord,
  getNextDailyWord,
  BLESSED_SURAHS,
  DailyWordItem,
} from '../../services/dailyContent';
import { getSurahAyahs } from '../../services/quranData';
import { getWordLearningDetails } from '../../services/learningData';
import { GrammarExerciseModal } from '../../components/GrammarExerciseModal';
import { WordLearningModal } from '../../components/WordLearningModal';
import {
  DailyProgress,
  DayActivity,
  KhatmahProgress,
  LastReadItem,
  PersonalStats,
  TimeSegment,
  UserProfile,
  DailyMissionsState,
  WordLearningDetails,
} from '../../types/quran';

const DHIKR_ITEMS = [
  { ar: 'سُبْحَانَ ٱللَّهِ', tr: 'SubhanAllah', en: 'Glory be to Allah' },
  { ar: 'ٱلْحَمْدُ لِلَّهِ', tr: 'Alhamdulillah', en: 'All praise is to Allah' },
  { ar: 'ٱللَّهُ أَكْبَرُ', tr: 'Allahu Akbar', en: 'Allah is the Greatest' },
  { ar: 'لَا إِلَٰهَ إِلَّا ٱللَّهُ', tr: 'La ilaha illa Allah', en: 'None worthy of worship but Allah' },
  { ar: 'أَسْتَغْفِرُ ٱللَّهَ', tr: 'Astaghfirullah', en: 'I seek forgiveness from Allah' },
];

export default function QuranlyHomeScreen() {
  const [profile, setProfile] = useState<UserProfile>(() => ({
    name: 'Believer',
    joinedAt: Date.now(),
  }));
  const [progress, setProgress] = useState<DailyProgress>({
    date: '',
    versesRead: 0,
    hasanat: 0,
    dailyGoal: 3,
    streakDays: 0,
  });
  const [dailyMissions, setDailyMissions] = useState<DailyMissionsState | null>(null);
  const [isGrammarModalVisible, setIsGrammarModalVisible] = useState(false);
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
  const [dailyWord, setDailyWord] = useState<DailyWordItem>(() => getDailyWord());
  const [wordModalVisible, setWordModalVisible] = useState(false);
  const [activeWordDetails, setActiveWordDetails] = useState<WordLearningDetails | null>(null);

  const [tasbihIndex, setTasbihIndex] = useState(0);
  const [tasbihCount, setTasbihCount] = useState(0);

  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [customGoalText, setCustomGoalText] = useState('');
  const [editNameText, setEditNameText] = useState('');

  const loadData = React.useCallback(async () => {
    const [prof, prog, week, lr, st, km, rec, missions] = await Promise.all([
      getUserProfile(),
      getDailyProgress(),
      getWeeklyActivity(),
      getLastRead(),
      getTimeSegmentStats(timeSegment),
      getKhatmahProgress(),
      getRecentHistory(),
      getDailyMissions(),
    ]);
    setProfile(prof);
    setProgress(prog);
    setWeeklyDays(week);
    setLastRead(lr);
    setStats(st);
    setKhatmah(km);
    setRecentList(rec);
    setDailyMissions(missions);
  }, [timeSegment]);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [loadData])
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

  const currentDhikr = DHIKR_ITEMS[tasbihIndex];

  const handleCycleWord = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setDailyWord((prev) => getNextDailyWord(prev.id));
  };

  const handleExploreWord = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    const ayahs = getSurahAyahs(dailyWord.surah);
    const targetAyah = ayahs.find((a) => a.ayah === dailyWord.ayah);
    if (targetAyah && targetAyah.words && targetAyah.words[dailyWord.wordIndex]) {
      const wordObj = targetAyah.words[dailyWord.wordIndex];
      const details = getWordLearningDetails(
        dailyWord.surah,
        dailyWord.ayah,
        dailyWord.wordIndex,
        wordObj
      );
      setActiveWordDetails(details);
      setWordModalVisible(true);
    } else {
      router.push({
        pathname: '/surah/[id]',
        params: {
          id: dailyWord.surah.toString(),
          targetAyah: dailyWord.ayah.toString(),
        },
      });
    }
  };

  const handleNavigateFromWordModal = (surah: number, ayah: number) => {
    setWordModalVisible(false);
    router.push({
      pathname: '/surah/[id]',
      params: {
        id: surah.toString(),
        targetAyah: ayah.toString(),
      },
    });
  };

  const handleTasbihTap = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (tasbihCount + 1 >= 33) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      setTasbihCount(33);
    } else {
      setTasbihCount((prev) => prev + 1);
    }
  };

  const handleTasbihNextDhikr = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setTasbihIndex((prev) => (prev + 1) % DHIKR_ITEMS.length);
    setTasbihCount(0);
  };

  const handleTasbihReset = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setTasbihCount(0);
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

          {/* Playful Quick Feature Launchpad */}
          <View style={styles.quickHubSection}>
            <View style={styles.quickHubHeaderRow}>
              <Text style={styles.quickHubTitle}>Explore & Learn</Text>
              <View style={styles.quickHubBadge}>
                <Ionicons name="sparkles" size={12} color={COLORS.primaryDark} />
                <Text style={styles.quickHubBadgeText}>Interactive</Text>
              </View>
            </View>
            <View style={styles.quickHubGrid}>
              {/* Memorize */}
              <TouchableOpacity
                style={[styles.quickHubCard, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }]}
                onPress={() => router.push('/memorize')}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Open Quran Memorization Mode"
              >
                <View style={[styles.quickHubIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="bulb" size={20} color="#D97706" />
                </View>
                <View style={{ flex: 1, marginTop: 8 }}>
                  <Text style={[styles.quickHubCardTitle, { color: '#92400E' }]}>Hifz Mode</Text>
                  <Text style={styles.quickHubCardSub}>Hide verses & test recall</Text>
                </View>
                <View style={styles.quickHubArrowRow}>
                  <Text style={[styles.quickHubActionText, { color: '#B45309' }]}>Practice</Text>
                  <Ionicons name="arrow-forward" size={12} color="#B45309" />
                </View>
              </TouchableOpacity>

              {/* Vocab Trainer */}
              <TouchableOpacity
                style={[styles.quickHubCard, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}
                onPress={() => router.push('/trainer')}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Open Vocabulary Trainer"
              >
                <View style={[styles.quickHubIconBox, { backgroundColor: '#D1FAE5' }]}>
                  <Ionicons name="repeat" size={20} color="#059669" />
                </View>
                <View style={{ flex: 1, marginTop: 8 }}>
                  <Text style={[styles.quickHubCardTitle, { color: '#065F46' }]}>Vocab Deck</Text>
                  <Text style={styles.quickHubCardSub}>Spaced-repetition trainer</Text>
                </View>
                <View style={styles.quickHubArrowRow}>
                  <Text style={[styles.quickHubActionText, { color: '#047857' }]}>Review</Text>
                  <Ionicons name="arrow-forward" size={12} color="#047857" />
                </View>
              </TouchableOpacity>

              {/* Arabic Paths */}
              <TouchableOpacity
                style={[styles.quickHubCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
                onPress={() => router.push('/learn')}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Open Quranic Arabic Learning Paths"
              >
                <View style={[styles.quickHubIconBox, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="school" size={20} color="#2563EB" />
                </View>
                <View style={{ flex: 1, marginTop: 8 }}>
                  <Text style={[styles.quickHubCardTitle, { color: '#1E40AF' }]}>Arabic Paths</Text>
                  <Text style={styles.quickHubCardSub}>Roots & grammar lessons</Text>
                </View>
                <View style={styles.quickHubArrowRow}>
                  <Text style={[styles.quickHubActionText, { color: '#1D4ED8' }]}>5 Courses</Text>
                  <Ionicons name="arrow-forward" size={12} color="#1D4ED8" />
                </View>
              </TouchableOpacity>

              {/* Saved Words Bank */}
              <TouchableOpacity
                style={[styles.quickHubCard, { backgroundColor: '#FAF5FF', borderColor: '#E9D5FF' }]}
                onPress={() => router.push('/(tabs)/saved')}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Open Saved Words Bank"
              >
                <View style={[styles.quickHubIconBox, { backgroundColor: '#EDE9FE' }]}>
                  <Ionicons name="bookmarks" size={20} color="#7C3AED" />
                </View>
                <View style={{ flex: 1, marginTop: 8 }}>
                  <Text style={[styles.quickHubCardTitle, { color: '#5B21B6' }]}>Word Bank</Text>
                  <Text style={styles.quickHubCardSub}>Saved Quranic vocabulary</Text>
                </View>
                <View style={styles.quickHubArrowRow}>
                  <Text style={[styles.quickHubActionText, { color: '#6D28D9' }]}>Collection</Text>
                  <Ionicons name="arrow-forward" size={12} color="#6D28D9" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Daily Learning Missions (خطة الاستقامة اليومية) */}
          {dailyMissions && (
            <View style={styles.missionsCard}>
              {/* Header */}
              <View style={styles.missionsHeaderRow}>
                <View style={styles.missionsBadgeRow}>
                  <Text style={styles.missionsArabicTitle}>خُطَّةُ الاِسْتِقَامَةِ</Text>
                  <View
                    style={[
                      styles.missionsStatusPill,
                      dailyMissions.allCompleted && styles.missionsStatusPillComplete,
                    ]}
                  >
                    <Ionicons
                      name={
                        dailyMissions.allCompleted
                          ? 'checkmark-done-circle'
                          : 'sparkles'
                      }
                      size={13}
                      color={dailyMissions.allCompleted ? '#059669' : COLORS.primaryDark}
                    />
                    <Text
                      style={[
                        styles.missionsStatusPillText,
                        dailyMissions.allCompleted && styles.missionsStatusPillTextComplete,
                      ]}
                    >
                      {dailyMissions.allCompleted
                        ? 'All Completed 🌿'
                        : `${dailyMissions.completedCount} of ${dailyMissions.totalCount} completed`}
                    </Text>
                  </View>
                </View>
                <Text style={styles.missionsTitle}>Daily Learning Missions</Text>
                <Text style={styles.missionsSub}>
                  Balanced daily steps for worship, vocabulary, and grammar
                </Text>
              </View>

              {/* Missions Items */}
              <View style={styles.missionsList}>
                {dailyMissions.missions.map((mission) => {
                  const percentDone = Math.min(
                    100,
                    mission.target > 0
                      ? Math.round((mission.current / mission.target) * 100)
                      : 0
                  );

                  const handleMissionAction = () => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}

                    if (mission.id === 'read_verses') {
                      handleReadPress();
                    } else if (mission.id === 'learn_words') {
                      router.push('/(tabs)/saved');
                    } else if (mission.id === 'grammar_exercise') {
                      setIsGrammarModalVisible(true);
                    } else if (mission.id === 'review_vocab') {
                      router.push('/trainer');
                    }
                  };

                  return (
                    <View key={mission.id} style={styles.missionItemCard}>
                      <View style={styles.missionItemTopRow}>
                        <View
                          style={[
                            styles.missionIconCircle,
                            mission.completed && styles.missionIconCircleCompleted,
                          ]}
                        >
                          <Ionicons
                            name={mission.completed ? 'checkmark' : (mission.icon as any)}
                            size={18}
                            color={mission.completed ? '#059669' : COLORS.primary}
                          />
                        </View>

                        <View style={{ flex: 1, marginLeft: 10, marginRight: 8 }}>
                          <View style={styles.missionCategoryRow}>
                            <Text style={styles.missionItemTitle}>{mission.title}</Text>
                            <View
                              style={[
                                styles.categoryBadge,
                                mission.category === 'worship'
                                  ? styles.categoryBadgeWorship
                                  : styles.categoryBadgeLearning,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.categoryBadgeText,
                                  mission.category === 'worship'
                                    ? styles.categoryBadgeTextWorship
                                    : styles.categoryBadgeTextLearning,
                                ]}
                              >
                                {mission.category === 'worship' ? 'Worship' : 'Learning'}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.missionItemSub}>{mission.subtitle}</Text>
                        </View>

                        {mission.completed ? (
                          <View style={styles.missionCompletedPill}>
                            <Ionicons name="checkmark-circle" size={14} color="#059669" />
                            <Text style={styles.missionCompletedPillText}>Done</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.missionActionBtn}
                            onPress={handleMissionAction}
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel={`${mission.actionLabel} ${mission.title}`}
                          >
                            <Text style={styles.missionActionBtnText}>{mission.actionLabel}</Text>
                            <Ionicons
                              name="chevron-forward"
                              size={12}
                              color={COLORS.primaryDark}
                            />
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Progress Bar & Numeric Feedback */}
                      <View style={styles.missionProgressRow}>
                        <View style={styles.missionBarTrack}>
                          <View
                            style={[
                              styles.missionBarFill,
                              mission.completed && styles.missionBarFillCompleted,
                              { width: `${percentDone}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.missionProgressCount}>
                          {mission.current} / {mission.target} {mission.unit}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Peaceful Istiqamah Completion Banner */}
              {dailyMissions.allCompleted && (
                <View style={styles.istiqamahBanner}>
                  <Ionicons name="heart" size={18} color="#F87171" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.istiqamahBannerTitle}>
                      Alhamdulillah for Your Steadfastness
                    </Text>
                    <Text style={styles.istiqamahBannerSub}>
                      &ldquo;The deeds most loved by Allah are those done regularly, even if few.&rdquo; (Sahih al-Bukhari 6464, Sahih Muslim 782).
                      {'\n'}May Allah accept your efforts and grant barakah in your learning.
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Quranic Arabic Learning Paths Banner */}
          <TouchableOpacity
            style={styles.learningPathsBanner}
            onPress={() => router.push('/learn')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Quranic Arabic Learning Paths"
          >
            <View style={styles.learningPathsIconBox}>
              <Ionicons name="school" size={22} color={COLORS.primaryDark} />
            </View>
            <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
              <View style={styles.learningPathsTagRow}>
                <Text style={styles.learningPathsBadgeText}>STRUCTURED CURRICULUM</Text>
                <Text style={styles.learningPathsArabicSub}>مَسَارَاتُ العَرَبِيَّةِ</Text>
              </View>
              <Text style={styles.learningPathsTitle}>Quranic Arabic Paths</Text>
              <Text style={styles.learningPathsDesc}>
                5 beginner-to-intermediate courses: Common Words, Pronouns, Particles, Roots & Sentences.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.primaryDark} />
          </TouchableOpacity>

          {/* Quranic Word of the Day */}
          <View style={styles.wordOfTheDayCard}>
            <View style={styles.wordCardHeaderRow}>
              <View style={styles.wordBadgeRow}>
                <Text style={styles.wordArabicTag}>كَلِمَةُ الْيَوْمِ</Text>
                <View style={styles.wordThemePill}>
                  <Text style={styles.wordThemePillText}>{dailyWord.theme}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.cycleWordBtn}
                onPress={handleCycleWord}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Cycle next word of the day"
              >
                <Ionicons name="shuffle" size={13} color={COLORS.primaryDark} />
                <Text style={styles.cycleWordBtnText}>Next</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.wordMainContent}>
              <Text style={styles.wordArabicBig}>{dailyWord.arabic}</Text>
              <Text style={styles.wordTransliteration}>{dailyWord.transliteration}</Text>
              <Text style={styles.wordMeaning}>&ldquo;{dailyWord.english}&rdquo;</Text>

              {/* Root Pill & Context */}
              <View style={styles.wordRootPillRow}>
                <View style={styles.rootPill}>
                  <Text style={styles.rootPillLabel}>ROOT</Text>
                  <Text style={styles.rootPillArabic}>{dailyWord.rootAr}</Text>
                </View>
                <Text style={styles.rootPillCount}>{dailyWord.rootCount} occurrences</Text>
              </View>
              <Text style={styles.rootMeaningText}>Root Meaning: {dailyWord.rootMeaning}</Text>

              {/* Ayah Snippet Context */}
              <View style={styles.wordSnippetBox}>
                <Text style={styles.wordSnippetArabic}>{dailyWord.ayahSnippet}</Text>
                <Text style={styles.wordSnippetRef}>
                  Surah {dailyWord.surahName} • {dailyWord.surah}:{dailyWord.ayah}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.wordActionRow}>
                <TouchableOpacity
                  style={styles.exploreWordBtn}
                  onPress={handleExploreWord}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Explore word morphology and root occurrences"
                >
                  <Ionicons name="school" size={15} color="#FFFFFF" />
                  <Text style={styles.exploreWordBtnText}>Explore Word & Root</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewVerseBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/surah/[id]',
                      params: {
                        id: dailyWord.surah.toString(),
                        targetAyah: dailyWord.ayah.toString(),
                      },
                    })
                  }
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Read this Ayah in full reader"
                >
                  <Text style={styles.viewVerseBtnText}>Read Verse</Text>
                  <Ionicons name="arrow-forward" size={13} color={COLORS.primaryDark} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Blessed Surahs & Prophetic Sunnah Strip */}
          <View style={styles.blessedSection}>
            <View style={styles.blessedHeaderRow}>
              <View>
                <Text style={styles.blessedSectionTitle}>Blessed Surahs & Sunnah</Text>
                <Text style={styles.blessedSectionSub}>Prophetic recommendations & spiritual virtues</Text>
              </View>
              <View style={styles.blessedArabicPill}>
                <Text style={styles.blessedArabicPillText}>سُوَرٌ مُبَارَكَةٌ</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.blessedScroll}
            >
              {BLESSED_SURAHS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.blessedCard,
                    { backgroundColor: item.bgColor, borderColor: item.borderColor },
                  ]}
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    router.push({
                      pathname: '/surah/[id]',
                      params: {
                        id: item.surahNumber.toString(),
                        targetAyah: item.targetAyah ? item.targetAyah.toString() : '1',
                      },
                    });
                  }}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Read ${item.title}`}
                >
                  <View style={styles.blessedCardTop}>
                    <View
                      style={[
                        styles.blessedBadgeWrap,
                        { backgroundColor: item.borderColor },
                      ]}
                    >
                      <Ionicons name={item.icon as any} size={12} color={item.accentColor} />
                      <Text style={[styles.blessedBadgeText, { color: item.accentColor }]}>
                        {item.badge}
                      </Text>
                    </View>
                    <Text style={styles.blessedArabicName}>{item.arabicTitle}</Text>
                  </View>

                  <Text style={styles.blessedCardTitle}>{item.title}</Text>
                  <Text style={styles.blessedVirtueText} numberOfLines={3}>
                    {item.virtue}
                  </Text>

                  {item.hadithSource && (
                    <View style={styles.blessedHadithRow}>
                      <Ionicons name="book-outline" size={11} color={item.accentColor} />
                      <Text
                        style={[styles.blessedHadithText, { color: item.accentColor }]}
                        numberOfLines={1}
                      >
                        {item.hadithSource} • {item.hadithGrade}
                      </Text>
                    </View>
                  )}

                  <View style={styles.blessedActionRow}>
                    <Text style={[styles.blessedReadText, { color: item.accentColor }]}>
                      {item.targetAyah ? `Verse ${item.targetAyah}` : 'Read Surah'}
                    </Text>
                    <Ionicons name="arrow-forward" size={13} color={item.accentColor} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Playful Tasbih & Dhikr Pulse Widget */}
          <View style={styles.tasbihCard}>
            <View style={styles.tasbihHeaderRow}>
              <View style={styles.tasbihTitleCol}>
                <Text style={styles.tasbihArabicTitle}>تَسْبِيحُ الْقَلْبِ</Text>
                <Text style={styles.tasbihMainTitle}>Daily Dhikr Pulse</Text>
              </View>
              <TouchableOpacity
                style={styles.tasbihCycleBtn}
                onPress={handleTasbihNextDhikr}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Switch to next Dhikr phrase"
              >
                <Ionicons name="sync" size={12} color={COLORS.primaryDark} />
                <Text style={styles.tasbihCycleBtnText}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* Current Phrase Box */}
            <View style={styles.tasbihPhraseBox}>
              <Text style={styles.tasbihPhraseArabic}>{currentDhikr.ar}</Text>
              <Text style={styles.tasbihPhraseTr}>{currentDhikr.tr}</Text>
              <Text style={styles.tasbihPhraseEn}>&ldquo;{currentDhikr.en}&rdquo;</Text>
            </View>

            {/* Tap Counter & Stats */}
            <View style={styles.tasbihInteractRow}>
              <TouchableOpacity
                style={[
                  styles.tasbihTapButton,
                  tasbihCount >= 33 && styles.tasbihTapButtonDone,
                ]}
                onPress={handleTasbihTap}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Tap tasbih. Current count ${tasbihCount} of 33`}
              >
                <Text
                  style={[
                    styles.tasbihCountBig,
                    tasbihCount >= 33 && styles.tasbihCountBigDone,
                  ]}
                >
                  {tasbihCount}
                </Text>
                <Text style={styles.tasbihTargetSub}>/ 33</Text>
                <Text style={styles.tasbihTapHint}>
                  {tasbihCount >= 33 ? 'Completed! 🌿' : 'TAP TO COUNT'}
                </Text>
              </TouchableOpacity>

              <View style={styles.tasbihSideControls}>
                {tasbihCount > 0 && (
                  <TouchableOpacity
                    style={styles.tasbihResetBtn}
                    onPress={handleTasbihReset}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Reset tasbih count"
                  >
                    <Ionicons name="refresh" size={15} color={COLORS.textMuted} />
                    <Text style={styles.tasbihResetText}>Reset</Text>
                  </TouchableOpacity>
                )}

                {tasbihCount >= 33 ? (
                  <View style={styles.tasbihCompleteBadge}>
                    <Ionicons name="checkmark-done" size={13} color="#059669" />
                    <Text style={styles.tasbihCompleteBadgeText}>BarakAllah 🌟</Text>
                  </View>
                ) : (
                  <View style={styles.tasbihRemainingBadge}>
                    <Text style={styles.tasbihRemainingText}>
                      {33 - tasbihCount} beads left
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

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
              &ldquo;{reflection.translation}&rdquo;
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

      {/* Daily Grammar Exercise Modal */}
      <GrammarExerciseModal
        visible={isGrammarModalVisible}
        onClose={() => setIsGrammarModalVisible(false)}
        onCompleted={loadData}
      />

      {/* Interactive Word Learning Modal */}
      <WordLearningModal
        visible={wordModalVisible}
        wordDetails={activeWordDetails}
        onClose={() => setWordModalVisible(false)}
        onNavigateToAyah={handleNavigateFromWordModal}
      />
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

  // Daily Learning Missions Card Styles
  missionsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: 16,
    ...SHADOWS.sm,
  },
  missionsHeaderRow: {
    marginBottom: 14,
  },
  missionsBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  missionsArabicTitle: {
    fontSize: 16,
    fontFamily: FONTS.arabicBold,
    color: COLORS.primaryDark,
  },
  missionsStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  missionsStatusPillComplete: {
    backgroundColor: '#ECFDF5',
  },
  missionsStatusPillText: {
    fontSize: 11,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.primaryDark,
  },
  missionsStatusPillTextComplete: {
    color: '#059669',
  },
  missionsTitle: {
    fontSize: 18,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  missionsSub: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  missionsList: {
    gap: 10,
  },
  missionItemCard: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  missionItemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  missionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  missionIconCircleCompleted: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  missionCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  missionItemTitle: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeWorship: {
    backgroundColor: '#EFF6FF',
  },
  categoryBadgeLearning: {
    backgroundColor: '#F3EEFD',
  },
  categoryBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.sansSemiBold,
  },
  categoryBadgeTextWorship: {
    color: '#2563EB',
  },
  categoryBadgeTextLearning: {
    color: '#7C3AED',
  },
  missionItemSub: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  missionCompletedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  missionCompletedPillText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: '#059669',
  },
  missionActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    gap: 3,
  },
  missionActionBtnText: {
    fontSize: 12,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.primaryDark,
  },
  missionProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  missionBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  missionBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  missionBarFillCompleted: {
    backgroundColor: '#10B981',
  },
  missionProgressCount: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textSecondary,
    minWidth: 70,
    textAlign: 'right',
  },
  istiqamahBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 14,
  },
  istiqamahBannerTitle: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: '#166534',
    marginBottom: 2,
  },
  istiqamahBannerSub: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: '#15803D',
    lineHeight: 16,
  },
  learningPathsBanner: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  learningPathsIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learningPathsTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  learningPathsBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
    letterSpacing: 0.8,
  },
  learningPathsArabicSub: {
    fontSize: 12,
    fontFamily: FONTS.arabicMedium,
    color: COLORS.textMuted,
  },
  learningPathsTitle: {
    fontSize: 16,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  learningPathsDesc: {
    fontSize: 12,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },

  // Quick Feature Hub Styles
  quickHubSection: {
    marginTop: 18,
    marginBottom: 4,
  },
  quickHubHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  quickHubTitle: {
    fontSize: 16,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  quickHubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  quickHubBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.primaryDark,
  },
  quickHubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickHubCard: {
    width: '48.5%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    ...SHADOWS.sm,
    justifyContent: 'space-between',
    minHeight: 116,
  },
  quickHubIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickHubCardTitle: {
    fontSize: 14,
    fontFamily: FONTS.sansBold,
  },
  quickHubCardSub: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  quickHubArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  quickHubActionText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
  },

  // Word of the Day Card Styles
  wordOfTheDayCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    padding: 16,
    marginTop: 16,
    ...SHADOWS.sm,
  },
  wordCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  wordBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordArabicTag: {
    fontSize: 15,
    fontFamily: FONTS.arabicBold,
    color: '#7C3AED',
  },
  wordThemePill: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  wordThemePillText: {
    fontSize: 11,
    fontFamily: FONTS.sansSemiBold,
    color: '#6D28D9',
  },
  cycleWordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    gap: 4,
  },
  cycleWordBtnText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  wordMainContent: {
    alignItems: 'center',
  },
  wordArabicBig: {
    fontFamily: FONTS.arabicBold,
    fontSize: 32,
    color: '#4C1D95',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 1,
  },
  wordTransliteration: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 14,
    color: '#6D28D9',
    marginTop: 2,
  },
  wordMeaning: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 4,
  },
  wordRootPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  rootPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  rootPillLabel: {
    fontSize: 9,
    fontFamily: FONTS.sansBold,
    color: '#7C3AED',
    letterSpacing: 0.5,
  },
  rootPillArabic: {
    fontSize: 13,
    fontFamily: FONTS.arabicBold,
    color: '#5B21B6',
  },
  rootPillCount: {
    fontSize: 11,
    fontFamily: FONTS.sansMedium,
    color: COLORS.textMuted,
  },
  rootMeaningText: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  wordSnippetBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginTop: 10,
    alignItems: 'center',
  },
  wordSnippetArabic: {
    fontFamily: FONTS.arabicMedium,
    fontSize: 15,
    color: '#2E1065',
    textAlign: 'center',
  },
  wordSnippetRef: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  wordActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    width: '100%',
  },
  exploreWordBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 9,
    borderRadius: 12,
    gap: 6,
    ...SHADOWS.sm,
  },
  exploreWordBtnText: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    color: '#FFFFFF',
  },
  viewVerseBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    gap: 4,
  },
  viewVerseBtnText: {
    fontSize: 12,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },

  // Blessed Surahs Strip Styles
  blessedSection: {
    marginTop: 18,
  },
  blessedHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  blessedSectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  blessedSectionSub: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  blessedArabicPill: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  blessedArabicPillText: {
    fontSize: 12,
    fontFamily: FONTS.arabicBold,
    color: COLORS.primaryDark,
  },
  blessedScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  blessedCard: {
    width: 210,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    ...SHADOWS.sm,
    justifyContent: 'space-between',
  },
  blessedCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  blessedBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  blessedBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
  },
  blessedArabicName: {
    fontSize: 13,
    fontFamily: FONTS.arabicBold,
    color: COLORS.textPrimary,
  },
  blessedCardTitle: {
    fontSize: 15,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  blessedVirtueText: {
    fontSize: 11,
    fontFamily: FONTS.sansRegular,
    color: COLORS.textSecondary,
    lineHeight: 15,
    marginTop: 4,
    marginBottom: 6,
  },
  blessedHadithRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  blessedHadithText: {
    fontSize: 10,
    fontFamily: FONTS.sansMedium,
    flex: 1,
  },
  blessedActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  blessedReadText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
  },

  // Tasbih & Dhikr Pulse Widget Styles
  tasbihCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginTop: 16,
    ...SHADOWS.sm,
  },
  tasbihHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tasbihTitleCol: {
    flex: 1,
  },
  tasbihArabicTitle: {
    fontSize: 13,
    fontFamily: FONTS.arabicBold,
    color: COLORS.primary,
  },
  tasbihMainTitle: {
    fontSize: 15,
    fontFamily: FONTS.sansBold,
    color: COLORS.textPrimary,
  },
  tasbihCycleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tasbihCycleBtnText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  tasbihPhraseBox: {
    backgroundColor: '#FAF5FF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3E8FF',
    alignItems: 'center',
    marginBottom: 12,
  },
  tasbihPhraseArabic: {
    fontFamily: FONTS.arabicBold,
    fontSize: 22,
    color: '#4C1D95',
    textAlign: 'center',
  },
  tasbihPhraseTr: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 13,
    color: '#7C3AED',
    marginTop: 2,
  },
  tasbihPhraseEn: {
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  tasbihInteractRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  tasbihTapButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
    borderWidth: 3,
    borderColor: '#DDD6FE',
  },
  tasbihTapButtonDone: {
    backgroundColor: '#059669',
    borderColor: '#A7F3D0',
  },
  tasbihCountBig: {
    fontFamily: FONTS.sansBold,
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 32,
  },
  tasbihCountBigDone: {
    color: '#FFFFFF',
  },
  tasbihTargetSub: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  tasbihTapHint: {
    fontFamily: FONTS.sansBold,
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  tasbihSideControls: {
    flex: 1,
    marginLeft: 18,
    alignItems: 'flex-start',
    gap: 10,
  },
  tasbihResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  tasbihResetText: {
    fontSize: 12,
    fontFamily: FONTS.sansSemiBold,
    color: COLORS.textSecondary,
  },
  tasbihCompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 4,
  },
  tasbihCompleteBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.sansBold,
    color: '#059669',
  },
  tasbihRemainingBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  tasbihRemainingText: {
    fontSize: 11,
    fontFamily: FONTS.sansSemiBold,
    color: '#7C3AED',
  },
});


