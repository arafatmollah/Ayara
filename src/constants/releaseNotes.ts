import AsyncStorage from '@react-native-async-storage/async-storage';

export const LAST_SEEN_RELEASE_KEY = '@quran/last_seen_release_version';

export interface ReleaseFeature {
  icon: string;
  title: string;
  description: string;
  tag?: 'New' | 'Improved' | 'Fix';
  badgeColor?: string;
}

export interface ReleaseItem {
  version: string;
  title: string;
  date: string;
  isLatest?: boolean;
  highlight: string;
  features: ReleaseFeature[];
  githubUrl: string;
}

export const RELEASES_DATA: ReleaseItem[] = [
  {
    version: '1.4.0',
    title: 'Full Bangla Mode & Offline Bengali Quran',
    date: 'October 2026',
    isLatest: true,
    highlight:
      'Immerse in the Noble Quran with authentic Bengali translation by Maulana Muhiuddin Khan, bilingual translation switching, Bengali Surah names & meanings, and Bengali search.',
    githubUrl: 'https://github.com/arafatmollah/Ayara/releases/tag/v1.4.0',
    features: [
      {
        icon: 'language',
        title: 'Complete Bangla Mode (বাংলা অনুবাদ ও উচ্চারণ)',
        description:
          'Offline Bengali translation for all 114 Surahs (6,236 Ayahs) by Maulana Muhiuddin Khan (King Fahd Complex & Islamic Foundation Bangladesh), with authentic Bengali Surah names, meanings, and Bismillah.',
        tag: 'New',
        badgeColor: '#059669',
      },
      {
        icon: 'swap-horizontal',
        title: 'Bilingual Translation Switcher',
        description:
          'Switch seamlessly between English, বাংলা (Bangla), and Both (উভয়টি) in Reader Settings or via a single-tap pill in the reader controls bar.',
        tag: 'New',
        badgeColor: '#10B981',
      },
      {
        icon: 'search',
        title: 'Bengali Quran Search',
        description:
          'Search for chapters using Bengali phonetic or literal terms (e.g. ফাতিহা, গাভী, কাহফ) directly from the Surahs library.',
        tag: 'New',
        badgeColor: '#6366F1',
      },
    ],
  },
  {
    version: '1.3.0',
    title: 'Daily Habit Reminders & Seamless Updates',
    date: 'October 2026',
    highlight:
      'Cultivate a lifelong connection to the Quran with gentle 12-hour reminders, automatic release notifications, and a dedicated What’s New hub.',
    githubUrl: 'https://github.com/arafatmollah/Ayara/releases/tag/v1.3.0',
    features: [
      {
        icon: 'notifications',
        title: 'Daily Learn Reminders (12-Hour Format)',
        description:
          'Set reminders in gentle 12-hour format at 8:00 PM, 9:00 PM, or 10:00 PM to review Quran vocabulary without notification fatigue.',
        tag: 'New',
        badgeColor: '#10B981',
      },
      {
        icon: 'cloud-download',
        title: 'Release Notifications & In-App Checker',
        description:
          'Stay updated automatically. Ayara checks GitHub for updates and sends a tap-to-download notification when a new version is released.',
        tag: 'New',
        badgeColor: '#6366F1',
      },
      {
        icon: 'sparkles',
        title: 'Release Hub & "What’s New" Page',
        description:
          'Explore new features right after updating or review the full version changelog anytime from Settings.',
        tag: 'New',
        badgeColor: '#F59E0B',
      },
      {
        icon: 'globe',
        title: 'Cross-Platform & Web Resilience',
        description:
          'Web-safe notification handlers and Hermes bundling enhancements ensure Ayara runs smoothly across Android, iOS, and Web.',
        tag: 'Improved',
        badgeColor: '#059669',
      },
    ],
  },
  {
    version: '1.2.0',
    title: 'Quran Accuracy & Scholarly Transparency',
    date: 'October 2026',
    highlight:
      'Verified Uthmani script standards, Sajdah Tilawah guidance, Waqf stopping symbols, and 5 master Huffaz reciters.',
    githubUrl: 'https://github.com/arafatmollah/Ayara/releases/tag/v1.2.0',
    features: [
      {
        icon: 'shield-checkmark',
        title: 'Sources & Authenticity Verification',
        description:
          'Tanzil Uthmani text verification, Saheeh International attribution, and classical Arabic lexicon references with zero generative AI text.',
        tag: 'New',
        badgeColor: '#059669',
      },
      {
        icon: 'body',
        title: 'Sajdah Tilawah (Prostration) Guidance',
        description:
          'Indicators on all 15 Quranic prostration verses with prophetic Du’as and classical jurisprudence rulings.',
        tag: 'New',
        badgeColor: '#10B981',
      },
      {
        icon: 'bookmark',
        title: 'Uthmani Waqf Stopping Signs Guide',
        description:
          'Interactive modal explaining all 7 classical stopping signs (مـ, لا, ج, صلى, قلى, ۛ, س) and Quranic ornamental dividers.',
        tag: 'New',
        badgeColor: '#6366F1',
      },
      {
        icon: 'volume-high',
        title: '5 Master Quran Reciters',
        description:
          'EveryAyah studio audio by Sheikh Alafasy, Sheikh AbdulBaset, Sheikh Al-Muaiqly, Sheikh Al-Shatri, and Sheikh Al-Husary.',
        tag: 'Improved',
        badgeColor: '#3B82F6',
      },
      {
        icon: 'flag',
        title: 'Content Inaccuracy Reporting',
        description:
          'Community peer-review reporting mechanism to flag, describe, and resolve any typographical or translation feedback.',
        tag: 'New',
        badgeColor: '#EF4444',
      },
    ],
  },
  {
    version: '1.1.0',
    title: 'Interactive Learning & Memorization Core',
    date: 'October 2026',
    highlight:
      'Word-by-word morphology, SuperMemo-2 spaced-repetition vocabulary trainer, Hifz memorization masking, and structured Arabic paths.',
    githubUrl: 'https://github.com/arafatmollah/Ayara/releases/tag/v1.1.0',
    features: [
      {
        icon: 'search',
        title: 'Interactive Word-by-Word Morphology',
        description:
          'Tap any word in the Quran for 3-letter trilateral roots, lexical definitions, and cross-Quran occurrences across all 114 Surahs.',
        tag: 'New',
        badgeColor: '#10B981',
      },
      {
        icon: 'repeat',
        title: 'SuperMemo-2 (SM-2) Spaced Repetition',
        description:
          'Optimal memory intervals with dual-recognition flashcards and contextual quizzes for Quranic vocabulary mastery.',
        tag: 'New',
        badgeColor: '#6366F1',
      },
      {
        icon: 'eye-off',
        title: 'Adaptive Hifz Memorization Mode',
        description:
          'Verse masking (full mask, first-letter hint, blur), audio loop repetitions, and self-assessment recall grading.',
        tag: 'New',
        badgeColor: '#F59E0B',
      },
      {
        icon: 'school',
        title: 'Structured Quranic Arabic Paths',
        description:
          '5 progressive courses with 20 interactive lessons covering phonetics, morphology, and essential Quranic vocabulary.',
        tag: 'New',
        badgeColor: '#059669',
      },
    ],
  },
];

export function getLatestRelease(): ReleaseItem {
  return RELEASES_DATA[0];
}

/**
 * Check if the user hasn't seen the "What's New" release notes for the current version yet.
 */
export async function checkShouldShowWhatsNew(currentVersion: string): Promise<boolean> {
  try {
    const lastSeen = await AsyncStorage.getItem(LAST_SEEN_RELEASE_KEY);
    // Show if never seen before, or if user just updated to a newer version
    return lastSeen !== currentVersion;
  } catch {
    return false;
  }
}

/**
 * Mark the current release version as acknowledged by the user.
 */
export async function markWhatsNewSeen(currentVersion: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_SEEN_RELEASE_KEY, currentVersion);
  } catch {}
}
