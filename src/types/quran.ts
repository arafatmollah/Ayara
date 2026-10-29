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
  rootId?: string | null;
  rootAr?: string | null;
  rootMeaning?: string | null;
  pos?: string;
  roles?: string[];
  grammarCase?: string;
  grammarTopicId?: string;
}

export interface WordOccurrenceRef {
  surah: number;
  ayah: number;
  arabic: string;
  transliteration: string;
  english: string;
  surahName?: string;
}

export interface WordLearningDetails {
  arabic: string;
  transliteration: string;
  english: string;
  surah: number;
  ayah: number;
  wordIndex: number;
  surahName: string;
  surahNameAr: string;
  audioUrl?: string;
  root: {
    id: string;
    arabic: string;
    meaning: string;
    count: number;
    derivatives: { ar: string; count: number }[];
    occurrences: WordOccurrenceRef[];
  } | null;
  grammar: {
    pos: string;
    roles: string[];
    grammarCase?: string;
    topic?: {
      id: string;
      title: string;
      feature: string;
      summary: string;
      points: string[];
    };
  };
  occurrences: {
    count: number;
    refs: WordOccurrenceRef[];
  };
}

export type SRSRating = 1 | 2 | 3 | 4; // 1: Again, 2: Hard, 3: Good, 4: Easy
export type SRSStatus = 'learning' | 'reviewing' | 'mastered' | 'weak';

export interface SavedWordItem {
  id: string; // `${surah}:${ayah}:${wordIndex}`
  arabic: string;
  transliteration: string;
  english: string;
  rootAr?: string;
  rootMeaning?: string;
  grammarRole?: string;
  surah: number;
  ayah: number;
  surahName: string;
  surahNameAr?: string;
  timestamp: number;
  mastered?: boolean;

  // Spaced-Repetition System (SM-2 SRS)
  repetition?: number; // consecutive correct reviews
  interval?: number; // review interval in days
  easeFactor?: number; // SM-2 ease factor (default 2.5)
  nextReviewDate?: number; // timestamp ms when due
  lastReviewedDate?: number; // timestamp ms of last review
  reviewCount?: number;
  correctCount?: number;
  incorrectCount?: number;
  accuracy?: number; // percentage 0-100
  status?: SRSStatus;
}

export interface VocabularyDeckStats {
  totalWords: number;
  dueReviewsCount: number;
  masteredCount: number;
  weakCount: number;
  learningCount: number;
  overallAccuracy: number; // percentage 0-100
  reviewsDoneToday: number;
}

export type QuizQuestionType = 'ar-to-en' | 'en-to-ar' | 'mcq-ar-to-en' | 'mcq-en-to-ar';

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  word: SavedWordItem;
  prompt: string;
  promptSub?: string;
  correctAnswer: string;
  correctAnswerSub?: string;
  options?: string[]; // 4 options for MCQ
  optionsSub?: string[];
}

export interface QuizSessionResult {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  xpEarned: number;
  reviewedWordIds: string[];
}

export type TranslationLanguage = 'english' | 'bangla' | 'both';

