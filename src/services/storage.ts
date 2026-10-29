import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BookmarkItem,
  DailyProgress,
  DayActivity,
  KhatmahProgress,
  LastReadItem,
  PersonalStats,
  ReaderSettings,
  SavedWordItem,
  TimeSegment,
  UserProfile,
  VerseHifzRecord,
  MurajahReminder,
  HifzStrength,
  DailyMissionId,
  DailyMissionItem,
  DailyMissionsState,
  LearningPathProgress,
  ContentErrorReport,
} from '../types/quran';

const USER_PROFILE_KEY = '@quran_user_profile';
const BOOKMARKS_KEY = '@quran_bookmarks';
const SAVED_VOCABULARY_KEY = '@quran_saved_vocabulary';
const HIFZ_RECORDS_KEY = '@quran_hifz_records';
const MURAJAH_REMINDERS_KEY = '@quran_murajah_reminders';
const LAST_READ_KEY = '@quran_last_read';
const RECENT_HISTORY_KEY = '@quran_recent_history';
const UNIQUE_AYAHS_KEY = '@quran_read_ayahs';
const SETTINGS_KEY = '@quran_reader_settings';
const GOAL_KEY = '@quran_daily_goal';
const HISTORY_KEY = '@quran_activity_history'; // Record<dateStr, { verses: number, hasanat: number, timeSeconds?: number }>
const DAILY_MISSIONS_KEY_PREFIX = '@quran_daily_missions_';
const LEARNING_PATH_PROGRESS_KEY = '@quran_learning_path_progress';
const CONTENT_ERROR_REPORTS_KEY = '@quran_content_error_reports';

export interface DayHistoryRecord {
  verses: number;
  hasanat: number;
  timeSeconds?: number;
}

export const DEFAULT_SETTINGS: ReaderSettings = {
  arabicFontSize: 28,
  showTranslation: true,
  translationLanguage: 'english',
  showTransliteration: true,
  showWbw: false,
  reciter: 'Alafasy_128kbps',
};

const DEFAULT_DAILY_GOAL = 3; // matching Quranly's default "0/3 verses per day"
const HASANAT_PER_VERSE = 700; // Hadith estimate: ~70 letters per verse * 10 hasanat

