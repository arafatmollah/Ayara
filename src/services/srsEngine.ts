import { SavedWordItem, SRSRating, VocabularyDeckStats, QuizQuestion } from '../types/quran';

// Curated high-frequency foundational Quranic words for starter decks
export const STARTER_QURAN_VOCABULARY: SavedWordItem[] = [
  {
    id: '1:1:1',
    arabic: 'ٱللَّهِ',
    transliteration: 'Allāh',
    english: 'Allah (The One God)',
    rootAr: 'أ ل ه',
    rootMeaning: 'god, to worship, deity',
    surah: 1,
    ayah: 1,
    surahName: 'Al-Fatihah',
    surahNameAr: 'الفاتحة',
    timestamp: Date.now() - 86400000 * 2,
    repetition: 0,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 3600000,
    status: 'learning',
  },
  {
    id: '1:1:2',
    arabic: 'ٱلرَّحْمَٰنِ',
    transliteration: 'Ar-Raḥmān',
    english: 'The Most Merciful',
    rootAr: 'ر ح م',
    rootMeaning: 'womb, mercy, compassion',
    surah: 1,
    ayah: 1,
    surahName: 'Al-Fatihah',
    surahNameAr: 'الفاتحة',
    timestamp: Date.now() - 86400000 * 2,
    repetition: 0,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 3600000,
    status: 'learning',
  },
  {
    id: '1:1:3',
    arabic: 'ٱلرَّحِيمِ',
    transliteration: 'Ar-Raḥīm',
    english: 'The Especially Merciful',
    rootAr: 'ر ح م',
    rootMeaning: 'womb, mercy, compassion',
    surah: 1,
    ayah: 1,
    surahName: 'Al-Fatihah',
    surahNameAr: 'الفاتحة',
    timestamp: Date.now() - 86400000 * 2,
    repetition: 0,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 3600000,
    status: 'learning',
  },
  {
    id: '1:2:1',
    arabic: 'رَبِّ',
    transliteration: 'Rabb',
    english: 'Lord, Sustainer, Master',
    rootAr: 'ر ب ب',
    rootMeaning: 'to nurture, foster, lord',
    surah: 1,
    ayah: 2,
    surahName: 'Al-Fatihah',
    surahNameAr: 'الفاتحة',
    timestamp: Date.now() - 86400000 * 2,
    repetition: 0,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 3600000,
    status: 'learning',
  },
  {
    id: '1:2:2',
    arabic: 'ٱلْعَٰلَمِينَ',
    transliteration: 'Al-ʿĀlamīn',
    english: 'The Worlds / All Creation',
    rootAr: 'ع ل م',
    rootMeaning: 'to know, universe, realms',
    surah: 1,
    ayah: 2,
    surahName: 'Al-Fatihah',
    surahNameAr: 'الفاتحة',
    timestamp: Date.now() - 86400000 * 2,
    repetition: 0,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 3600000,
    status: 'learning',
  },
  {
    id: '1:6:1',
    arabic: 'ٱلصِّرَٰطَ',
    transliteration: 'Aṣ-Ṣirāṭ',
    english: 'The Path / The Way',
    rootAr: 'ص ر ط',
    rootMeaning: 'road, straight thoroughfare',
    surah: 1,
    ayah: 6,
    surahName: 'Al-Fatihah',
    surahNameAr: 'الفاتحة',
    timestamp: Date.now() - 86400000 * 2,
    repetition: 0,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 3600000,
    status: 'learning',
  },
  {
    id: '1:6:2',
    arabic: 'ٱلْمُسْتَقِيمَ',
    transliteration: 'Al-Mustaqīm',
    english: 'The Straight / Upright',
    rootAr: 'ق و م',
    rootMeaning: 'to stand, upright, established',
    surah: 1,
    ayah: 6,
    surahName: 'Al-Fatihah',
    surahNameAr: 'الفاتحة',
    timestamp: Date.now() - 86400000 * 2,
    repetition: 0,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 3600000,
    status: 'learning',
  },
  {
    id: '2:2:1',
    arabic: 'ٱلْكِتَٰبُ',
    transliteration: 'Al-Kitāb',
    english: 'The Book / Scripture',
    rootAr: 'ك ت ب',
    rootMeaning: 'to write, record, decree',
    surah: 2,
    ayah: 2,
    surahName: 'Al-Baqarah',
    surahNameAr: 'البقرة',
    timestamp: Date.now() - 86400000,
    repetition: 0,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 3600000,
    status: 'learning',
  },
  {
    id: '2:2:3',
    arabic: 'هُدًى',
    transliteration: 'Hudan',
    english: 'Guidance',
    rootAr: 'ه د ي',
    rootMeaning: 'to guide, lead, direct',
    surah: 2,
    ayah: 2,
    surahName: 'Al-Baqarah',
    surahNameAr: 'البقرة',
    timestamp: Date.now() - 86400000,
    repetition: 0,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 3600000,
    status: 'learning',
  },
  {
    id: '2:2:5',
    arabic: 'لِّلْمُتَّقِينَ',
    transliteration: 'Lil-Muttaqīn',
    english: 'For the God-Conscious / Righteous',
    rootAr: 'و ق ي',
    rootMeaning: 'to guard, protect, shield',
    surah: 2,
    ayah: 2,
    surahName: 'Al-Baqarah',
    surahNameAr: 'البقرة',
    timestamp: Date.now() - 86400000,
    repetition: 0,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 3600000,
    status: 'learning',
  },
  {
    id: '2:3:2',
    arabic: 'بِٱلْغَيْبِ',
    transliteration: 'Bil-Ghayb',
    english: 'In the Unseen',
    rootAr: 'غ ي ب',
    rootMeaning: 'to be absent, hidden, concealed',
    surah: 2,
    ayah: 3,
    surahName: 'Al-Baqarah',
    surahNameAr: 'البقرة',
    timestamp: Date.now() - 86400000,
    repetition: 0,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 3600000,
    status: 'learning',
  },
  {
    id: '2:3:3',
    arabic: 'ٱلصَّلَوٰةَ',
    transliteration: 'Aṣ-Ṣalāh',
    english: 'The Prayer',
    rootAr: 'ص ل و',
    rootMeaning: 'to pray, bless, turn to',
    surah: 2,
    ayah: 3,
    surahName: 'Al-Baqarah',
    surahNameAr: 'البقرة',
    timestamp: Date.now() - 86400000,
    repetition: 0,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 3600000,
    status: 'learning',
  },
  {
    id: '2:5:5',
    arabic: 'ٱلْمُفْلِحُونَ',
    transliteration: 'Al-Mufliḥūn',
    english: 'The Successful Ones',
    rootAr: 'ف ل ح',
    rootMeaning: 'to succeed, prosper, thrive',
    surah: 2,
    ayah: 5,
    surahName: 'Al-Baqarah',
    surahNameAr: 'البقرة',
    timestamp: Date.now() - 86400000,
    repetition: 0,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 3600000,
    status: 'learning',
  },
  {
    id: '2:25:5',
    arabic: 'جَنَّٰتٍ',
    transliteration: 'Jannāt',
    english: 'Gardens of Paradise',
    rootAr: 'ج ن ن',
    rootMeaning: 'to conceal, lush garden, paradise',
    surah: 2,
    ayah: 25,
    surahName: 'Al-Baqarah',
    surahNameAr: 'البقرة',
    timestamp: Date.now() - 86400000,
    repetition: 0,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 3600000,
    status: 'learning',
  },
  {
    id: '2:257:9',
    arabic: 'ٱلنُّورِ',
    transliteration: 'An-Nūr',
    english: 'The Light',
    rootAr: 'ن و ر',
    rootMeaning: 'light, illumination, clarity',
    surah: 2,
    ayah: 257,
    surahName: 'Al-Baqarah',
    surahNameAr: 'البقرة',
    timestamp: Date.now() - 86400000,
    repetition: 0,
    interval: 1,
    easeFactor: 2.5,
    nextReviewDate: Date.now() - 3600000,
    status: 'learning',
  },
];