export interface AyahData {
  surah: number;
  ayah: number;
  arabic: string;
  english: string;
  bangla?: string;
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
  translationLanguage?: TranslationLanguage;
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

// ----------------- Memorization Mode (Hifz & Muraja'ah) -----------------

export type HifzStrength = 'fluent' | 'hesitant' | 'struggled' | 'unmemorized';
export type MaskingMode = 'hidden' | 'prompt' | 'visible'; // hidden (blank), prompt (first 2 words), visible (revealed)

export interface VerseHifzRecord {
  id: string; // `${surah}:${ayah}`
  surah: number;
  ayah: number;
  strength: HifzStrength;
  lastTested: number; // timestamp
  testCount: number;
  fluentCount: number;
  consecutiveFluent: number;
}

export interface MurajahReminder {
  id: string; // e.g. `murajah_${surah}_${startAyah}_${endAyah}`
  surah: number;
  surahName: string;
  startAyah: number;
  endAyah: number;
  frequencyDays: number; // 1 (daily), 3 (every 3 days), 7 (weekly)
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  lastReviewedDate?: number;
  nextReviewDate: number; // timestamp
  enabled: boolean;
}

export interface MemorizationSessionConfig {
  surah: number;
  startAyah: number;
  endAyah: number;
  reciter: string;
  repeatVerseCount: number; // 1, 3, 5, 7, 10, or -1 (infinite loop)
  repeatRangeCount: number; // 1, 2, 3, 5
  maskingMode: MaskingMode;
}

// ----------------- Daily Learning Missions -----------------

export type DailyMissionId = 'read_verses' | 'learn_words' | 'grammar_exercise' | 'review_vocab';

export interface DailyMissionItem {
  id: DailyMissionId;
  title: string;
  subtitle: string;
  category: 'worship' | 'learning';
  target: number;
  current: number;
  completed: boolean;
  unit: string;
  icon: string;
  actionLabel: string;
  route?: string;
}

export interface DailyMissionsState {
  date: string; // YYYY-MM-DD
  missions: DailyMissionItem[];
  allCompleted: boolean;
  completedCount: number;
  totalCount: number;
}

export interface GrammarExerciseQuestion {
  id: string;
  question: string;
  arabicSnippet?: string;
  transliteration?: string;
  translation?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface DailyGrammarExercise {
  topicId: string;
  topicTitle: string;
  topicFeature: string;
  summary: string;
  points: string[];
  questions: GrammarExerciseQuestion[];
}

// ----------------- Quranic Arabic Learning Paths -----------------

export type CourseLevel = 'beginner' | 'elementary' | 'intermediate';

export interface LessonVerseDemonstration {
  arabic: string;
  transliteration: string;
  translation: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  highlightWords?: string[];
  note: string;
}

export interface LessonQuizQuestion {
  id: string;
  question: string;
  arabicSnippet?: string;
  transliteration?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface LessonVocabularyItem {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  rootAr?: string;
  surah: number;
  ayah: number;
  surahName: string;
}

export interface LearningLesson {
  id: string;
  courseId: string;
  order: number;
  title: string;
  titleAr: string;
  summary: string;
  conceptPoints: string[];
  demonstrations: LessonVerseDemonstration[];
  quizQuestions: LessonQuizQuestion[];
  reviewTakeaways: string[];
  vocabularyToSave: LessonVocabularyItem[];
}

export interface LearningCourse {
  id: string;
  level: CourseLevel;
  levelLabel: string;
  order: number;
  title: string;
  titleAr: string;
  description: string;
  icon: string;
  lessons: LearningLesson[];
}

export interface LearningPathProgress {
  completedLessonIds: string[];
  lastActiveLessonId?: string;
  lastActiveCourseId?: string;
  lastUpdated: number;
}

// ----------------- Quran Accuracy, Typography & Sources -----------------

export type ContentErrorCategory =
  | 'arabic_text'
  | 'translation'
  | 'transliteration'
  | 'morphology_root'
  | 'audio_recitation'
  | 'hadith_virtue'
  | 'stopping_sign_waqf'
  | 'other';

export interface ContentErrorReport {
  id: string;
  timestamp: number;
  surah: number;
  ayah: number;
  surahName?: string;
  wordIndex?: number;
  wordText?: string;
  category: ContentErrorCategory;
  arabicSnippet?: string;
  translationSnippet?: string;
  description: string;
  suggestedCorrection?: string;
  scholarlyReference?: string;
  userEmail?: string;
  status: 'submitted' | 'reviewed' | 'resolved';
}

export interface SajdahAyahInfo {
  surah: number;
  ayah: number;
  surahName: string;
  surahNameAr: string;
  juz: number;
  ruku: number;
  ruling: string; // e.g. "Sunnah Mu'akkadah (Majority) / Wajib (Hanafi)"
  arabicPhrase: string; // The phrase containing the prostration command
  duaAr: string;
  duaTr: string;
  duaEn: string;
  hadithRef: string;
}

export interface WaqfSignInfo {
  id: string;
  sign: string;
  symbolChar: string;
  nameAr: string;
  nameEn: string;
  ruleTitle: string;
  ruleDescription: string;
  priority: 'compulsory' | 'forbidden' | 'preferred_stop' | 'preferred_continue' | 'permissible' | 'paired' | 'pause';
  exampleAyah?: string;
  exampleRef?: string;
}

export interface SourceProvenanceItem {
  layer: string;
  title: string;
  scholarOrOrganization: string;
  editionOrStandard: string;
  description: string;
  verificationMethod: string;
  licenseOrStatus: string;
}


