export interface DailyWordItem {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  rootAr: string;
  rootMeaning: string;
  rootCount: number;
  surah: number;
  ayah: number;
  wordIndex: number;
  ayahSnippet: string;
  surahName: string;
  theme: string;
}

export interface BlessedSurahItem {
  id: string;
  title: string;
  arabicTitle: string;
  surahNumber: number;
  targetAyah?: number;
  badge: string;
  virtue: string;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

export const DAILY_WORDS: DailyWordItem[] = [
  {
    id: 'word-1',
    arabic: 'ٱلرَّحْمَٰنُ',
    transliteration: 'Al-Raḥmān',
    english: 'The Most Merciful',
    rootAr: 'ر ح م',
    rootMeaning: 'abundant grace, loving mercy, tender compassion',
    rootCount: 339,
    surah: 1,
    ayah: 3,
    wordIndex: 0,
    ayahSnippet: 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ',
    surahName: 'Al-Fatiha',
    theme: 'Divine Compassion',
  },
  {
    id: 'word-2',
    arabic: 'ٱلْحِكْمَةَ',
    transliteration: 'Al-Ḥikmah',
    english: 'The Wisdom',
    rootAr: 'ح ك م',
    rootMeaning: 'sound judgment, preventing ignorance, justice',
    rootCount: 210,
    surah: 2,
    ayah: 269,
    wordIndex: 1,
    ayahSnippet: 'يُؤْتِى ٱلْحِكْمَةَ مَن يَشَآءُ',
    surahName: 'Al-Baqarah',
    theme: 'Spiritual Insight',
  },
  {
    id: 'word-3',
    arabic: 'ٱلتَّقْوَىٰ',
    transliteration: 'Al-Taqwā',
    english: 'God-Consciousness',
    rootAr: 'و ق ي',
    rootMeaning: 'protection, shield, shielding oneself from harm',
    rootCount: 258,
    surah: 2,
    ayah: 197,
    wordIndex: 24,
    ayahSnippet: 'وَتَزَوَّدُوا۟ فَإِنَّ خَيْرَ ٱلزَّادِ ٱلتَّقْوَىٰ',
    surahName: 'Al-Baqarah',
    theme: 'Mindfulness & Piety',
  },
  {
    id: 'word-4',
    arabic: 'ٱلصَّبْرِ',
    transliteration: 'Al-Ṣabr',
    english: 'Patience & Fortitude',
    rootAr: 'ص ب ر',
    rootMeaning: 'restraint, steadfast perseverance, endurance',
    rootCount: 103,
    surah: 2,
    ayah: 153,
    wordIndex: 4,
    ayahSnippet: 'ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ',
    surahName: 'Al-Baqarah',
    theme: 'Inner Strength',
  },
  {
    id: 'word-5',
    arabic: 'ٱلْفُرْقَانَ',
    transliteration: 'Al-Furqān',
    english: 'The Criterion',
    rootAr: 'ف ر ق',
    rootMeaning: 'separation, distinguishing between right and truth',
    rootCount: 72,
    surah: 25,
    ayah: 1,
    wordIndex: 4,
    ayahSnippet: 'تَبَارَكَ ٱلَّذِى نَزَّلَ ٱلْفُرْقَانَ عَلَىٰ عَبْدِهِۦ',
    surahName: 'Al-Furqan',
    theme: 'Guidance & Discernment',
  },
  {
    id: 'word-6',
    arabic: 'ٱلْيَقِينُ',
    transliteration: 'Al-Yaqīn',
    english: 'The Certainty',
    rootAr: 'ي ق ن',
    rootMeaning: 'firm unwavering knowledge, absolute assurance',
    rootCount: 28,
    surah: 15,
    ayah: 99,
    wordIndex: 4,
    ayahSnippet: 'وَٱعْبُدْ رَبَّكَ حَتَّىٰ يَأْتِيَكَ ٱلْيَقِينُ',
    surahName: 'Al-Hijr',
    theme: 'Steadfast Faith',
  },
  {
    id: 'word-7',
    arabic: 'ٱلنُّورُ',
    transliteration: 'An-Nūr',
    english: 'The Light',
    rootAr: 'ن و ر',
    rootMeaning: 'radiance, clarity, enlightenment, divine guide',
    rootCount: 194,
    surah: 24,
    ayah: 35,
    wordIndex: 0,
    ayahSnippet: 'ٱللَّهُ نُورُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ',
    surahName: 'An-Nur',
    theme: 'Divine Illumination',
  },
  {
    id: 'word-8',
    arabic: 'سَلَٰمٌ',
    transliteration: 'Salām',
    english: 'Peace & Serenity',
    rootAr: 'س ل م',
    rootMeaning: 'peace, safety, sound wholeness, salvation',
    rootCount: 140,
    surah: 97,
    ayah: 5,
    wordIndex: 0,
    ayahSnippet: 'سَلَٰمٌ هِىَ حَتَّىٰ مَطْلَعِ ٱلْفَجْرِ',
    surahName: 'Al-Qadr',
    theme: 'Peace & Wholeness',
  },
];

export function getDailyWord(): DailyWordItem {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const index = Math.abs(dayOfYear) % DAILY_WORDS.length;
  return DAILY_WORDS[index];
}

export function getNextDailyWord(currentId: string): DailyWordItem {
  const currentIndex = DAILY_WORDS.findIndex((w) => w.id === currentId);
  const nextIndex = (currentIndex + 1) % DAILY_WORDS.length;
  return DAILY_WORDS[nextIndex];
}

export const BLESSED_SURAHS: BlessedSurahItem[] = [
  {
    id: 'mulk',
    title: 'Surah Al-Mulk',
    arabicTitle: 'سُورَةُ الْمُلْكِ',
    surahNumber: 67,
    badge: 'Night Sunnah',
    virtue: 'Recited before sleep as a protective shield and intercessor.',
    accentColor: '#7C3AED',
    bgColor: '#FAF5FF',
    borderColor: '#E9D5FF',
    icon: 'moon',
  },
  {
    id: 'kahf',
    title: 'Surah Al-Kahf',
    arabicTitle: 'سُورَةُ الْكَهْفِ',
    surahNumber: 18,
    badge: 'Friday Blessing',
    virtue: 'Brings celestial light illuminating the path between Fridays.',
    accentColor: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    icon: 'sunny',
  },
  {
    id: 'kursi',
    title: 'Ayat al-Kursi',
    arabicTitle: 'آيَةُ الْكُرْسِيِّ',
    surahNumber: 2,
    targetAyah: 255,
    badge: 'Greatest Ayah',
    virtue: 'The supreme verse of divine sovereignty and daily protection.',
    accentColor: '#059669',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    icon: 'shield-checkmark',
  },
  {
    id: 'yasin',
    title: 'Surah Ya-Sin',
    arabicTitle: 'سُورَةُ يٰسٓ',
    surahNumber: 36,
    badge: 'Heart of Quran',
    virtue: 'Revered as the radiant heart of the Holy Book bringing peace.',
    accentColor: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    icon: 'heart',
  },
  {
    id: 'rahman',
    title: 'Surah Ar-Rahman',
    arabicTitle: 'سُورَةُ الرَّحْمَٰنِ',
    surahNumber: 55,
    badge: 'Divine Favors',
    virtue: 'The bride of the Quran celebrating Allah\'s countless blessings.',
    accentColor: '#DB2777',
    bgColor: '#FDF2F8',
    borderColor: '#FBCFE8',
    icon: 'sparkles',
  },
  {
    id: 'ikhlas',
    title: 'Surah Al-Ikhlas',
    arabicTitle: 'سُورَةُ الْإِخْلَاصِ',
    surahNumber: 112,
    badge: '1/3 of Quran',
    virtue: 'Purity of Monotheism, equivalent to reciting one-third of the Quran.',
    accentColor: '#6D28D9',
    bgColor: '#FAF5FF',
    borderColor: '#E9D5FF',
    icon: 'star',
  },
];