/**
 * SuperMemo SM-2 Spaced Repetition calculation
 * Rating:
 * 1: Again (Forgot, reset interval to 1 day)
 * 2: Hard (Struggled, interval slightly increases, ease drops)
 * 3: Good (Remembered with normal recall)
 * 4: Easy (Flawless, bonus interval boost)
 */
export function applySRSRating(word: SavedWordItem, rating: SRSRating): SavedWordItem {
  const currentRep = word.repetition ?? 0;
  let interval = word.interval ?? 1;
  let easeFactor = word.easeFactor ?? 2.5;
  const reviewCount = (word.reviewCount ?? 0) + 1;
  let correctCount = word.correctCount ?? 0;
  let incorrectCount = word.incorrectCount ?? 0;

  let nextRep: number;

  if (rating === 1) {
    // Again / Forgot
    nextRep = 0;
    interval = 1;
    incorrectCount += 1;
  } else if (rating === 2) {
    // Hard
    correctCount += 1;
    nextRep = Math.max(1, currentRep);
    interval = Math.max(1, Math.round(interval * 1.2));
  } else if (rating === 3) {
    // Good
    correctCount += 1;
    if (currentRep === 0) {
      interval = 1;
    } else if (currentRep === 1) {
      interval = 3;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    nextRep = currentRep + 1;
  } else {
    // Easy (rating === 4)
    correctCount += 1;
    if (currentRep === 0) {
      interval = 2;
    } else if (currentRep === 1) {
      interval = 5;
    } else {
      interval = Math.round(interval * easeFactor * 1.35);
    }
    nextRep = currentRep + 1;
  }

  // SM-2 Ease Factor calculation
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const q = rating + 1; // map 1..4 to 2..5
  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const now = Date.now();
  const nextReviewDate = now + interval * 24 * 60 * 60 * 1000;
  const accuracy = Math.round((correctCount / reviewCount) * 100);

  // Status determination
  let status: 'learning' | 'reviewing' | 'mastered' | 'weak';
  let isMastered = Boolean(word.mastered);

  if (nextRep >= 4 || interval >= 21) {
    status = 'mastered';
    isMastered = true;
  } else if (incorrectCount >= 2 && accuracy < 65) {
    status = 'weak';
    isMastered = false;
  } else if (nextRep > 0) {
    status = 'reviewing';
    isMastered = false;
  } else {
    status = 'learning';
    isMastered = false;
  }

  return {
    ...word,
    repetition: nextRep,
    interval,
    easeFactor: Number(easeFactor.toFixed(2)),
    nextReviewDate,
    lastReviewedDate: now,
    reviewCount,
    correctCount,
    incorrectCount,
    accuracy,
    status,
    mastered: isMastered,
  };
}

/**
 * Filter and sort due words
 */
export function getDueWords(words: SavedWordItem[]): SavedWordItem[] {
  const now = Date.now();
  const due = words.filter((w) => !w.nextReviewDate || w.nextReviewDate <= now);

  // Prioritize weak words first, then oldest overdue
  return due.sort((a, b) => {
    const aIsWeak = a.status === 'weak' ? 1 : 0;
    const bIsWeak = b.status === 'weak' ? 1 : 0;
    if (aIsWeak !== bIsWeak) return bIsWeak - aIsWeak;

    const aDue = a.nextReviewDate ?? 0;
    const bDue = b.nextReviewDate ?? 0;
    return aDue - bDue;
  });
}

/**
 * Filter weak words (words struggling with retention)
 */
export function getWeakWords(words: SavedWordItem[]): SavedWordItem[] {
  return words.filter((w) => {
    if (w.status === 'weak') return true;
    if ((w.incorrectCount ?? 0) >= 2 && (w.accuracy ?? 100) < 65) return true;
    return false;
  });
}

/**
 * Filter mastered words
 */
export function getMasteredWords(words: SavedWordItem[]): SavedWordItem[] {
  return words.filter((w) => w.mastered || w.status === 'mastered');
}

/**
 * Calculate overall deck statistics
 */
export function computeDeckStats(words: SavedWordItem[]): VocabularyDeckStats {
  const totalWords = words.length;
  const dueWords = getDueWords(words);
  const masteredWords = getMasteredWords(words);
  const weakWords = getWeakWords(words);

  const wordsWithReviews = words.filter((w) => (w.reviewCount ?? 0) > 0);
  let overallAccuracy = 0;
  if (wordsWithReviews.length > 0) {
    const totalAcc = wordsWithReviews.reduce((sum, w) => sum + (w.accuracy ?? 0), 0);
    overallAccuracy = Math.round(totalAcc / wordsWithReviews.length);
  }

  // Count reviews completed in the last 24 hours
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const reviewsDoneToday = words.filter(
    (w) => w.lastReviewedDate && w.lastReviewedDate >= oneDayAgo
  ).length;

  const learningCount = Math.max(0, totalWords - masteredWords.length - weakWords.length);

  return {
    totalWords,
    dueReviewsCount: dueWords.length,
    masteredCount: masteredWords.length,
    weakCount: weakWords.length,
    learningCount,
    overallAccuracy,
    reviewsDoneToday,
  };
}

/**
 * Shuffle array
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Pick 3 distractors for MCQ questions
 */
function pickDistractors(
  target: SavedWordItem,
  pool: SavedWordItem[],
  field: 'english' | 'arabic'
): string[] {
  const others = pool.filter((w) => w.id !== target.id && w[field] !== target[field]);
  const shuffled = shuffle(others);
  const picked: string[] = [];
  const seen = new Set<string>([target[field]]);

  for (const item of shuffled) {
    const val = item[field];
    if (!seen.has(val)) {
      seen.add(val);
      picked.push(val);
      if (picked.length === 3) break;
    }
  }

  // Fallback if pool is small
  const fallbackEnglish = ['The All-Knowing', 'The Creator', 'Praise', 'The Day of Judgment', 'The Believers'];
  const fallbackArabic = ['ٱلْخَٰلِقُ', 'ٱلْعَلِيمُ', 'ٱلْحَمْدُ', 'ٱلْمُؤْمِنُونَ', 'يَوْمِ ٱلدِّينِ'];

  const fallbackList = field === 'english' ? fallbackEnglish : fallbackArabic;
  for (const fb of fallbackList) {
    if (picked.length >= 3) break;
    if (!seen.has(fb)) {
      seen.add(fb);
      picked.push(fb);
    }
  }

  return picked.slice(0, 3);
}

export type TrainerMode = 'all' | 'flashcard-ar' | 'flashcard-en' | 'quiz-mcq';

/**
 * Generate spaced-repetition training questions
 */
export function generateTrainerQuestions(
  words: SavedWordItem[],
  mode: TrainerMode = 'all',
  limit: number = 10,
  globalPool: SavedWordItem[] = []
): QuizQuestion[] {
  if (words.length === 0) return [];

  const combinedPool = [...words, ...globalPool, ...STARTER_QURAN_VOCABULARY];
  const shuffledWords = shuffle(words).slice(0, limit);

  return shuffledWords.map((word, index) => {
    let questionType: 'ar-to-en' | 'en-to-ar' | 'mcq-ar-to-en' | 'mcq-en-to-ar';

    if (mode === 'flashcard-ar') {
      questionType = 'ar-to-en';
    } else if (mode === 'flashcard-en') {
      questionType = 'en-to-ar';
    } else if (mode === 'quiz-mcq') {
      questionType = index % 2 === 0 ? 'mcq-ar-to-en' : 'mcq-en-to-ar';
    } else {
      // 'all': intelligently cycle through all 4 question formats
      const types: ('ar-to-en' | 'en-to-ar' | 'mcq-ar-to-en' | 'mcq-en-to-ar')[] = [
        'ar-to-en',
        'mcq-ar-to-en',
        'en-to-ar',
        'mcq-en-to-ar',
      ];
      questionType = types[index % types.length];
    }

    if (questionType === 'ar-to-en') {
      return {
        id: `q_${word.id}_${index}`,
        type: 'ar-to-en',
        word,
        prompt: word.arabic,
        promptSub: word.transliteration,
        correctAnswer: word.english,
        correctAnswerSub: word.rootAr ? `Root: ${word.rootAr}` : undefined,
      };
    }

    if (questionType === 'en-to-ar') {
      return {
        id: `q_${word.id}_${index}`,
        type: 'en-to-ar',
        word,
        prompt: word.english,
        promptSub: `From ${word.surahName} (${word.surah}:${word.ayah})`,
        correctAnswer: word.arabic,
        correctAnswerSub: word.transliteration,
      };
    }

    if (questionType === 'mcq-ar-to-en') {
      const distractors = pickDistractors(word, combinedPool, 'english');
      const options = shuffle([word.english, ...distractors]);
      return {
        id: `q_${word.id}_${index}`,
        type: 'mcq-ar-to-en',
        word,
        prompt: word.arabic,
        promptSub: word.transliteration,
        correctAnswer: word.english,
        correctAnswerSub: word.rootAr ? `Root: ${word.rootAr}` : undefined,
        options,
      };
    }

    // mcq-en-to-ar
    const distractors = pickDistractors(word, combinedPool, 'arabic');
    const options = shuffle([word.arabic, ...distractors]);
    return {
      id: `q_${word.id}_${index}`,
      type: 'mcq-en-to-ar',
      word,
      prompt: word.english,
      promptSub: `From ${word.surahName} (${word.surah}:${word.ayah})`,
      correctAnswer: word.arabic,
      correctAnswerSub: word.transliteration,
      options,
    };
  });
}
