import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BookmarkItem,
  DailyProgress,
  DayActivity,
  KhatmahProgress,
  LastReadItem,
  PersonalStats,
  ReaderSettings,
  TimeSegment,
  UserProfile,
} from '../types/quran';

const USER_PROFILE_KEY = '@quran_user_profile';
const BOOKMARKS_KEY = '@quran_bookmarks';
const LAST_READ_KEY = '@quran_last_read';
const RECENT_HISTORY_KEY = '@quran_recent_history';
const UNIQUE_AYAHS_KEY = '@quran_read_ayahs';
const SETTINGS_KEY = '@quran_reader_settings';
const GOAL_KEY = '@quran_daily_goal';
const HISTORY_KEY = '@quran_activity_history'; // Record<dateStr, { verses: number, hasanat: number, timeSeconds?: number }>

export interface DayHistoryRecord {
  verses: number;
  hasanat: number;
  timeSeconds?: number;
}

export const DEFAULT_SETTINGS: ReaderSettings = {
  arabicFontSize: 28,
  showTranslation: true,
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
