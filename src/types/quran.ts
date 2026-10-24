export type RevelationType = 'Meccan' | 'Medinan';

export interface SurahMeta {
  n: number;
  ar: string;
  en: string;
  meaning: string;
  ayahs: number;
  type: RevelationType;
  firstGlobal: number;
  bismillah: boolean;
}

export interface JuzReference {
  s: number;
  a: number;
}

export interface JuzMeta {
  n: number;
  name: string;
  nameAr: string;
  nameRef: string;
  start: JuzReference;
  end: JuzReference;
}

export type WordTuple = [arabic: string, transliteration: string, english: string];

export interface WordData {
  arabic: string;
  transliteration: string;
  english: string;
}

export interface AyahData {
  surah: number;
  ayah: number;
  arabic: string;
  english: string;
  transliteration: string;
  words?: WordData[];
}

export interface BookmarkItem {
  id: string; // `${surah}:${ayah}`
  surah: number;
  ayah: number;
  surahName: string;
  surahNameAr: string;
  arabicSnippet: string;
  translationSnippet: string;
  timestamp: number;
}

export interface LastReadItem {
  surah: number;
  ayah: number;
  surahName: string;
  surahNameAr: string;
  timestamp: number;
}

export interface ReaderSettings {
  arabicFontSize: number;
  showTranslation: boolean;
  showTransliteration: boolean;
  showWbw: boolean;
  reciter: string;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD
  versesRead: number;
  hasanat: number;
  dailyGoal: number;
  streakDays: number;
}

export interface DayActivity {
  dayLetter: string; // 'M', 'T', 'W', 'T', 'F', 'S', 'S'
  dayNumber: number;
  dateStr: string;
  isToday: boolean;
  isCompleted: boolean;
  count: number;
}

export type TimeSegment = 'Today' | 'Week' | 'All';

export interface PersonalStats {
  hasanat: number;
  verses: number;
  timeMinutes: number;
  streak: number;
}

export interface UserProfile {
  name: string;
  joinedAt: number;
  avatarEmoji?: string;
}

export interface KhatmahProgress {
  uniqueVersesCount: number;
  totalQuranVerses: number; // 6236
  percent: number;
  completedSurahsCount: number;
}
