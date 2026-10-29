import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SHADOWS } from '../../constants/theme';
import {
  BISMILLAH_TEXT,
  getSurahAyahs,
  getSurahMeta,
} from '../../services/quranData';
import {
  getBookmarks,
  toggleBookmark,
  setLastRead,
  getReaderSettings,
  saveReaderSettings,
  recordAyahRead,
  recordReadingTime,
  DEFAULT_SETTINGS,
} from '../../services/storage';
import { useQuranAudio } from '../../services/audioContext';
import {
  AyahData,
  BookmarkItem,
  ReaderSettings,
  TranslationLanguage,
  WordData,
  WordLearningDetails,
  SajdahAyahInfo,
} from '../../types/quran';
import {
  BANGLA_BISMILLAH,
  BANGLA_SURAHS,
  toBanglaNumerals,
} from '../../constants/banglaQuran';
import { AyahItem } from '../../components/AyahItem';
import { WordLearningModal } from '../../components/WordLearningModal';
import { SajdahTilawahModal } from '../../components/SajdahTilawahModal';
import { WaqfSignsModal } from '../../components/WaqfSignsModal';
import { SourcesTransparencyModal } from '../../components/SourcesTransparencyModal';
import { ContentErrorReportModal } from '../../components/ContentErrorReportModal';
import { getSajdahAyahInfo } from '../../constants/quranAccuracy';
import { getWordLearningDetails } from '../../services/learningData';

const VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 75,
};

