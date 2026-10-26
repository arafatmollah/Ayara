export interface DailyReflectionItem {
  id: string;
  theme: string;
  surah: number;
  ayah: number;
  surahName: string;
  arabic: string;
  translation: string;
  contemplation: string;
  translationSource?: string;
}

export const REFLECTIONS_DATA: DailyReflectionItem[] = [
  {
    id: 'ref-1',
    theme: 'Gratitude & Remembrance',
    surah: 2,
    ayah: 152,
    surahName: 'Al-Baqarah',
    arabic: 'فَٱذْكُرُونِىٓ أَذْكُرْكُمْ وَٱشْكُرُوا۟ لِى وَلَا تَكْفُرُونِ',
    translation: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
    contemplation: 'Pause and acknowledge three hidden blessings today. Gratitude transforms what we have into enough.',
  },
  {
    id: 'ref-2',
    theme: 'Hope & Ease',
    surah: 94,
    ayah: 5,
    surahName: 'Ash-Sharh',
    arabic: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا • إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
    translation: 'For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.',
    contemplation: 'Ease is not promised after difficulty, but alongside it. Look for the mercies embedded within your trials.',
  },
  {
    id: 'ref-3',
    theme: 'Inner Peace & Hearts',
    surah: 13,
    ayah: 28,
    surahName: 'Ar-Ra’d',
    arabic: 'أَلَا بِذِكْرِ ٱللَّهِ تَطْمَئِنُّ ٱلْقُلُوبُ',
    translation: 'Unquestionably, by the remembrance of Allah hearts are assured.',
    contemplation: 'When your thoughts feel overwhelmed, let the rhythm of the sacred verses return stillness to your heart.',
  },
  {
    id: 'ref-4',
    theme: 'Divine Closeness',
    surah: 2,
    ayah: 186,
    surahName: 'Al-Baqarah',
    arabic: 'وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ ٱلدَّاعِ إِذَا دَعَانِ',
    translation: 'And when My servants ask you concerning Me, indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.',
    contemplation: 'No whisper is ever lost. Turn your unspoken worries into quiet du’a.',
  },
  {
    id: 'ref-5',
    theme: 'Patience & Support',
    surah: 2,
    ayah: 153,
    surahName: 'Al-Baqarah',
    arabic: 'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ',
    translation: 'O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.',
    contemplation: 'Patience is not passive waiting; it is active endurance with a peaceful soul.',
  },
  {
    id: 'ref-6',
    theme: 'Boundless Mercy',
    surah: 39,
    ayah: 53,
    surahName: 'Az-Zumar',
    arabic: 'قُلْ يَٰعِبَادِىَ ٱلَّذِينَ أَسْرَفُوا۟ عَلَىٰٓ أَنفُسِهِمْ لَا تَقْنَطُوا۟ مِن رَّحْمَةِ ٱللَّهِ ۚ إِنَّ ٱللَّهَ يَغْفِرُ ٱلذُّنُوبَ جَمِيعًا',
    translation: 'Say, "O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins."',
    contemplation: 'No matter how far you feel you have wandered, the door of return is always wide open.',
  },
  {
    id: 'ref-7',
    theme: 'Trust & Reliance',
    surah: 65,
    ayah: 3,
    surahName: 'At-Talaq',
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥٓ',
    translation: 'And whoever relies upon Allah - then He is sufficient for him.',
    contemplation: 'Do what is in your power with excellence, then release the burden of the outcome with trust.',
  },
  {
    id: 'ref-8',
    theme: 'Gentleness & Kindness',
    surah: 3,
    ayah: 159,
    surahName: 'Ali ‘Imran',
    arabic: 'فَبِمَا رَحْمَةٍ مِّنَ ٱللَّهِ لِنتَ لَهُمْ ۖ وَلَوْ كُنتَ فَظًّا غَلِيظَ ٱلْقَلْبِ لَٱنفَضُّوا۟ مِنْ حَوْلِكَ',
    translation: 'So by mercy from Allah, you were lenient with them. And if you had been rude and harsh in heart, they would have disbanded from about you.',
    contemplation: 'Approach people with warmth and understanding; softness is a reflection of divine mercy.',
  },
  {
    id: 'ref-9',
    theme: 'Divine Beauty & Majesty',
    surah: 59,
    ayah: 24,
    surahName: 'Al-Hashr',
    arabic: 'هُوَ ٱللَّهُ ٱلْخَٰلِقُ ٱلْبَارِئُ ٱلْمُصَوِّرُ ۖ لَهُ ٱلْأَسْمَآءُ ٱلْحُسْنَىٰ',
    translation: 'He is Allah, the Creator, the Inventor, the Fashioner; to Him belong the best names.',
    contemplation: 'Observe the craftsmanship in creation today—from the sky to a single leaf—and let it inspire reverence.',
  },
  {
    id: 'ref-10',
    theme: 'Wisdom in Speech',
    surah: 17,
    ayah: 53,
    surahName: 'Al-Isra',
    arabic: 'وَقُل لِّعِبَادِى يَقُولُوا۟ ٱلَّتِى هِىَ أَحْسَنُ',
    translation: 'And tell My servants to say that which is best.',
    contemplation: 'Choose words that heal and uplift. Let your speech leave people better than you found them.',
  },
  {
    id: 'ref-11',
    theme: 'Light upon Light',
    surah: 24,
    ayah: 35,
    surahName: 'An-Nur',
    arabic: 'ٱللَّهُ نُورُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضِ ۚ مَثَلُ نُورِهِۦ كَمِشْكَوٰةٍ فِيهَا مِصْبَاحٌ',
    translation: 'Allah is the Light of the heavens and the earth. The example of His light is like a niche within which is a lamp...',
    contemplation: 'Seek clarity when the world feels dark; revelation is a guiding beacon for the navigating mind.',
  },
  {
    id: 'ref-12',
    theme: 'Humility & Walk of Life',
    surah: 25,
    ayah: 63,
    surahName: 'Al-Furqan',
    arabic: 'وَعِبَادُ ٱلرَّحْمَٰنِ ٱلَّذِينَ يَمْشُونَ عَلَى ٱلْأَرْضِ هَوْنًا وَإِذَا خَاطَبَهُمُ ٱلْجَٰهِلُونَ قَالُوا۟ سَلَٰمًا',
    translation: 'And the servants of the Most Merciful are those who walk upon the earth easily, and when the ignorant address them, they say words of peace.',
    contemplation: 'Walk through life gently, without arrogance, and respond to friction with tranquil peace.',
  },
];

export function getDailyReflection(date: Date = new Date()): DailyReflectionItem {
  // Compute day of year to dynamically cycle reflections predictably each calendar day
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = Math.abs((date.getFullYear() * 365 + dayOfYear) % REFLECTIONS_DATA.length);
  return REFLECTIONS_DATA[index];
}

export function getNextReflection(currentId: string): DailyReflectionItem {
  const currentIndex = REFLECTIONS_DATA.findIndex((r) => r.id === currentId);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % REFLECTIONS_DATA.length : 0;
  return REFLECTIONS_DATA[nextIndex];
}
