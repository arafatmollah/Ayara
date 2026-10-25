import React, { useState, useMemo } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, FONTS, SHADOWS } from '../../constants/theme';
import {
  getBookmarks,
  toggleBookmark,
  getLastRead,
  getRecentHistory,
  getSavedVocabulary,
  removeVocabularyWord,
  toggleWordMastered,
  seedStarterVocabulary,
} from '../../services/storage';
import { BookmarkItem, LastReadItem, SavedWordItem, WordLearningDetails } from '../../types/quran';
import { getWordLearningDetails } from '../../services/learningData';
import { computeDeckStats } from '../../services/srsEngine';
import { WordLearningModal } from '../../components/WordLearningModal';

const formatTimestamp = (ts: number): string => {
  const diffMin = Math.round((Date.now() - ts) / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
};

export default function SavedScreen() {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'vocabulary' | 'history'>('bookmarks');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [vocabulary, setVocabulary] = useState<SavedWordItem[]>([]);
  const [lastRead, setLastRead] = useState<LastReadItem | null>(null);
  const [historyList, setHistoryList] = useState<LastReadItem[]>([]);

  // Search filter for vocabulary
  const [vocabSearch, setVocabSearch] = useState('');

  // Word Learning Modal state
  const [selectedWordDetails, setSelectedWordDetails] = useState<WordLearningDetails | null>(null);
  const [isWordModalVisible, setIsWordModalVisible] = useState(false);

  // Revision / Flashcard Modal state
  const [isRevisionModalVisible, setIsRevisionModalVisible] = useState(false);
  const [revisionIndex, setRevisionIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState(() => Date.now());

  const loadData = async () => {
    setCurrentTimestamp(Date.now());
    const [b, v, l, h] = await Promise.all([
      getBookmarks(),
      getSavedVocabulary(),
      getLastRead(),
      getRecentHistory(),
    ]);
    setBookmarks(b);
    setVocabulary(v);
    setLastRead(l);
    setHistoryList(h);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const handleOpenBookmark = (item: BookmarkItem) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: '/surah/[id]',
      params: {
        id: item.surah.toString(),
        targetAyah: item.ayah.toString(),
      },
    });
  };

  const handleOpenHistory = (item: LastReadItem) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push({
      pathname: '/surah/[id]',
      params: {
        id: item.surah.toString(),
        targetAyah: item.ayah.toString(),
      },
    });
  };

  const handleDeleteBookmark = async (item: BookmarkItem) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    await toggleBookmark(item);
    loadData();
  };

  const handleDeleteVocabWord = async (item: SavedWordItem) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    await removeVocabularyWord(item.id);
    loadData();
  };

  const handleToggleMastered = async (item: SavedWordItem) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    await toggleWordMastered(item.id);
    loadData();
  };

  const handleOpenVocabDetails = (item: SavedWordItem) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    const [, , w] = item.id.split(':').map(Number);
    const wordIndex = !isNaN(w) ? w : 0;
    const details = getWordLearningDetails(item.surah, item.ayah, wordIndex, {
      arabic: item.arabic,
      transliteration: item.transliteration,
      english: item.english,
      rootAr: item.rootAr,
      rootMeaning: item.rootMeaning,
    });
    setSelectedWordDetails(details);
    setIsWordModalVisible(true);
  };

  const handleJumpToAyah = (surah: number, ayah: number) => {
    setIsWordModalVisible(false);
    setIsRevisionModalVisible(false);
    router.push({
      pathname: '/surah/[id]',
      params: {
        id: surah.toString(),
        targetAyah: ayah.toString(),
      },
    });
  };

  // Filtered vocabulary
  const filteredVocab = useMemo(() => {
    if (!vocabSearch.trim()) return vocabulary;
    const q = vocabSearch.trim().toLowerCase();
    return vocabulary.filter((w) => {
      return (
        w.arabic.includes(q) ||
        w.transliteration.toLowerCase().includes(q) ||
        w.english.toLowerCase().includes(q) ||
        (w.rootAr && w.rootAr.includes(q)) ||
        (w.rootMeaning && w.rootMeaning.toLowerCase().includes(q)) ||
        w.surahName.toLowerCase().includes(q)
      );
    });
  }, [vocabulary, vocabSearch]);

  const deckStats = useMemo(() => {
    return computeDeckStats(vocabulary);
  }, [vocabulary]);

  // Flashcard Revision helpers
  const startRevision = () => {
    if (vocabulary.length === 0) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
    setRevisionIndex(0);
    setIsCardFlipped(false);
    setIsRevisionModalVisible(true);
  };

  const currentRevisionWord = vocabulary[revisionIndex];

  const handleNextRevisionCard = (markMastered?: boolean) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (currentRevisionWord && markMastered !== undefined) {
      if (currentRevisionWord.mastered !== markMastered) {
        toggleWordMastered(currentRevisionWord.id).then(loadData);
      }
    }

    if (revisionIndex < vocabulary.length - 1) {
      setRevisionIndex((prev) => prev + 1);
      setIsCardFlipped(false);
    } else {
      setIsRevisionModalVisible(false);
    }
  };

  const handlePrevRevisionCard = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (revisionIndex > 0) {
      setRevisionIndex((prev) => prev - 1);
      setIsCardFlipped(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.subGreeting}>Saved & Learning</Text>
          <Text style={styles.appTitle}>Your Sanctuary</Text>
        </View>
        <View style={styles.headerIconBox}>
          <Ionicons name="bookmark" size={22} color={COLORS.primary} />
        </View>
      </View>

      {/* Last Read Resume Card */}
      {lastRead && (
        <View style={styles.sectionHeaderBox}>
          <Text style={styles.sectionTitle}>Current Reading Position</Text>
          <TouchableOpacity
            style={styles.lastReadCard}
            onPress={() =>
              router.push({
                pathname: '/surah/[id]',
                params: {
                  id: lastRead.surah.toString(),
                  targetAyah: lastRead.ayah.toString(),
                },
              })
            }
            activeOpacity={0.7}
          >
            <View style={styles.lastReadLeft}>
              <View style={styles.lastReadNumberBadge}>
                <Text style={styles.lastReadNumberText}>{lastRead.surah}</Text>
              </View>
              <View>
                <Text style={styles.lastReadName}>{lastRead.surahName}</Text>
                <Text style={styles.lastReadAyah}>Verse {lastRead.ayah}</Text>
              </View>
            </View>
            <View style={styles.resumePill}>
              <Text style={styles.resumePillText}>Resume</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.textInverse} />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab Switcher: Bookmarks vs Vocabulary vs History */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'bookmarks' && styles.tabBtnActive]}
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch {}
            setActiveTab('bookmarks');
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, activeTab === 'bookmarks' && styles.tabBtnTextActive]}>
            Bookmarks ({bookmarks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'vocabulary' && styles.tabBtnActive]}
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch {}
            setActiveTab('vocabulary');
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, activeTab === 'vocabulary' && styles.tabBtnTextActive]}>
            Vocabulary ({vocabulary.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
          onPress={() => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch {}
            setActiveTab('history');
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabBtnText, activeTab === 'history' && styles.tabBtnTextActive]}>
            History ({historyList.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Vocabulary Sub-Header (Deck Revision Banner & Search) */}
      {activeTab === 'vocabulary' && vocabulary.length > 0 && (
        <View style={styles.vocabHeaderSection}>
          {/* SRS Trainer Card */}
          <TouchableOpacity
            style={styles.vocabDeckCard}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } catch {}
              router.push('/trainer');
            }}
            activeOpacity={0.85}
          >
            <View style={styles.vocabDeckLeft}>
              <View style={styles.deckIconBox}>
                <Ionicons name="repeat" size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.deckTitle}>Spaced Repetition Trainer</Text>
                  {deckStats.dueReviewsCount > 0 ? (
                    <View style={styles.dueCountBadge}>
                      <Text style={styles.dueCountBadgeText}>{deckStats.dueReviewsCount} due</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.deckSub}>
                  {vocabulary.length} words • {deckStats.masteredCount} mastered • {deckStats.overallAccuracy}% acc
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity
                style={styles.quickReviseBtn}
                onPress={(e) => {
                  e.stopPropagation();
                  startRevision();
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="card-outline" size={14} color={COLORS.primaryDark} />
              </TouchableOpacity>
              <View style={styles.startRevisionBtn}>
                <Ionicons name="play" size={14} color={COLORS.textInverse} />
                <Text style={styles.startRevisionBtnText}>Train</Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Learning Paths Quick Jump */}
          <TouchableOpacity
            style={styles.learningPathsQuickCard}
            onPress={() => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } catch {}
              router.push('/learn');
            }}
            activeOpacity={0.85}
          >
            <View style={styles.deckIconBox}>
              <Ionicons name="school" size={18} color={COLORS.primaryDark} />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.deckTitle}>Quranic Arabic Learning Paths</Text>
              <Text style={styles.deckSub}>5 courses: common words, pronouns, particles & roots</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primaryDark} />
          </TouchableOpacity>

          {/* Search Box */}
          <View style={styles.vocabSearchBox}>
            <Ionicons name="search" size={17} color={COLORS.textMuted} />
            <TextInput
              style={styles.vocabSearchInput}
              placeholder="Search words, meanings, or roots..."
              placeholderTextColor={COLORS.textMuted}
              value={vocabSearch}
              onChangeText={setVocabSearch}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {vocabSearch ? (
              <TouchableOpacity onPress={() => setVocabSearch('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {activeTab === 'bookmarks' ? (
        <FlatList
          data={bookmarks}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.bookmarkCard}
              onPress={() => handleOpenBookmark(item)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}>
                    {item.surahName} : {item.ayah}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteBookmark(item)}
                  style={styles.deleteBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel="Remove Bookmark"
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.arabicSnippet} numberOfLines={2}>
                {item.arabicSnippet}
              </Text>

              {item.translationSnippet ? (
                <Text style={styles.translationSnippet} numberOfLines={2}>
                  {item.translationSnippet}
                </Text>
              ) : null}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={52} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
              <Text style={styles.emptySub}>
                Tap the bookmark icon beside any verse while reading to save it here for quick access.
              </Text>
            </View>
          }
        />
      ) : activeTab === 'vocabulary' ? (
        <FlatList
          data={filteredVocab}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.vocabCard}
              onPress={() => handleOpenVocabDetails(item)}
              activeOpacity={0.7}
            >
              <View style={styles.vocabCardHeader}>
                {/* Source Ayah Ref */}
                <TouchableOpacity
                  style={styles.vocabAyahBadge}
                  onPress={() => handleJumpToAyah(item.surah, item.ayah)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="book-outline" size={12} color={COLORS.primaryDark} />
                  <Text style={styles.vocabAyahBadgeText}>
                    {item.surahName} {item.surah}:{item.ayah}
                  </Text>
                </TouchableOpacity>

                <View style={styles.vocabCardActions}>
                  {/* SRS Status Pill */}
                  {item.status === 'weak' ? (
                    <View style={styles.vocabWeakPill}>
                      <Ionicons name="alert-circle" size={10} color="#DC2626" />
                      <Text style={styles.vocabWeakPillText}>Weak</Text>
                    </View>
                  ) : item.nextReviewDate && item.nextReviewDate <= currentTimestamp ? (
                    <View style={styles.vocabDuePill}>
                      <Ionicons name="alarm" size={10} color="#D97706" />
                      <Text style={styles.vocabDuePillText}>Due</Text>
                    </View>
                  ) : item.interval ? (
                    <View style={styles.vocabIntervalPill}>
                      <Text style={styles.vocabIntervalPillText}>{item.interval}d</Text>
                    </View>
                  ) : null}

                  {/* Mastered Pill */}
                  <TouchableOpacity
                    style={[styles.masteredPill, item.mastered && styles.masteredPillActive]}
                    onPress={() => handleToggleMastered(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={item.mastered ? 'checkmark-circle' : 'ellipse-outline'}
                      size={13}
                      color={item.mastered ? COLORS.goldDark : COLORS.textMuted}
                    />
                    <Text style={[styles.masteredPillText, item.mastered && styles.masteredPillTextActive]}>
                      {item.mastered ? 'Mastered' : 'Learning'}
                    </Text>
                  </TouchableOpacity>

                  {/* Delete Button */}
                  <TouchableOpacity
                    onPress={() => handleDeleteVocabWord(item)}
                    style={styles.deleteBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Remove Word"
                  >
                    <Ionicons name="trash-outline" size={17} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Arabic Word & Transliteration */}
              <View style={styles.vocabBodyRow}>
                <View style={styles.vocabTextCol}>
                  <Text style={styles.vocabEnglishText}>{item.english}</Text>
                  <Text style={styles.vocabTranslitText}>{item.transliteration}</Text>

                  {/* Root Badge */}
                  {item.rootAr ? (
                    <View style={styles.vocabRootRow}>
                      <View style={styles.vocabRootPill}>
                        <Ionicons name="git-commit-outline" size={12} color={COLORS.goldDark} />
                        <Text style={styles.vocabRootText}>Root: {item.rootAr}</Text>
                      </View>
                      {item.rootMeaning ? (
                        <Text style={styles.vocabRootMeaning} numberOfLines={1}>
                          ({item.rootMeaning})
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                </View>

                <Text style={styles.vocabArabicBig}>{item.arabic}</Text>
              </View>

              <View style={styles.vocabCardFooter}>
                <Text style={styles.vocabTapHint}>Tap to view root, grammar & occurrences</Text>
                <Ionicons name="arrow-forward" size={13} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="sparkles-outline" size={52} color={COLORS.gold} />
              <Text style={styles.emptyTitle}>
                {vocabSearch ? 'No Matching Words' : 'No Vocabulary Saved Yet'}
              </Text>
              <Text style={styles.emptySub}>
                {vocabSearch
                  ? 'Try searching with another word or clear the filter.'
                  : 'Tap any Arabic word in the Quran reader to learn its meaning, transliteration, root, and grammar role, then train it with spaced repetition.'}
              </Text>
              {!vocabSearch && (
                <TouchableOpacity
                  style={styles.seedDeckBtn}
                  onPress={async () => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    } catch {}
                    await seedStarterVocabulary();
                    loadData();
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="sparkles" size={16} color={COLORS.textInverse} />
                  <Text style={styles.seedDeckBtnText}>Seed 15 Essential Quranic Words</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      ) : (
        <FlatList
          data={historyList}
          keyExtractor={(item, index) => `${item.surah}:${item.ayah}:${index}`}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.historyCard}
              onPress={() => handleOpenHistory(item)}
              activeOpacity={0.7}
            >
              <View style={styles.historyLeft}>
                <View style={styles.historyNumberBadge}>
                  <Text style={styles.historyNumberText}>{item.surah}</Text>
                </View>
                <View>
                  <Text style={styles.historySurahName}>{item.surahName}</Text>
                  <Text style={styles.historyAyahText}>
                    Verse {item.ayah} • {formatTimestamp(item.timestamp)}
                  </Text>
                </View>
              </View>
              <View style={styles.historyArrowBox}>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primaryDark} />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="time-outline" size={52} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No Reading History Yet</Text>
              <Text style={styles.emptySub}>
                As you read verses in the Quran, your recent reading sessions will appear dynamically here.
              </Text>
            </View>
          }
        />
      )}

      {/* Word Learning Modal */}
      <WordLearningModal
        visible={isWordModalVisible}
        wordDetails={selectedWordDetails}
        onClose={() => setIsWordModalVisible(false)}
        onNavigateToAyah={handleJumpToAyah}
      />

      {/* Flashcard Revision Modal */}
      {currentRevisionWord && (
        <Modal
          visible={isRevisionModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setIsRevisionModalVisible(false)}
        >
          <View style={styles.revModalOverlay}>
            <View style={styles.revContainer}>
              {/* Top Header */}
              <View style={styles.revHeader}>
                <View style={styles.revDeckCounter}>
                  <Text style={styles.revCounterText}>
                    Card {revisionIndex + 1} of {vocabulary.length}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => setIsRevisionModalVisible(false)}
                  style={styles.revCloseBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Close revision"
                >
                  <Ionicons name="close" size={20} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Flashcard Area */}
              <TouchableOpacity
                style={styles.revFlashcard}
                activeOpacity={0.9}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch {}
                  setIsCardFlipped((prev) => !prev);
                }}
              >
                <View style={styles.revCardTopBar}>
                  <Text style={styles.revSurahTag}>
                    {currentRevisionWord.surahName} {currentRevisionWord.surah}:{currentRevisionWord.ayah}
                  </Text>
                  <Text style={styles.revFlipPrompt}>{isCardFlipped ? 'Tap to hide' : 'Tap to reveal answer'}</Text>
                </View>

                {/* Arabic Word */}
                <Text style={styles.revArabicText}>{currentRevisionWord.arabic}</Text>
                <Text style={styles.revTranslitText}>{currentRevisionWord.transliteration}</Text>

                {/* Answer reveal */}
                {isCardFlipped ? (
                  <View style={styles.revAnswerSection}>
                    <View style={styles.revMeaningBox}>
                      <Text style={styles.revMeaningLabel}>MEANING</Text>
                      <Text style={styles.revMeaningText}>{currentRevisionWord.english}</Text>
                    </View>

                    {currentRevisionWord.rootAr ? (
                      <View style={styles.revRootBox}>
                        <Text style={styles.revRootLabel}>ROOT</Text>
                        <Text style={styles.revRootText}>
                          {currentRevisionWord.rootAr} {currentRevisionWord.rootMeaning ? `• ${currentRevisionWord.rootMeaning}` : ''}
                        </Text>
                      </View>
                    ) : null}

                    {currentRevisionWord.grammarRole ? (
                      <Text style={styles.revGrammarText}>Role: {currentRevisionWord.grammarRole}</Text>
                    ) : null}
                  </View>
                ) : (
                  <View style={styles.revTapToRevealBox}>
                    <Ionicons name="eye-outline" size={20} color={COLORS.primary} />
                    <Text style={styles.revTapToRevealText}>Tap card to reveal English meaning & root</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Revision Controls */}
              <View style={styles.revControlsRow}>
                <TouchableOpacity
                  style={[styles.revNavBtn, revisionIndex === 0 && styles.revNavBtnDisabled]}
                  onPress={handlePrevRevisionCard}
                  disabled={revisionIndex === 0}
                >
                  <Ionicons name="arrow-back" size={18} color={revisionIndex === 0 ? COLORS.textMuted : COLORS.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.revReviewBtn}
                  onPress={() => handleNextRevisionCard(false)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh" size={16} color={COLORS.goldDark} />
                  <Text style={styles.revReviewBtnText}>Still Learning</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.revMasterBtn}
                  onPress={() => handleNextRevisionCard(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.textInverse} />
                  <Text style={styles.revMasterBtnText}>Mastered</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.revNavBtn}
                  onPress={() => handleNextRevisionCard()}
                >
                  <Ionicons name="arrow-forward" size={18} color={COLORS.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 90,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subGreeting: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  appTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 24,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  headerIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.goldSurface,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderBox: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lastReadCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  lastReadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastReadNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  lastReadNumberText: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    color: COLORS.primaryDark,
  },
  lastReadName: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  lastReadAyah: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  resumePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  resumePillText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.textInverse,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 14,
    padding: 4,
    marginTop: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  tabBtnText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  tabBtnTextActive: {
    fontFamily: FONTS.sansBold,
    color: COLORS.primaryDark,
  },
  vocabHeaderSection: {
    marginTop: 14,
    gap: 10,
  },
  vocabDeckCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  vocabDeckLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deckIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  deckSub: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  startRevisionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startRevisionBtnText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    color: COLORS.textInverse,
  },
  quickReviseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  vocabSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  vocabSearchInput: {
    flex: 1,
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textPrimary,
    padding: 0,
  },
  bookmarkCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tagBadge: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  tagBadgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    color: COLORS.primaryDark,
  },
  deleteBtn: {
    padding: 4,
  },
  arabicSnippet: {
    fontFamily: FONTS.arabicMedium,
    fontSize: 20,
    color: COLORS.textArabic,
    textAlign: 'right',
    lineHeight: 34,
    marginBottom: 6,
  },
  translationSnippet: {
    fontFamily: FONTS.sansRegular,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  vocabCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  vocabCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  vocabAyahBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  vocabAyahBadgeText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  vocabCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  masteredPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  masteredPillActive: {
    backgroundColor: COLORS.goldSurface,
  },
  masteredPillText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  masteredPillTextActive: {
    color: COLORS.goldDark,
    fontFamily: FONTS.sansSemiBold,
  },
  vocabBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  vocabTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  vocabEnglishText: {
    fontFamily: FONTS.sansBold,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  vocabTranslitText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  vocabRootRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  vocabRootPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.goldSurface,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  vocabRootText: {
    fontFamily: FONTS.sansBold,
    fontSize: 11,
    color: COLORS.goldDark,
  },
  vocabRootMeaning: {
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: COLORS.textMuted,
    flexShrink: 1,
  },
  vocabArabicBig: {
    fontFamily: FONTS.arabicBold,
    fontSize: 28,
    color: COLORS.textArabic,
    lineHeight: 46,
    textAlign: 'right',
  },
  vocabCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  vocabTapHint: {
    fontFamily: FONTS.sansRegular,
    fontSize: 11,
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    color: COLORS.textPrimary,
    marginTop: 14,
  },
  emptySub: {
    fontFamily: FONTS.sansRegular,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  historyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyNumberBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  historyNumberText: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    color: COLORS.primaryDark,
  },
  historySurahName: {
    fontFamily: FONTS.sansBold,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  historyAyahText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  historyArrowBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  // Revision Modal Styles
  revModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 11, 26, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  revContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 20,
    ...SHADOWS.lg,
  },
  revHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  revDeckCounter: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  revCounterText: {
    fontFamily: FONTS.sansBold,
    fontSize: 12,
    color: COLORS.primaryDark,
  },
  revCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revFlashcard: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 260,
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  revCardTopBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  revSurahTag: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  revFlipPrompt: {
    fontFamily: FONTS.sansSemiBold,
    fontSize: 11,
    color: COLORS.primary,
  },
  revArabicText: {
    fontFamily: FONTS.arabicBold,
    fontSize: 40,
    color: COLORS.textArabic,
    lineHeight: 64,
    textAlign: 'center',
    marginVertical: 4,
  },
  revTranslitText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  revTapToRevealBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginTop: 10,
  },
  revTapToRevealText: {
    fontFamily: FONTS.sansMedium,
    fontSize: 12,
    color: COLORS.primaryDark,
  },
  revAnswerSection: {
    width: '100%',
    gap: 10,
    marginTop: 6,
  },
  revMeaningBox: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  revMeaningLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    color: COLORS.primary,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  revMeaningText: {
    fontFamily: FONTS.sansBold,
    fontSize: 17,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  revRootBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.goldSurface,
    padding: 10,
    borderRadius: 12,
  },
  revRootLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 10,
    color: COLORS.goldDark,
    letterSpacing: 0.8,
  },
  revRootText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    color: COLORS.goldDark,
  },
  revGrammarText: {
    fontFamily: FONTS.sansRegular,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  revControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 16,
  },
  revNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revNavBtnDisabled: {
    opacity: 0.4,
  },
  revReviewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.goldSurface,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.goldBorder,
  },
  revReviewBtnText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    color: COLORS.goldDark,
  },
  revMasterBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 12,
    borderRadius: 12,
  },
  revMasterBtnText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    color: COLORS.textInverse,
  },
  dueCountBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dueCountBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
    color: '#B45309',
  },
  vocabWeakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  vocabWeakPillText: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
    color: '#DC2626',
  },
  vocabDuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  vocabDuePillText: {
    fontSize: 10,
    fontFamily: FONTS.sansBold,
    color: '#B45309',
  },
  vocabIntervalPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  vocabIntervalPillText: {
    fontSize: 10,
    fontFamily: FONTS.sansMedium,
    color: '#2563EB',
  },
  seedDeckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginTop: 18,
  },
  seedDeckBtnText: {
    fontSize: 13,
    fontFamily: FONTS.sansBold,
    color: COLORS.textInverse,
  },
  learningPathsQuickCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
});