export default function SurahReaderScreen() {
  const params = useLocalSearchParams<{ id: string; targetAyah?: string }>();
  const surahNumber = parseInt(params.id || '1', 10);
  const targetAyah = params.targetAyah ? parseInt(params.targetAyah, 10) : undefined;

  const surahMeta = useMemo(() => getSurahMeta(surahNumber), [surahNumber]);
  const banglaInfo = useMemo(() => BANGLA_SURAHS[surahNumber], [surahNumber]);
  const ayahs = useMemo(() => getSurahAyahs(surahNumber), [surahNumber]);

  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [focusMode, setFocusMode] = useState(false);
  const [selectedWordDetails, setSelectedWordDetails] = useState<WordLearningDetails | null>(null);
  const [isWordModalVisible, setIsWordModalVisible] = useState(false);
  const [activeWordAyah, setActiveWordAyah] = useState<number | null>(null);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const flatListRef = useRef<FlatList<AyahData>>(null);

  // Quran Accuracy & Transparency modals state
  const [isSajdahModalVisible, setIsSajdahModalVisible] = useState(false);
  const [activeSajdahInfo, setActiveSajdahInfo] = useState<SajdahAyahInfo | null>(null);
  const [isWaqfModalVisible, setIsWaqfModalVisible] = useState(false);
  const [isSourcesModalVisible, setIsSourcesModalVisible] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [reportTargetAyah, setReportTargetAyah] = useState<AyahData | null>(null);
  const [reportWordData, setReportWordData] = useState<{ wordText?: string; wordIndex?: number } | null>(null);

  const { currentSurah, currentAyah, isPlaying, playAyah, togglePlay } = useQuranAudio();

  // Track verses read in this session to prevent duplicate counts
  const readAyahsSetRef = useRef<Set<number>>(new Set());

  // Track active reading time dynamically
  useEffect(() => {
    const timer = setInterval(() => {
      recordReadingTime(5);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Load preferences and bookmarks
  useEffect(() => {
    getReaderSettings().then(setSettings);
    getBookmarks().then((items) => {
      setBookmarkedIds(new Set(items.map((b) => b.id)));
    });

    if (surahMeta) {
      const isBn = settings.translationLanguage === 'bangla';
      setLastRead({
        surah: surahNumber,
        ayah: targetAyah || 1,
        surahName: isBn && banglaInfo ? banglaInfo.name : surahMeta.en,
        surahNameAr: surahMeta.ar,
        timestamp: Date.now(),
      });
    }
  }, [surahNumber, targetAyah, surahMeta, banglaInfo, settings.translationLanguage]);

  // Track progress when audio plays an ayah
  useEffect(() => {
    if (currentSurah === surahNumber && currentAyah && !readAyahsSetRef.current.has(currentAyah)) {
      readAyahsSetRef.current.add(currentAyah);
      recordAyahRead(surahNumber, currentAyah);
      if (surahMeta) {
        const isBn = settings.translationLanguage === 'bangla';
        setLastRead({
          surah: surahNumber,
          ayah: currentAyah,
          surahName: isBn && banglaInfo ? banglaInfo.name : surahMeta.en,
          surahNameAr: surahMeta.ar,
          timestamp: Date.now(),
        });
      }
    }
  }, [currentSurah, currentAyah, surahNumber, surahMeta, banglaInfo, settings.translationLanguage]);

  // Scroll to target ayah if provided
  useEffect(() => {
    if (targetAyah && targetAyah > 1 && ayahs.length >= targetAyah) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: targetAyah - 1,
          animated: true,
          viewPosition: 0.1,
        });
      }, 350);
    }
  }, [targetAyah, ayahs]);

  const handleToggleBookmark = useCallback(async (item: AyahData) => {
    if (!surahMeta) return;
    const isBn = settings.translationLanguage === 'bangla';
    const bookmarkItem: BookmarkItem = {
      id: `${item.surah}:${item.ayah}`,
      surah: item.surah,
      ayah: item.ayah,
      surahName: isBn && banglaInfo ? banglaInfo.name : surahMeta.en,
      surahNameAr: surahMeta.ar,
      arabicSnippet: item.arabic,
      translationSnippet: isBn && item.bangla ? item.bangla : item.english,
      timestamp: Date.now(),
    };

    const isNowBookmarked = await toggleBookmark(bookmarkItem);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (isNowBookmarked) {
        next.add(bookmarkItem.id);
      } else {
        next.delete(bookmarkItem.id);
      }
      return next;
    });
  }, [surahMeta, banglaInfo, settings.translationLanguage]);

  const isCurrentSurahPlaying = currentSurah === surahNumber && isPlaying;

  const handlePlayAll = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    if (isCurrentSurahPlaying) {
      togglePlay();
    } else {
      playAyah(surahNumber, currentSurah === surahNumber && currentAyah ? currentAyah : 1);
    }
  };

  const handleToggleWbw = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSettings((prev) => ({ ...prev, showWbw: !prev.showWbw }));
  };

  const handleToggleFocusMode = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setFocusMode((prev) => !prev);
  };

  const handleCycleTranslationLanguage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const currentLang = settings.translationLanguage || 'english';
    const nextLang: TranslationLanguage =
      currentLang === 'english' ? 'bangla' : currentLang === 'bangla' ? 'both' : 'english';
    const updated = await saveReaderSettings({ translationLanguage: nextLang });
    setSettings(updated);
  };

  const handleAdjustFontSize = (delta: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    setSettings((prev) => ({
      ...prev,
      arabicFontSize: Math.max(20, Math.min(42, prev.arabicFontSize + delta)),
    }));
  };

  const handleWordSelect = (word: WordData, wordIndex: number, ayah: AyahData) => {
    const details = getWordLearningDetails(ayah.surah, ayah.ayah, wordIndex, word);
    setSelectedWordDetails(details);
    setActiveWordAyah(ayah.ayah);
    setActiveWordIndex(wordIndex);
    setIsWordModalVisible(true);
  };

  const handleNavigateToOccurrenceAyah = (targetSurah: number, targetAyah: number) => {
    if (targetSurah === surahNumber) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: Math.max(0, targetAyah - 1),
          animated: true,
          viewPosition: 0.1,
        });
      }, 200);
    } else {
      router.push({
        pathname: '/surah/[id]',
        params: {
          id: targetSurah.toString(),
          targetAyah: targetAyah.toString(),
        },
      });
    }
  };

  const handleOpenSajdah = (s: number, a: number) => {
    const info = getSajdahAyahInfo(s, a);
    if (info) {
      setActiveSajdahInfo(info);
      setIsSajdahModalVisible(true);
    }
  };

  const handleOpenReport = (target: AyahData, word?: { wordText?: string; wordIndex?: number }) => {
    setReportTargetAyah(target);
    setReportWordData(word || null);
    setIsReportModalVisible(true);
  };

  // Record read progress and current reading position dynamically
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: { item: AyahData }[] }) => {
      if (viewableItems.length > 0 && surahMeta) {
        const top = viewableItems[0].item;
        if (top) {
          setLastRead({
            surah: surahNumber,
            ayah: top.ayah,
            surahName: surahMeta.en,
            surahNameAr: surahMeta.ar,
            timestamp: Date.now(),
          });
        }
      }

      viewableItems.forEach(({ item }) => {
        if (item && !readAyahsSetRef.current.has(item.ayah)) {
          readAyahsSetRef.current.add(item.ayah);
          recordAyahRead(surahNumber, item.ayah);
        }
      });
    },
    [surahNumber, surahMeta]
  );

  if (!surahMeta) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Surah not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerInfoSection}>
      {/* Surah Banner Card (hidden in Focus Mode for serene distraction-free view) */}
      {!focusMode && (
        <LinearGradient
          colors={[COLORS.heroGradientStart, COLORS.heroGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.surahBanner}
        >
          <Text style={styles.bannerArabicTitle}>{surahMeta.ar}</Text>
          <Text style={styles.bannerEnTitle}>
            {settings.translationLanguage === 'bangla' && banglaInfo
              ? `${banglaInfo.name} (${surahMeta.en})`
              : surahMeta.en}
          </Text>
          <Text style={styles.bannerMeaning}>
            {settings.translationLanguage === 'bangla' && banglaInfo
              ? `${banglaInfo.meaning} • ${surahMeta.meaning}`
              : surahMeta.meaning}
          </Text>
          <View style={styles.bannerMetaRow}>
            <Text style={styles.bannerBadge}>
              {settings.translationLanguage === 'bangla' && banglaInfo
                ? banglaInfo.type
                : surahMeta.type}
            </Text>
            <Text style={styles.bannerDot}>•</Text>
            <Text style={styles.bannerBadge}>
              {settings.translationLanguage === 'bangla'
                ? `${toBanglaNumerals(surahMeta.ayahs)} আয়াত`
                : `${surahMeta.ayahs} Verses`}
            </Text>
          </View>
        </LinearGradient>
      )}

      {/* Quick Controls Bar */}
      <View style={styles.controlsBar}>
        <View style={styles.fontAdjustRow}>
          <TouchableOpacity
            style={styles.ctrlBtn}
            onPress={() => handleAdjustFontSize(-2)}
            accessibilityRole="button"
            accessibilityLabel="Decrease font size"
          >
            <Ionicons name="text" size={13} color={COLORS.primaryDark} />
            <Text style={styles.ctrlBtnText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ctrlBtn}
            onPress={() => handleAdjustFontSize(2)}
            accessibilityRole="button"
            accessibilityLabel="Increase font size"
          >
            <Ionicons name="text" size={17} color={COLORS.primaryDark} />
            <Text style={styles.ctrlBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Word by word pill */}
        <TouchableOpacity
          style={[styles.togglePill, settings.showWbw && styles.togglePillActive]}
          onPress={handleToggleWbw}
          activeOpacity={0.7}
        >
          <Ionicons
            name="grid-outline"
            size={13}
            color={settings.showWbw ? COLORS.textInverse : COLORS.primaryDark}
          />
          <Text
            style={[
              styles.togglePillText,
              settings.showWbw && styles.togglePillTextActive,
            ]}
          >
            Word by Word
          </Text>
        </TouchableOpacity>

        {/* Translation Language Pill */}
        <TouchableOpacity
          style={[
            styles.togglePill,
            (settings.translationLanguage === 'bangla' || settings.translationLanguage === 'both') &&
              styles.togglePillActive,
          ]}
          onPress={handleCycleTranslationLanguage}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Switch translation language between English, Bangla, and Both"
        >
          <Ionicons
            name="language-outline"
            size={13}
            color={
              settings.translationLanguage === 'bangla' || settings.translationLanguage === 'both'
                ? COLORS.textInverse
                : COLORS.primaryDark
            }
          />
          <Text
            style={[
              styles.togglePillText,
              (settings.translationLanguage === 'bangla' || settings.translationLanguage === 'both') &&
                styles.togglePillTextActive,
            ]}
          >
            {settings.translationLanguage === 'bangla'
              ? 'বাংলা'
              : settings.translationLanguage === 'both'
              ? 'বাংলা+EN'
              : 'EN'}
          </Text>
        </TouchableOpacity>

        {/* Focus / Distraction-free Mode */}
        <TouchableOpacity
          style={[styles.togglePill, focusMode && styles.togglePillActive]}
          onPress={handleToggleFocusMode}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Toggle Focus Mode"
        >
          <Ionicons
            name={focusMode ? 'leaf' : 'leaf-outline'}
            size={13}
            color={focusMode ? COLORS.textInverse : COLORS.primaryDark}
          />
          <Text
            style={[
              styles.togglePillText,
              focusMode && styles.togglePillTextActive,
            ]}
          >
            Focus
          </Text>
        </TouchableOpacity>

        {/* Waqf Stopping Signs Guide */}
        <TouchableOpacity
          style={styles.togglePill}
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch {}
            setIsWaqfModalVisible(true);
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Quranic stopping marks and typography guide"
        >
          <Ionicons name="pause-circle-outline" size={13} color={COLORS.primaryDark} />
          <Text style={styles.togglePillText}>Waqf</Text>
        </TouchableOpacity>

        {/* Memorization / Hifz Mode */}
        <TouchableOpacity
          style={styles.togglePill}
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch {}
            router.push({
              pathname: '/memorize',
              params: {
                surah: surahNumber.toString(),
                startAyah: '1',
                endAyah: Math.min(surahMeta?.ayahs || 7, 7).toString(),
              },
            });
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Memorize Surah"
        >
          <Ionicons name="sparkles" size={13} color={COLORS.primaryDark} />
          <Text style={styles.togglePillText}>Hifz</Text>
        </TouchableOpacity>

        {/* Play All Audio */}
        <TouchableOpacity
          style={[styles.playAllPill, isCurrentSurahPlaying && styles.playAllPillActive]}
          onPress={handlePlayAll}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isCurrentSurahPlaying ? 'pause' : 'play'}
            size={13}
            color={COLORS.textInverse}
          />
          <Text style={styles.playAllText}>
            {isCurrentSurahPlaying ? 'Pause' : 'Play'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bismillah Banner (Surahs other than 1 and 9) */}
      {surahMeta.bismillah && (
        <View style={styles.bismillahBox}>
          <Text style={styles.bismillahText}>{BISMILLAH_TEXT}</Text>
          {(settings.translationLanguage === 'bangla' || settings.translationLanguage === 'both') && (
            <Text style={styles.bismillahBanglaText}>{BANGLA_BISMILLAH}</Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.navBackBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.navTitleCol}>
          <Text style={styles.navTitle} numberOfLines={1}>
            {settings.translationLanguage === 'bangla' && banglaInfo ? banglaInfo.name : surahMeta.en}
          </Text>
          <Text style={styles.navSub}>
            {settings.translationLanguage === 'bangla' && banglaInfo
              ? `সূরা ${toBanglaNumerals(surahMeta.n)} • ${toBanglaNumerals(surahMeta.ayahs)} আয়াত`
              : `Surah ${surahMeta.n} • ${surahMeta.ayahs} Verses`}
          </Text>
        </View>

        <View style={styles.navRightGroup}>
          <TouchableOpacity
            style={styles.navSourcesBtn}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch {}
              setIsSourcesModalVisible(true);
            }}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="View verified Quran sources and authenticity"
          >
            <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.primaryDark} />
          </TouchableOpacity>

          <View style={styles.navRightBadge}>
            <Text style={styles.navRightBadgeText}>{surahMeta.ar}</Text>
          </View>
        </View>
      </View>

      {/* Verses List */}
      <FlatList
        ref={flatListRef}
        data={ayahs}
        keyExtractor={(item) => item.ayah.toString()}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={() => {
          const prevSurah = surahNumber > 1 ? getSurahMeta(surahNumber - 1) : null;
          const nextSurah = surahNumber < 114 ? getSurahMeta(surahNumber + 1) : null;

          return (
            <View style={styles.footerContainer}>
              <View style={styles.khatamCard}>
                <Text style={styles.khatamArabic}>صَدَقَ اللَّهُ الْعَظِيمُ</Text>
                <Text style={styles.khatamSub}>Allah Almighty has spoken the truth</Text>
              </View>

              <View style={styles.footerNavRow}>
                {prevSurah ? (
                  <TouchableOpacity
                    style={styles.surahNavBtn}
                    onPress={() => router.replace({ pathname: '/surah/[id]', params: { id: prevSurah.n.toString() } })}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="arrow-back" size={16} color={COLORS.primaryDark} />
                    <View style={{ marginLeft: 8 }}>
                      <Text style={styles.surahNavSub}>Previous Surah</Text>
                      <Text style={styles.surahNavTitle}>{prevSurah.en}</Text>
                    </View>
                  </TouchableOpacity>
                ) : <View style={{ flex: 1 }} />}

                {nextSurah ? (
                  <TouchableOpacity
                    style={[styles.surahNavBtn, styles.surahNavBtnNext]}
                    onPress={() => router.replace({ pathname: '/surah/[id]', params: { id: nextSurah.n.toString() } })}
                    activeOpacity={0.7}
                  >
                    <View style={{ marginRight: 8, alignItems: 'flex-end' }}>
                      <Text style={[styles.surahNavSub, { color: 'rgba(255, 255, 255, 0.85)' }]}>Next Surah</Text>
                      <Text style={[styles.surahNavTitle, { color: COLORS.textInverse }]}>{nextSurah.en}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.textInverse} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          );
        }}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
        renderItem={({ item }) => {
          const isItemPlaying =
            currentSurah === surahNumber && currentAyah === item.ayah && isPlaying;
          const isItemBookmarked = bookmarkedIds.has(`${surahNumber}:${item.ayah}`);

          return (
            <AyahItem
              ayah={item}
              fontSize={settings.arabicFontSize}
              showTranslation={settings.showTranslation}
              translationLanguage={settings.translationLanguage}
              showTransliteration={settings.showTransliteration}
              showWbw={settings.showWbw}
              isBookmarked={isItemBookmarked}
              isPlaying={isItemPlaying}
              focusMode={focusMode}
              selectedWordIndex={activeWordAyah === item.ayah ? activeWordIndex : null}
              onPlay={() => playAyah(surahNumber, item.ayah)}
              onToggleBookmark={() => handleToggleBookmark(item)}
              onWordSelect={handleWordSelect}
              onSajdahPress={handleOpenSajdah}
              onReportPress={(ayahData) => handleOpenReport(ayahData)}
            />
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={(info) => {
          flatListRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: true,
          });
        }}
      />

      {/* Interactive Word Learning Modal */}
      <WordLearningModal
        visible={isWordModalVisible}
        wordDetails={selectedWordDetails}
        onClose={() => {
          setIsWordModalVisible(false);
          setActiveWordAyah(null);
          setActiveWordIndex(null);
        }}
        onNavigateToAyah={handleNavigateToOccurrenceAyah}
        onReportWord={(details) => {
          const matchingAyah = ayahs.find((a) => a.ayah === details.ayah);
          handleOpenReport(
            matchingAyah || {
              surah: details.surah,
              ayah: details.ayah,
              arabic: details.arabic,
              english: details.english,
              transliteration: details.transliteration,
            },
            { wordText: details.arabic, wordIndex: details.wordIndex }
          );
        }}
      />

      {/* Sajdah Tilawah Modal */}
      <SajdahTilawahModal
        visible={isSajdahModalVisible}
        sajdahInfo={activeSajdahInfo}
        onClose={() => {
          setIsSajdahModalVisible(false);
          setActiveSajdahInfo(null);
        }}
      />

      {/* Waqf Stopping Signs Guide Modal */}
      <WaqfSignsModal
        visible={isWaqfModalVisible}
        onClose={() => setIsWaqfModalVisible(false)}
      />

      {/* Sources & Authenticity Modal */}
      <SourcesTransparencyModal
        visible={isSourcesModalVisible}
        onClose={() => setIsSourcesModalVisible(false)}
        onOpenErrorReport={() => {
          handleOpenReport(ayahs[0]);
        }}
      />

      {/* Content Error Reporting Modal */}
      <ContentErrorReportModal
        visible={isReportModalVisible}
        onClose={() => {
          setIsReportModalVisible(false);
          setReportTargetAyah(null);
          setReportWordData(null);
        }}
        initialSurah={reportTargetAyah ? reportTargetAyah.surah : surahNumber}
        initialAyah={reportTargetAyah ? reportTargetAyah.ayah : 1}
        initialSurahName={surahMeta.en}
        initialWordIndex={reportWordData?.wordIndex}
        initialWordText={reportWordData?.wordText}
        initialArabicSnippet={reportTargetAyah?.arabic}
        initialTranslationSnippet={reportTargetAyah?.english}
        initialCategory={reportWordData ? 'morphology_root' : 'arabic_text'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 120,
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  navBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitleCol: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  navTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  navSub: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  navRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navSourcesBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  navRightBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: COLORS.primarySurface,
  },
  navRightBadgeText: {
    fontFamily: FONTS.arabicBold,
    fontSize: 15,
    color: COLORS.primaryDark,
  },
  headerInfoSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  surahBanner: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 14,
    ...SHADOWS.md,
  },
  bannerArabicTitle: {
    fontFamily: FONTS.arabicBold,
    fontSize: 34,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bannerEnTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 20,
    color: COLORS.textInverse,
    marginBottom: 2,
  },
  bannerMeaning: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.88)',
    marginBottom: 12,
  },
  bannerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerBadge: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.textInverse,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  bannerDot: {
    color: '#E0D4FC',
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  fontAdjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctrlBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  ctrlBtnText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    color: COLORS.primaryDark,
  },
  togglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
  },
  togglePillActive: {
    backgroundColor: COLORS.primaryDark,
  },
  togglePillText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    color: COLORS.primaryDark,
  },
  togglePillTextActive: {
    color: COLORS.textInverse,
  },
  playAllPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  playAllPillActive: {
    backgroundColor: COLORS.goldDark,
  },
  playAllText: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    color: COLORS.textInverse,
  },
  bismillahBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    ...SHADOWS.sm,
  },
  bismillahText: {
    fontFamily: FONTS.arabicBold,
    fontSize: 24,
    color: COLORS.primaryDark,
    textAlign: 'center',
  },
  bismillahBanglaText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13.5,
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    opacity: 0.9,
  },
  errorBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backBtnText: {
    fontFamily: FONTS.sansBold,
    color: COLORS.textInverse,
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 40,
  },
  khatamCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    ...SHADOWS.sm,
  },
  khatamArabic: {
    fontFamily: FONTS.arabicBold,
    fontSize: 26,
    color: COLORS.primaryDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  khatamSub: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  footerNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  surahNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  surahNavBtnNext: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    justifyContent: 'flex-end',
  },
  surahNavSub: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  surahNavTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
});