const getTodayDateStr = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export async function getBookmarks(): Promise<BookmarkItem[]> {
  try {
    const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function toggleBookmark(item: BookmarkItem): Promise<boolean> {
  try {
    const current = await getBookmarks();
    const existingIndex = current.findIndex((b) => b.id === item.id);
    let updated: BookmarkItem[];
    let isNowBookmarked: boolean;

    if (existingIndex >= 0) {
      updated = current.filter((b) => b.id !== item.id);
      isNowBookmarked = false;
    } else {
      updated = [item, ...current];
      isNowBookmarked = true;
    }

    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
    return isNowBookmarked;
  } catch {
    return false;
  }
}

export async function isBookmarked(surah: number, ayah: number): Promise<boolean> {
  const bookmarks = await getBookmarks();
  const id = `${surah}:${ayah}`;
  return bookmarks.some((b) => b.id === id);
}

export async function getLastRead(): Promise<LastReadItem | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_READ_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function getRecentHistory(): Promise<LastReadItem[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addRecentHistory(item: LastReadItem): Promise<void> {
  try {
    const current = await getRecentHistory();
    const filtered = current.filter((h) => h.surah !== item.surah);
    const updated = [item, ...filtered].slice(0, 10);
    await AsyncStorage.setItem(RECENT_HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export async function setLastRead(item: LastReadItem): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_READ_KEY, JSON.stringify(item));
    await addRecentHistory(item);
  } catch {
    // Ignore storage errors
  }
}

export async function getReaderSettings(): Promise<ReaderSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveReaderSettings(settings: Partial<ReaderSettings>): Promise<ReaderSettings> {
  try {
    const current = await getReaderSettings();
    const merged = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getUserProfile(): Promise<UserProfile> {
  try {
    const raw = await AsyncStorage.getItem(USER_PROFILE_KEY);
    if (!raw) {
      return { name: 'Believer', joinedAt: Date.now() };
    }
    return JSON.parse(raw);
  } catch {
    return { name: 'Believer', joinedAt: Date.now() };
  }
}

export async function setUserProfile(profileOrName: string | Partial<UserProfile>): Promise<UserProfile> {
  const current = await getUserProfile();
  let updated: UserProfile;
  if (typeof profileOrName === 'string') {
    updated = { ...current, name: profileOrName.trim() || 'Believer' };
  } else {
    updated = { ...current, ...profileOrName };
    if (!updated.name || !updated.name.trim()) updated.name = 'Believer';
  }
  try {
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export async function clearAllActivityData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      HISTORY_KEY,
      LAST_READ_KEY,
      RECENT_HISTORY_KEY,
      UNIQUE_AYAHS_KEY,
    ]);
  } catch {}
}

// ----------------- Daily Goals & Progress -----------------

export async function getDailyGoal(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(GOAL_KEY);
    return raw ? parseInt(raw, 10) : DEFAULT_DAILY_GOAL;
  } catch {
    return DEFAULT_DAILY_GOAL;
  }
}

export async function setDailyGoal(goal: number): Promise<void> {
  try {
    await AsyncStorage.setItem(GOAL_KEY, goal.toString());
  } catch {}
}

export async function getActivityHistory(): Promise<Record<string, DayHistoryRecord>> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function recordReadingTime(seconds: number): Promise<void> {
  if (seconds <= 0) return;
  try {
    const today = getTodayDateStr();
    const history = await getActivityHistory();
    const currentToday = history[today] || { verses: 0, hasanat: 0, timeSeconds: 0 };
    history[today] = {
      ...currentToday,
      timeSeconds: (currentToday.timeSeconds || 0) + seconds,
    };
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {}
}

export async function recordVersesRead(count: number = 1, hasanatCount?: number): Promise<DailyProgress> {
  try {
    const today = getTodayDateStr();
    const history = await getActivityHistory();
    const currentToday = history[today] || { verses: 0, hasanat: 0, timeSeconds: 0 };

    const addedHasanat = hasanatCount ?? count * HASANAT_PER_VERSE;

    history[today] = {
      ...currentToday,
      verses: currentToday.verses + count,
      hasanat: currentToday.hasanat + addedHasanat,
    };

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    try {
      await incrementMissionProgress('read_verses', count, today);
    } catch {}
    return getDailyProgress();
  } catch {
    return getDailyProgress();
  }
}

export async function recordAyahRead(surah: number, ayah: number, hasanatCount?: number): Promise<DailyProgress> {
  try {
    const ayahKey = `${surah}:${ayah}`;
    const raw = await AsyncStorage.getItem(UNIQUE_AYAHS_KEY);
    const set: string[] = raw ? JSON.parse(raw) : [];
    if (!set.includes(ayahKey)) {
      set.push(ayahKey);
      await AsyncStorage.setItem(UNIQUE_AYAHS_KEY, JSON.stringify(set));
    }
  } catch {}
  return recordVersesRead(1, hasanatCount);
}

export async function getKhatmahProgress(): Promise<KhatmahProgress> {
  try {
    const raw = await AsyncStorage.getItem(UNIQUE_AYAHS_KEY);
    const readAyahs: string[] = raw ? JSON.parse(raw) : [];
    const uniqueCount = readAyahs.length;
    const total = 6236;
    const percent = Math.min(100, Number(((uniqueCount / total) * 100).toFixed(1)));
    return {
      uniqueVersesCount: uniqueCount,
      totalQuranVerses: total,
      percent,
      completedSurahsCount: 0,
    };
  } catch {
    return {
      uniqueVersesCount: 0,
      totalQuranVerses: 6236,
      percent: 0,
      completedSurahsCount: 0,
    };
  }
}

export async function getDailyProgress(): Promise<DailyProgress> {
  const today = getTodayDateStr();
  const history = await getActivityHistory();
  const goal = await getDailyGoal();

  const todayRecord = history[today] || { verses: 0, hasanat: 0 };

  // Calculate streak: check consecutive days backward from today (or yesterday if today is 0)
  let streak = 0;
  const now = new Date();

  let checkDate = new Date(now);
  const todayKey = checkDate.toISOString().split('T')[0];
  if (!history[todayKey] || history[todayKey].verses === 0) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    const rec = history[dateStr];
    if (rec && rec.verses > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    date: today,
    versesRead: todayRecord.verses,
    hasanat: todayRecord.hasanat,
    dailyGoal: goal,
    streakDays: streak,
  };
}

export async function getWeeklyActivity(): Promise<DayActivity[]> {
  const history = await getActivityHistory();
  const goal = await getDailyGoal();
  const todayStr = getTodayDateStr();

  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = (dayOfWeek + 6) % 7;

  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);

  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekDays: DayActivity[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const record = history[dateStr];
    const count = record ? record.verses : 0;

    weekDays.push({
      dayLetter: dayLetters[i],
      dayNumber: d.getDate(),
      dateStr,
      isToday: dateStr === todayStr,
      isCompleted: count >= goal,
      count,
    });
  }

  return weekDays;
}

export async function getTimeSegmentStats(segment: TimeSegment): Promise<PersonalStats> {
  const history = await getActivityHistory();
  const progress = await getDailyProgress();

  if (segment === 'Today') {
    const today = getTodayDateStr();
    const todayRecord = history[today] || { verses: 0, hasanat: 0, timeSeconds: 0 };
    const recordedSec = todayRecord.timeSeconds || 0;
    const calcMin = Math.round(progress.versesRead * 0.7);
    const finalMinutes = recordedSec > 0 ? Math.max(1, Math.round(recordedSec / 60)) : calcMin;

    return {
      hasanat: progress.hasanat,
      verses: progress.versesRead,
      timeMinutes: finalMinutes,
      streak: progress.streakDays,
    };
  }

  if (segment === 'Week') {
    const weeklyDays = await getWeeklyActivity();
    let weekVerses = 0;
    let weekHasanat = 0;
    let weekSec = 0;

    for (const day of weeklyDays) {
      const rec = history[day.dateStr];
      if (rec) {
        weekVerses += rec.verses;
        weekHasanat += rec.hasanat;
        weekSec += rec.timeSeconds || 0;
      }
    }

    const calcMin = Math.round(weekVerses * 0.7);
    const finalMinutes = weekSec > 0 ? Math.max(1, Math.round(weekSec / 60)) : calcMin;

    return {
      hasanat: weekHasanat,
      verses: weekVerses,
      timeMinutes: finalMinutes,
      streak: progress.streakDays,
    };
  }

  // All time
  let allVerses = 0;
  let allHasanat = 0;
  let allSec = 0;

  for (const date in history) {
    allVerses += history[date].verses;
    allHasanat += history[date].hasanat;
    allSec += history[date].timeSeconds || 0;
  }

  const effectiveVerses = allVerses > 0 ? allVerses : progress.versesRead;
  const effectiveHasanat = allVerses > 0 ? allHasanat : progress.hasanat;
  const calcMin = Math.round(effectiveVerses * 0.7);
  const finalMinutes = allSec > 0 ? Math.max(1, Math.round(allSec / 60)) : calcMin;

  return {
    hasanat: effectiveHasanat,
    verses: effectiveVerses,
    timeMinutes: finalMinutes,
    streak: progress.streakDays,
  };
}

// ----------------- Vocabulary Collection -----------------

export async function getSavedVocabulary(): Promise<SavedWordItem[]> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_VOCABULARY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function isVocabularyWordSaved(id: string): Promise<boolean> {
  try {
    const items = await getSavedVocabulary();
    return items.some((item) => item.id === id);
  } catch {
    return false;
  }
}

export async function toggleSaveVocabularyWord(item: SavedWordItem): Promise<boolean> {
  try {
    const current = await getSavedVocabulary();
    const existingIndex = current.findIndex((w) => w.id === item.id);
    let updated: SavedWordItem[];
    let isNowSaved: boolean;

    if (existingIndex >= 0) {
      updated = current.filter((w) => w.id !== item.id);
      isNowSaved = false;
    } else {
      const defaultSRS: Partial<SavedWordItem> = {
        repetition: 0,
        interval: 1,
        easeFactor: 2.5,
        nextReviewDate: Date.now(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        accuracy: 0,
        status: 'learning',
        mastered: false,
      };
      const wordWithSRS: SavedWordItem = {
        ...defaultSRS,
        ...item,
      };
      updated = [wordWithSRS, ...current];
      isNowSaved = true;
    }

    await AsyncStorage.setItem(SAVED_VOCABULARY_KEY, JSON.stringify(updated));
    if (isNowSaved) {
      try {
        await incrementMissionProgress('learn_words', 1);
      } catch {}
    }
    return isNowSaved;
  } catch {
    return false;
  }
}

export async function removeVocabularyWord(id: string): Promise<boolean> {
  try {
    const current = await getSavedVocabulary();
    const updated = current.filter((w) => w.id !== id);
    await AsyncStorage.setItem(SAVED_VOCABULARY_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

export async function toggleWordMastered(id: string): Promise<boolean> {
  try {
    const current = await getSavedVocabulary();
    const updated = current.map((w) => {
      if (w.id === id) {
        const nextMastered = !w.mastered;
        return {
          ...w,
          mastered: nextMastered,
          status: nextMastered ? ('mastered' as const) : ('reviewing' as const),
        };
      }
      return w;
    });
    await AsyncStorage.setItem(SAVED_VOCABULARY_KEY, JSON.stringify(updated));
    const target = updated.find((w) => w.id === id);
    return !!target?.mastered;
  } catch {
    return false;
  }
}

export async function updateVocabularyWordSRS(updatedWord: SavedWordItem): Promise<boolean> {
  try {
    const current = await getSavedVocabulary();
    const existingIndex = current.findIndex((w) => w.id === updatedWord.id);
    let nextList: SavedWordItem[];
    if (existingIndex >= 0) {
      nextList = current.map((w) => (w.id === updatedWord.id ? updatedWord : w));
    } else {
      nextList = [updatedWord, ...current];
    }
    await AsyncStorage.setItem(SAVED_VOCABULARY_KEY, JSON.stringify(nextList));
    try {
      await incrementMissionProgress('review_vocab', 1);
    } catch {}
    return true;
  } catch {
    return false;
  }
}

export async function batchUpdateVocabularyWords(updatedWords: SavedWordItem[]): Promise<boolean> {
  try {
    const current = await getSavedVocabulary();
    const map = new Map<string, SavedWordItem>();
    current.forEach((w) => map.set(w.id, w));
    updatedWords.forEach((w) => map.set(w.id, w));
    const nextList = Array.from(map.values());
    await AsyncStorage.setItem(SAVED_VOCABULARY_KEY, JSON.stringify(nextList));
    try {
      await incrementMissionProgress('review_vocab', updatedWords.length);
    } catch {}
    return true;
  } catch {
    return false;
  }
}

export async function seedStarterVocabulary(): Promise<SavedWordItem[]> {
  try {
    const { STARTER_QURAN_VOCABULARY } = await import('./srsEngine');
    const current = await getSavedVocabulary();
    const currentIds = new Set(current.map((w) => w.id));
    const toAdd = STARTER_QURAN_VOCABULARY.filter((w) => !currentIds.has(w.id));
    const combined = [...current, ...toAdd];
    await AsyncStorage.setItem(SAVED_VOCABULARY_KEY, JSON.stringify(combined));
    return combined;
  } catch {
    return [];
  }
}

// ----------------- Memorization (Hifz & Muraja'ah) -----------------

export async function getHifzRecords(): Promise<Record<string, VerseHifzRecord>> {
  try {
    const raw = await AsyncStorage.getItem(HIFZ_RECORDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function saveVerseHifzAssessment(
  surah: number,
  ayah: number,
  strength: HifzStrength
): Promise<VerseHifzRecord> {
  const key = `${surah}:${ayah}`;
  const allRecords = await getHifzRecords();
  const existing = allRecords[key];

  const testCount = (existing?.testCount || 0) + 1;
  const isFluent = strength === 'fluent';
  const fluentCount = (existing?.fluentCount || 0) + (isFluent ? 1 : 0);
  const consecutiveFluent = isFluent ? (existing?.consecutiveFluent || 0) + 1 : 0;

  const record: VerseHifzRecord = {
    id: key,
    surah,
    ayah,
    strength,
    lastTested: Date.now(),
    testCount,
    fluentCount,
    consecutiveFluent,
  };

  allRecords[key] = record;
  await AsyncStorage.setItem(HIFZ_RECORDS_KEY, JSON.stringify(allRecords));
  return record;
}

export async function getMurajahReminders(): Promise<MurajahReminder[]> {
  try {
    const raw = await AsyncStorage.getItem(MURAJAH_REMINDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveMurajahReminder(reminder: MurajahReminder): Promise<void> {
  try {
    const reminders = await getMurajahReminders();
    const existingIndex = reminders.findIndex((r) => r.id === reminder.id);
    let nextList: MurajahReminder[];
    if (existingIndex >= 0) {
      nextList = reminders.map((r) => (r.id === reminder.id ? reminder : r));
    } else {
      nextList = [reminder, ...reminders];
    }
    await AsyncStorage.setItem(MURAJAH_REMINDERS_KEY, JSON.stringify(nextList));
  } catch {}
}

export async function removeMurajahReminder(id: string): Promise<void> {
  try {
    const reminders = await getMurajahReminders();
    const nextList = reminders.filter((r) => r.id !== id);
    await AsyncStorage.setItem(MURAJAH_REMINDERS_KEY, JSON.stringify(nextList));
  } catch {}
}

export async function markMurajahCompleted(id: string): Promise<void> {
  try {
    const reminders = await getMurajahReminders();
    const now = Date.now();
    const nextList = reminders.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          lastReviewedDate: now,
          nextReviewDate: now + (r.frequencyDays || 1) * 24 * 60 * 60 * 1000,
        };
      }
      return r;
    });
    await AsyncStorage.setItem(MURAJAH_REMINDERS_KEY, JSON.stringify(nextList));
  } catch {}
}

// ----------------- Daily Learning Missions -----------------

export interface RawDailyMissionsStore {
  read_verses?: number;
  learn_words?: number;
  grammar_exercise?: number;
  review_vocab?: number;
}

export async function getDailyMissions(dateStr?: string): Promise<DailyMissionsState> {
  const targetDate = dateStr || getTodayDateStr();
  const storageKey = `${DAILY_MISSIONS_KEY_PREFIX}${targetDate}`;

  let rawData: RawDailyMissionsStore = {};
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (raw) rawData = JSON.parse(raw);
  } catch {}

  // Sync verses read from history
  const history = await getActivityHistory();
  const todayHistory = history[targetDate];
  const versesRead = Math.max(rawData.read_verses || 0, todayHistory?.verses || 0);

  // Default target for verses is 5 or user's daily goal
  const dailyGoal = await getDailyGoal();
  const verseTarget = Math.max(5, dailyGoal);

  // Check saved words or deck to get context for reviews
  const savedVocab = await getSavedVocabulary();
  const now = Date.now();
  const dueCount = savedVocab.filter((w) => (w.nextReviewDate || 0) <= now).length;
  const reviewTarget = Math.min(5, Math.max(1, dueCount || 5));

  const wordsLearned = rawData.learn_words || 0;
  const grammarExercise = rawData.grammar_exercise || 0;
  const reviewsDone = rawData.review_vocab || 0;

  const missions: DailyMissionItem[] = [
    {
      id: 'read_verses',
      title: `Read ${verseTarget} Verses`,
      subtitle: 'Recitation & Istiqamah',
      category: 'worship',
      target: verseTarget,
      current: versesRead,
      completed: versesRead >= verseTarget,
      unit: 'verses',
      icon: 'book-outline',
      actionLabel: 'Recite',
      route: '/(tabs)/reading',
    },
    {
      id: 'learn_words',
      title: 'Learn 3 Words',
      subtitle: 'Quranic Vocabulary',
      category: 'learning',
      target: 3,
      current: wordsLearned,
      completed: wordsLearned >= 3,
      unit: 'words',
      icon: 'bulb-outline',
      actionLabel: 'Explore',
      route: '/(tabs)/saved',
    },
    {
      id: 'grammar_exercise',
      title: '1 Grammar Exercise',
      subtitle: 'Language & Structure',
      category: 'learning',
      target: 1,
      current: grammarExercise,
      completed: grammarExercise >= 1,
      unit: 'exercise',
      icon: 'school-outline',
      actionLabel: 'Practice',
    },
    {
      id: 'review_vocab',
      title: 'Review Vocabulary',
      subtitle: dueCount > 0 ? `${dueCount} cards due for revision` : 'Daily Spaced Repetition',
      category: 'learning',
      target: reviewTarget,
      current: reviewsDone,
      completed: reviewsDone >= reviewTarget,
      unit: 'reviews',
      icon: 'sync-outline',
      actionLabel: 'Review',
      route: '/trainer',
    },
  ];

  const completedCount = missions.filter((m) => m.completed).length;
  const allCompleted = completedCount === missions.length;

  return {
    date: targetDate,
    missions,
    allCompleted,
    completedCount,
    totalCount: missions.length,
  };
}

export async function incrementMissionProgress(
  id: DailyMissionId,
  amount: number = 1,
  dateStr?: string
): Promise<DailyMissionsState> {
  const targetDate = dateStr || getTodayDateStr();
  const storageKey = `${DAILY_MISSIONS_KEY_PREFIX}${targetDate}`;

  let currentRaw: RawDailyMissionsStore = {};
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (raw) currentRaw = JSON.parse(raw);
  } catch {}

  const currentVal = currentRaw[id] || 0;
  currentRaw[id] = currentVal + amount;

  try {
    await AsyncStorage.setItem(storageKey, JSON.stringify(currentRaw));
  } catch {}

  return getDailyMissions(targetDate);
}

export async function setMissionProgress(
  id: DailyMissionId,
  value: number,
  dateStr?: string
): Promise<DailyMissionsState> {
  const targetDate = dateStr || getTodayDateStr();
  const storageKey = `${DAILY_MISSIONS_KEY_PREFIX}${targetDate}`;

  let currentRaw: RawDailyMissionsStore = {};
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (raw) currentRaw = JSON.parse(raw);
  } catch {}

  currentRaw[id] = value;

  try {
    await AsyncStorage.setItem(storageKey, JSON.stringify(currentRaw));
  } catch {}

  return getDailyMissions(targetDate);
}

export async function recordWordExplored(): Promise<DailyMissionsState> {
  return incrementMissionProgress('learn_words', 1);
}

// ----------------- Quranic Arabic Learning Paths -----------------

export async function getLearningPathProgress(): Promise<LearningPathProgress> {
  try {
    const raw = await AsyncStorage.getItem(LEARNING_PATH_PROGRESS_KEY);
    if (!raw) {
      return {
        completedLessonIds: [],
        lastUpdated: Date.now(),
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      completedLessonIds: [],
      lastUpdated: Date.now(),
    };
  }
}

export async function markLessonCompleted(
  courseId: string,
  lessonId: string
): Promise<LearningPathProgress> {
  try {
    const current = await getLearningPathProgress();
    const isAlreadyCompleted = current.completedLessonIds.includes(lessonId);
    const updatedIds = isAlreadyCompleted
      ? current.completedLessonIds
      : [...current.completedLessonIds, lessonId];

    const updated: LearningPathProgress = {
      completedLessonIds: updatedIds,
      lastActiveCourseId: courseId,
      lastActiveLessonId: lessonId,
      lastUpdated: Date.now(),
    };

    await AsyncStorage.setItem(LEARNING_PATH_PROGRESS_KEY, JSON.stringify(updated));

    // Also count toward daily learning mission
    try {
      await incrementMissionProgress('grammar_exercise', 1);
    } catch {}

    return updated;
  } catch {
    return {
      completedLessonIds: [lessonId],
      lastActiveCourseId: courseId,
      lastActiveLessonId: lessonId,
      lastUpdated: Date.now(),
    };
  }
}

export async function isLessonCompleted(lessonId: string): Promise<boolean> {
  const current = await getLearningPathProgress();
  return current.completedLessonIds.includes(lessonId);
}

// ----------------- Content Error Reporting Storage -----------------

export async function getContentErrorReports(): Promise<ContentErrorReport[]> {
  try {
    const raw = await AsyncStorage.getItem(CONTENT_ERROR_REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveContentErrorReport(
  reportData: Omit<ContentErrorReport, 'id' | 'timestamp' | 'status'>
): Promise<ContentErrorReport> {
  try {
    const existing = await getContentErrorReports();
    const newReport: ContentErrorReport = {
      ...reportData,
      id: `report_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      status: 'submitted',
    };

    const updated = [newReport, ...existing];
    await AsyncStorage.setItem(CONTENT_ERROR_REPORTS_KEY, JSON.stringify(updated));
    return newReport;
  } catch {
    return {
      ...reportData,
      id: `report_${Date.now()}`,
      timestamp: Date.now(),
      status: 'submitted',
    };
  }
}

export async function clearContentErrorReports(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CONTENT_ERROR_REPORTS_KEY);
  } catch {}
}
